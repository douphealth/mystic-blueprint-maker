import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

/**
 * Checks whether a Premium Edition entitlement exists.
 *
 * Two lookup modes:
 *   { session_id }  — used on /payment-success. Proves that this specific
 *                     checkout completed, and returns the buyer's email so the
 *                     client can remember it.
 *   { email }       — the "restore my purchase" path, for a buyer who cleared
 *                     their browser or switched device.
 *
 * Runs with the service role because the entitlements table has RLS enabled and
 * no client-facing policies.
 *
 * Privacy note: the email path will confirm whether a given address has
 * purchased. For a $7.99 workbook that is an acceptable trade for not
 * permanently locking out paying customers, but it is a deliberate choice
 * rather than an oversight. If that ever matters, add a per-IP rate limit or
 * switch the restore path to an emailed magic link.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRODUCT = "premium_blueprint";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body?.session_id === "string" ? body.session_id.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!sessionId && !email) {
      return json({ entitled: false, reason: "no_session_or_email" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    let query = supabase
      .from("entitlements")
      .select("email, product, status, created_at")
      .eq("product", PRODUCT)
      .eq("status", "active")
      .limit(1);

    if (sessionId) {
      query = query.eq("stripe_session_id", sessionId);
    } else {
      query = query.eq("email", email);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Entitlement lookup failed:", error.message);
      // fail closed for the boolean, but the client keeps its local flag as a
      // fallback so a Supabase outage cannot lock out a paying customer
      return json({ entitled: false, reason: "lookup_error" }, 200);
    }

    const row = data?.[0];
    if (!row) {
      return json({ entitled: false, reason: "not_found" }, 200);
    }

    return json({ entitled: true, email: row.email, granted_at: row.created_at }, 200);
  } catch (error) {
    console.error("verify-entitlement error:", (error as Error).message);
    return json({ entitled: false, reason: "unexpected" }, 200);
  }
});
