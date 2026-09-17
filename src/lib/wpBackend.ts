// ---------------------------------------------------------------------------
// WordPress entitlement backend.
//
// WHY THIS FILE EXISTS
// Premium backend calls used to go through the Supabase client, pointed at
// project ref `pqrnobnniqfxysztjrgo`. That project no longer exists — it returns
// NXDOMAIN from both public resolvers, so every `functions.invoke()` failed at
// DNS. Entitlement could never be confirmed server-side and restore-by-email
// could never work, which meant a buyer's only proof of purchase was a
// localStorage flag.
//
// This site already owns the data it needs — the WordPress install on the same
// domain already runs the lead pipeline, the email sequence, and (since
// 2026-09-16) an entitlement store with a signature-verified Stripe webhook.
// So there is no reason for a second backend. We call the site that the visitor
// is already on.
//
// The contract is unchanged. Only the transport differs:
//   POST /wp-json/mdx/v1/verify-entitlement  { session_id? | email? }
//        -> { entitled, email?, reason? }
//   POST /wp-json/mdx/v1/create-payment      { email? }
//        -> { url, mode?, entitled? }
//
// The defensive semantics in premiumApi.ts are preserved exactly: every call is
// optional, time-boxed, and a transport failure is reported as "inconclusive"
// rather than "not entitled".
// ---------------------------------------------------------------------------

export const WP_API_BASE = "https://mysticaldigits.com/wp-json/mdx/v1";

interface WpResponse<T> {
  data: T | null;
  /** Non-null only on a transport-level failure, mirroring the Supabase shape. */
  error: { message: string } | null;
}

/**
 * POST to a WordPress route with a hard timeout.
 *
 * Returns `error` instead of throwing on network failure so callers can keep the
 * same control flow they had with `supabase.functions.invoke`.
 *
 * `keepalive` matters here: the success page fires this during teardown, and
 * without it a fast redirect can cancel the request in flight.
 */
async function wpPost<T>(path: string, body: unknown, timeoutMs: number): Promise<WpResponse<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${WP_API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
      signal: controller.signal,
      keepalive: true,
      // The entitlement store must never be served from an edge cache.
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: null, error: { message: `http_${res.status}` } };
    }

    const json = (await res.json().catch(() => null)) as T | null;
    if (json === null) {
      // Unparseable body is inconclusive, not a "no".
      return { data: null, error: { message: "bad_json" } };
    }
    return { data: json, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "network";
    return { data: null, error: { message } };
  } finally {
    clearTimeout(timer);
  }
}

export interface WpVerifyPayload {
  entitled?: boolean;
  email?: string;
  reason?: string;
  inconclusive?: boolean;
  source?: string;
}

export interface WpPaymentPayload {
  url?: string;
  mode?: string;
  entitled?: boolean;
}

/** Ask whether a session or email is entitled. */
export function wpVerifyEntitlement(
  body: { session_id?: string; email?: string },
  timeoutMs: number,
): Promise<WpResponse<WpVerifyPayload>> {
  return wpPost<WpVerifyPayload>("/verify-entitlement", body, timeoutMs);
}

/** Ask for a checkout URL (or a restore URL when already entitled). */
export function wpCreatePayment(
  body: { email?: string },
  timeoutMs: number,
): Promise<WpResponse<WpPaymentPayload>> {
  return wpPost<WpPaymentPayload>("/create-payment", body, timeoutMs);
}
