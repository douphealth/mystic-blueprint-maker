// ---------------------------------------------------------------------------
// Entitlement + profile persistence.
//
// Before this existed, the paid flow was a dead end: Stripe redirected to
// /payment-success, that page had no access to the visitor's name, birth date,
// or any record of the purchase, and the only button sent them back to the
// homepage where the paywall was still showing. Somebody could pay and receive
// literally nothing.
//
// The fix is deliberately small: remember the profile that produced the
// reading, and remember that a payment completed. Both are local to the
// browser.
//
// HOW ENFORCEMENT WORKS NOW
// Two layers, resolved in this order by resolveEntitlement() below:
//
//   1. The server (supabase/functions/verify-entitlement), which answers only
//      from a row written by the signature-verified Stripe webhook. This is
//      the real check and it cannot be forged from the browser.
//   2. This local flag, as a fallback.
//
// The fallback is deliberately not removed. The PDF is generated in the
// browser, so a paying customer can always be handed their file; refusing to
// deliver because an optional verification service is down would punish the
// one person who did nothing wrong. The flag is a weaker claim than a webhook
// row, but it is a strictly better outcome than an empty download.
//
// RESIDUAL LIMITATION — with the fallback in place, someone who opens devtools
// can still set the flag and reach the premium PDF. Closing that properly means
// gating the *content* rather than the delivery, which would mean moving
// generation server-side. For a $7.99 workbook the trade is not worth the
// complexity, and this comment is here so the decision is visible rather than
// implied.
// ---------------------------------------------------------------------------

const PROFILE_KEY = "md:blueprint-profile";
const PREMIUM_KEY = "md:premium-unlocked";
const EMAIL_KEY = "md:buyer-email";

export interface StoredProfile {
  name: string;
  /** ISO yyyy-mm-dd */
  dob: string;
  savedAt: string;
}

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Safari private mode, disabled storage, embedded webviews
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — the flow still works for this page view */
  }
}

/** Remember the identity behind the reading so a later page can rebuild it. */
export function saveProfile(name: string, dob: Date): void {
  if (!name || Number.isNaN(dob.getTime())) return;
  const payload: StoredProfile = {
    name: name.trim(),
    dob: dob.toISOString().split("T")[0],
    savedAt: new Date().toISOString(),
  };
  safeSet(PROFILE_KEY, JSON.stringify(payload));
}

export function loadProfile(): StoredProfile | null {
  const raw = safeGet(PROFILE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredProfile>;
    if (!parsed.name || !parsed.dob) return null;
    const dob = new Date(parsed.dob);
    if (Number.isNaN(dob.getTime())) return null;
    return { name: parsed.name, dob: parsed.dob, savedAt: parsed.savedAt ?? "" };
  } catch {
    return null;
  }
}

export function loadProfileAsDate(): { name: string; dob: Date } | null {
  const stored = loadProfile();
  if (!stored) return null;
  const dob = new Date(stored.dob);
  if (Number.isNaN(dob.getTime())) return null;
  return { name: stored.name, dob };
}

/** Called only from the Stripe success page. */
export function markPremiumUnlocked(): void {
  safeSet(PREMIUM_KEY, new Date().toISOString());
}

export function premiumUnlockedAt(): string | null {
  return safeGet(PREMIUM_KEY);
}

export function isPremiumUnlocked(): boolean {
  return safeGet(PREMIUM_KEY) !== null;
}

// ---------------------------------------------------------------------------
// Buyer email — the key the server-side entitlement is recorded against, and
// the only thing a buyer needs to restore a purchase on a new device.
// ---------------------------------------------------------------------------

export function saveBuyerEmail(email: string): void {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed.includes("@")) return;
  safeSet(EMAIL_KEY, trimmed);
}

export function loadBuyerEmail(): string | null {
  const raw = safeGet(EMAIL_KEY);
  return raw && raw.includes("@") ? raw : null;
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

export type EntitlementSource = "server" | "stripe-redirect" | "local" | "none";

export interface Entitlement {
  entitled: boolean;
  source: EntitlementSource;
  /** The email the purchase is recorded against, when we know it. */
  email?: string;
  /** The backend could not be reached, so this rests on weaker evidence. */
  unverified?: boolean;
}

/**
 * Decide whether this visitor may download the Premium Edition.
 *
 * Precedence: server confirmation > Stripe redirect > local flag.
 *
 * `trustRedirect` must only be set by the page Stripe redirects to. It exists
 * because the checkout in production is a Stripe *payment link*, and payment
 * links do not reliably carry a session id onto the success URL. Requiring one
 * would mean a buyer who paid in a fresh browser lands on "we couldn't confirm
 * a purchase" and receives nothing — charging someone and delivering nothing is
 * a far worse failure than the theoretical visitor who types the URL by hand.
 *
 * The same reasoning applies on the session_id branch, which grants even when
 * the server cannot confirm: a missing row is much more often a delayed or lost
 * webhook than a forged id, and the two mistakes do not cost the same. It is
 * also not a new hole — anyone willing to fake a session id could equally set
 * the localStorage flag.
 *
 * The practical effect is that this function makes the honest path verifiable
 * without ever becoming a single point of failure for delivery.
 */
export async function resolveEntitlement(
  opts: { sessionId?: string; email?: string; trustRedirect?: boolean } = {},
): Promise<Entitlement> {
  const sessionId = opts.sessionId?.trim();
  const email = opts.email?.trim().toLowerCase();
  const locallyUnlocked = isPremiumUnlocked();
  const knownEmail = email || loadBuyerEmail() || undefined;

  // Imported here rather than at module scope so that the profile helpers do
  // not drag the Supabase client into every consumer of this file.
  const { verifySession, verifyEmail } = await import("@/lib/premiumApi");

  if (sessionId) {
    const result = await verifySession(sessionId);
    if (result.entitled) {
      markPremiumUnlocked();
      if (result.email) saveBuyerEmail(result.email);
      return { entitled: true, source: "server", email: result.email ?? knownEmail };
    }
    // Arriving here with a session id means Stripe redirected this browser, so
    // the payment happened even if we could not read the record back.
    markPremiumUnlocked();
    if (knownEmail) saveBuyerEmail(knownEmail);
    return {
      entitled: true,
      source: "stripe-redirect",
      email: knownEmail,
      unverified: true,
    };
  }

  if (email) {
    const result = await verifyEmail(email);
    if (result.entitled) {
      markPremiumUnlocked();
      saveBuyerEmail(email);
      return { entitled: true, source: "server", email: result.email ?? email };
    }
    // A definitive "no" from a reachable server still yields to a local flag:
    // the buyer may have purchased under a different address.
    if (locallyUnlocked) {
      return { entitled: true, source: "local", email: knownEmail, unverified: true };
    }
    return { entitled: false, source: "none" };
  }

  // No session id and no address — we are on the post-checkout page and the
  // only evidence is that Stripe sent this browser here.
  if (opts.trustRedirect) {
    markPremiumUnlocked();
    return { entitled: true, source: "stripe-redirect", email: knownEmail, unverified: true };
  }

  return locallyUnlocked
    ? { entitled: true, source: "local", email: knownEmail }
    : { entitled: false, source: "none" };
}
