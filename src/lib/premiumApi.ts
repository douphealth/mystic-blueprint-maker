// ---------------------------------------------------------------------------
// Premium backend client.
//
// WHAT A SERVER IS ACTUALLY FOR HERE
// The Premium Edition PDF is generated entirely in the browser, so *delivery*
// never needs a server. The only thing a backend adds is proof: it can confirm
// that this visitor really paid, instead of trusting a flag in localStorage
// that anyone can set from devtools.
//
// So this module is written as a progressive enhancement rather than a
// dependency:
//
//   * every call is optional and time-boxed
//   * a failed call is reported as "inconclusive", never as "not entitled"
//   * a paying customer is never blocked from their file by a network problem
//
// WHY THE DEFENSIVENESS IS NOT THEORETICAL
// The project ref in supabase/config.toml (pqrnobnniqfxysztjrgo) does not
// resolve in public DNS — it returns NXDOMAIN from both the Cloudflare and the
// Google resolvers, exactly like a made-up ref. The Supabase project behind it
// is gone, so every functions.invoke() against it fails.
//
// That means the premium checkout button could not have worked in production.
// Rather than hard-depend on a host that may not exist, checkout falls back to
// the Stripe payment link the live site was already using, so the button keeps
// working today and upgrades itself the moment a real backend is configured.
// ---------------------------------------------------------------------------

/** The Stripe payment link the live site already uses. Last-resort checkout. */
export const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/4gM4gz75C4CI1g9bn8ejK03";

/** How long an optional backend call may take before we give up on it. */
const VERIFY_TIMEOUT_MS = 6_000;
const CHECKOUT_TIMEOUT_MS = 4_000;

/**
 * The Stripe webhook that grants an entitlement and the browser landing on
 * /payment-success do not happen in a guaranteed order — Stripe redirects
 * immediately and delivers the webhook alongside. A "not found" in the first
 * second is therefore not evidence of anything, so we re-ask a few times.
 */
const VERIFY_ATTEMPTS = 4;
const VERIFY_BACKOFF_MS = 900;

export interface VerifyResult {
  entitled: boolean;
  /** Present only when the backend confirmed the purchase. */
  email?: string;
  /**
   * True when the check could not be completed — dead host, offline, timeout,
   * bad key. This is explicitly NOT the same as "not entitled", and callers
   * must not treat it as such.
   */
  inconclusive: boolean;
  /** Server-supplied explanation, useful for diagnostics. */
  reason?: string;
}

export interface CheckoutResult {
  url: string;
  /** "server" = session created by our edge function, "link" = static fallback. */
  mode: "server" | "link";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Reject rather than hang. A dead host must not stall the page. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/**
 * Imported rather than required at module scope, to keep this optional path
 * from creating a static dependency edge from the entitlement helpers into the
 * Supabase client.
 *
 * Note this does not shrink the bundle: the client is already statically
 * imported by AuthContext and Index, so Vite keeps it in the main chunk and
 * says as much during the build. The win here is a cleaner module graph, not
 * fewer bytes.
 */
async function getClient() {
  const { supabase } = await import("@/integrations/supabase/client");
  return supabase;
}

/** One attempt at asking the backend. Throws only on transport failure. */
async function askOnce(body: Record<string, string>): Promise<VerifyResult> {
  const supabase = await getClient();
  const { data, error } = await withTimeout(
    supabase.functions.invoke("verify-entitlement", { body }),
    VERIFY_TIMEOUT_MS,
  );

  if (error) {
    return { entitled: false, inconclusive: true, reason: "transport" };
  }
  if (data?.entitled === true) {
    return { entitled: true, email: data.email, inconclusive: false };
  }
  // A definitive answer from a reachable server, but possibly a race with the
  // webhook — the caller decides whether to retry.
  return { entitled: false, inconclusive: false, reason: data?.reason ?? "not_found" };
}

async function ask(body: Record<string, string>, attempts: number): Promise<VerifyResult> {
  let last: VerifyResult = { entitled: false, inconclusive: true, reason: "unreachable" };

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      last = await askOnce(body);
    } catch {
      // Network error, timeout, or the host does not resolve at all.
      return { entitled: false, inconclusive: true, reason: "unreachable" };
    }

    if (last.entitled || last.inconclusive) return last;
    // Reachable but nothing on record yet — give the webhook a moment.
    if (attempt < attempts - 1) await sleep(VERIFY_BACKOFF_MS);
  }

  return last;
}

/**
 * Confirm that a specific Stripe checkout completed. This is the strong check:
 * a session id only exists because Stripe created it, and the row only exists
 * because the webhook verified the payment.
 */
export function verifySession(sessionId: string): Promise<VerifyResult> {
  const trimmed = sessionId.trim();
  if (!trimmed) {
    return Promise.resolve({ entitled: false, inconclusive: true, reason: "no_session" });
  }
  return ask({ session_id: trimmed }, VERIFY_ATTEMPTS);
}

/**
 * The restore path: a buyer who cleared their browser or changed device looks
 * up their purchase by the address they paid with.
 */
export function verifyEmail(email: string): Promise<VerifyResult> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed.includes("@")) {
    return Promise.resolve({ entitled: false, inconclusive: false, reason: "invalid_email" });
  }
  // No webhook race here — the payment is long settled.
  return ask({ email: trimmed }, 1);
}

/**
 * Begin checkout.
 *
 * Tries the edge function first, because that path returns a session id on the
 * success URL and therefore enables real server-side verification. If the
 * backend is unreachable or unconfigured — which is the case today — it falls
 * back to the static Stripe payment link instead of surfacing an error the
 * visitor cannot act on.
 */
export async function startCheckout(email?: string): Promise<CheckoutResult> {
  const cleanEmail = email?.trim().toLowerCase();
  const prefilled = cleanEmail && cleanEmail.includes("@") ? cleanEmail : undefined;

  try {
    const supabase = await getClient();
    const { data, error } = await withTimeout(
      supabase.functions.invoke("create-payment", { body: { email: prefilled } }),
      CHECKOUT_TIMEOUT_MS,
    );

    if (!error && typeof data?.url === "string" && data.url.startsWith("http")) {
      return { url: data.url, mode: "server" };
    }
  } catch {
    // fall through to the static link
  }

  // Stripe payment links accept prefilled_email, so the buyer still does not
  // have to retype the address the email gate already captured.
  const url = prefilled
    ? `${STRIPE_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(prefilled)}`
    : STRIPE_PAYMENT_LINK;

  return { url, mode: "link" };
}
