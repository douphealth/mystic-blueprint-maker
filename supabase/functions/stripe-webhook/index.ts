import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

/**
 * Stripe webhook — the only writer of the entitlements table.
 *
 * Deploy with signature verification ON. A webhook endpoint that trusts its
 * own request body would let anyone POST themselves a paid product, which is
 * worse than the localStorage flag this replaces.
 *
 * Required secrets:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET      (from `stripe listen` locally, or the endpoint's
 *                               signing secret in the Stripe dashboard)
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (auto-injected in the Supabase runtime)
 *
 * Configure the endpoint in Stripe to send: checkout.session.completed
 */

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const PRODUCT = "premium_blueprint";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !secret) {
    console.error("Webhook rejected: missing signature header or webhook secret");
    return new Response("Missing signature", { status: 400 });
  }

  // the raw body is required — parsing it first would invalidate the signature
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, secret);
  } catch (err) {
    console.error("Webhook signature verification failed:", (err as Error).message);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // only grant on a genuinely paid session
      if (session.payment_status !== "paid") {
        console.log(`Session ${session.id} not paid (${session.payment_status}); ignoring`);
        return new Response(JSON.stringify({ received: true, granted: false }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      }

      const email =
        session.customer_details?.email ?? session.customer_email ?? null;

      if (!email) {
        // nothing to key the entitlement on — log loudly, do not 500, or Stripe
        // will retry forever on an event that can never succeed
        console.error(`Session ${session.id} has no email; cannot grant`);
        return new Response(JSON.stringify({ received: true, granted: false }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );

      const { error } = await supabase.from("entitlements").upsert(
        {
          email: email.toLowerCase(),
          product: PRODUCT,
          stripe_session_id: session.id,
          stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
          stripe_payment_intent:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
          amount_total: session.amount_total,
          currency: session.currency,
          status: "active",
        },
        // stripe_session_id is UNIQUE, so a Stripe retry is a no-op rather than
        // a duplicate entitlement
        { onConflict: "stripe_session_id", ignoreDuplicates: false },
      );

      if (error) {
        console.error("Failed to write entitlement:", error.message);
        // 500 so Stripe retries — this one is genuinely retryable
        return new Response("Failed to persist entitlement", { status: 500 });
      }

      console.log(`Granted ${PRODUCT} to ${email} (session ${session.id})`);
      return new Response(JSON.stringify({ received: true, granted: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (event.type === "charge.refunded") {
      // revoke rather than delete, so support can see what happened
      const charge = event.data.object as Stripe.Charge;
      const intent = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
      if (intent) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        );
        const { error } = await supabase
          .from("entitlements")
          .update({ status: "refunded" })
          .eq("stripe_payment_intent", intent);
        if (error) console.error("Failed to revoke on refund:", error.message);
        else console.log(`Revoked entitlement for payment intent ${intent}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook handler error:", (error as Error).message);
    return new Response("Handler error", { status: 500 });
  }
});
