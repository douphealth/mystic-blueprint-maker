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
// WHO THE BACKEND IS NOW
// The original backend was a Supabase project (ref pqrnobnniqfxysztjrgo) that
// no longer resolves in public DNS — NXDOMAIN from both the Cloudflare and the
// Google resolvers, exactly like a made-up ref. Every functions.invoke() against
// it failed at DNS, so entitlement could never be confirmed server-side and
// restore-by-email could never work.
//
// The backend is now this site's own WordPress install, which already holds the
// lead pipeline, the email sequence, and an entitlement store written by a
// signature-verified Stripe webhook. See wpBackend.ts for the transport.
//
// The fallback chain is unchanged and still ends at the static Stripe link, so a
// visitor is never shown a network error they cannot act on.
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
// About 12 seconds in all. Stripe usually delivers the webhook within a few
// seconds; past this the page offers "check again" instead of waiting longer.
const VERIFY_ATTEMPTS = 8;
const VERIFY_BACKOFF_MS = 1_500;

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
  /** Order details for the success page, when the server sends them. */
  receipt?: WpReceipt;
}

export interface CheckoutResult {
  url: string;
  /**
   * "server" = checkout URL from our backend, "link" = static fallback,
   * "restore_sent" = this address already owns the Premium Edition and the
   * server emailed it an unlock link instead of opening a second checkout.
   */
  mode: "server" | "link" | "restore_sent";
}

/** Shown when checkout recognised an existing buyer and emailed them instead. */
export const RESTORE_SENT_NOTICE =
  "You already own the Premium Edition. We've emailed you a one-time link that unlocks it in this browser. Check your inbox (and spam folder).";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Imported lazily by the callers below, so entitlement and checkout carry no
 * static dependency on any particular backend host.
 */
import type { WpVerifyPayload, WpReceipt } from "./wpBackend";

/** One attempt at asking the backend. Throws only on transport failure. */
async function askOnce(body: Record<string, string>): Promise<VerifyResult> {
  const { wpVerifyEntitlement } = await import("./wpBackend");
  const { data, error } = await wpVerifyEntitlement(body, VERIFY_TIMEOUT_MS);

  if (error) {
    return { entitled: false, inconclusive: true, reason: "transport" };
  }
  if (data?.entitled === true) {
    return { entitled: true, email: data.email, inconclusive: false, receipt: data.receipt };
  }
  // The backend tells us plainly when it could not reach a verdict; trust that
  // over inferring "not found" from a missing field.
  if ((data as WpVerifyPayload | null)?.inconclusive === true) {
    return { entitled: false, inconclusive: true, reason: data?.reason ?? "inconclusive" };
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
 * Confirm a one-time unlock token from a restore email. The token is signed by
 * the server and names the purchase, so it proves the visitor can read the
 * buyer's inbox, which an email address typed into a form does not.
 */
export function verifyRestoreToken(token: string): Promise<VerifyResult> {
  const trimmed = token.trim();
  if (!trimmed) {
    return Promise.resolve({ entitled: false, inconclusive: false, reason: "no_token" });
  }
  return ask({ token: trimmed }, 1);
}

export type RestoreRequestResult =
  /** The server will email a link if the address has a purchase. */
  | { kind: "link_sent" }
  /** The server is older and still answers an email lookup directly. */
  | { kind: "legacy"; result: VerifyResult }
  /** Could not reach the server. */
  | { kind: "unreachable" };

/**
 * "I already paid": ask the server to email an unlock link.
 *
 * Until the request-restore route is deployed the server answers 404, and we
 * fall back to the older direct email lookup, so this client works against
 * both versions of the backend.
 */
export async function requestRestoreLink(email: string): Promise<RestoreRequestResult> {
  const trimmed = email.trim().toLowerCase();
  try {
    const { wpRequestRestore } = await import("./wpBackend");
    const { data, error } = await wpRequestRestore({ email: trimmed }, VERIFY_TIMEOUT_MS);
    if (!error && data?.ok) return { kind: "link_sent" };
    if (error?.message === "http_404") {
      return { kind: "legacy", result: await verifyEmail(trimmed) };
    }
    return { kind: "unreachable" };
  } catch {
    return { kind: "unreachable" };
  }
}

/**
 * The older restore path: look a purchase up by email. The current backend
 * declines this (reason "use_restore_link"); kept for the rollout window.
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
    const { wpCreatePayment } = await import("./wpBackend");
    const { data, error } = await wpCreatePayment(
      { email: prefilled },
      CHECKOUT_TIMEOUT_MS,
    );

    if (!error && data?.mode === "restore_sent") {
      // This address already bought it. The server emailed an unlock link
      // rather than opening a second checkout or unlocking on the email alone.
      return { url: data.url ?? "", mode: "restore_sent" };
    }
    if (!error && typeof data?.url === "string" && data.url.startsWith("http")) {
      // Older backend: an already-entitled buyer gets a restore URL instead of
      // a checkout, so a returning purchaser is never charged twice.
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
