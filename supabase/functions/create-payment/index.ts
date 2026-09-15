import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const body = await req.json().catch(() => ({}));

    // The email gate already captured the address before this is called, so
    // prefilling it removes a redundant step at checkout AND guarantees the
    // address the webhook keys the entitlement on is one the buyer recognises.
    const emailFromBody =
      typeof body?.email === "string" && body.email.includes("@")
        ? body.email.trim().toLowerCase()
        : undefined;

    // Try to get authenticated user (optional - supports guest checkout)
    let userEmail: string | undefined;
    const authHeader = req.headers.get("Authorization");

    if (authHeader?.startsWith("Bearer ")) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      userEmail = data.user?.email;
    }

    const email = userEmail ?? emailFromBody;

    // Check for existing Stripe customer
    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Prefer an explicitly configured site URL over the request Origin header,
    // which any caller can set. Falling back to Origin keeps local development
    // working without extra configuration.
    const siteUrl = Deno.env.get("SITE_URL") ?? req.headers.get("origin") ?? "";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      client_reference_id: "premium_blueprint",
      line_items: [
        {
          price: "price_1THmEhGCqwm95OGXkduBlzY4",
          quantity: 1,
        },
      ],
      mode: "payment",
      // The session id comes back on the success URL so /payment-success can ask
      // verify-entitlement to confirm THIS checkout completed, rather than
      // trusting a client-side flag.
      success_url: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/payment-canceled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
