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
    dob: (() => {
      const year = dob.getFullYear();
      const month = String(dob.getMonth() + 1).padStart(2, "0");
      const day = String(dob.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    })(),
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
    const [year, month, day] = parsed.dob.split("-").map(Number);
    const dob = new Date(year, month - 1, day);
    if (
      Number.isNaN(dob.getTime()) ||
      dob.getFullYear() !== year ||
      dob.getMonth() + 1 !== month ||
      dob.getDate() !== day
    ) return null;
    return { name: parsed.name, dob: parsed.dob, savedAt: parsed.savedAt ?? "" };
  } catch {
    return null;
  }
}

export function loadProfileAsDate(): { name: string; dob: Date } | null {
  const stored = loadProfile();
  if (!stored) return null;
  const [year, month, day] = stored.dob.split("-").map(Number);
  const dob = new Date(year, month - 1, day);
  if (
    Number.isNaN(dob.getTime()) ||
    dob.getFullYear() !== year ||
    dob.getMonth() + 1 !== month ||
    dob.getDate() !== day
  ) return null;
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

export type EntitlementSource = "server" | "none";

export interface Entitlement {
  entitled: boolean;
  source: EntitlementSource;
  email?: string;
  reason?: string;
}

/**
 * Premium access is granted only after the backend confirms a Stripe-backed
 * entitlement. URL shape and localStorage are never treated as proof of payment.
 */
export async function resolveEntitlement(
  opts: { sessionId?: string; email?: string } = {},
): Promise<Entitlement> {
  const sessionId = opts.sessionId?.trim();
  const email = opts.email?.trim().toLowerCase();
  const { verifySession, verifyEmail } = await import("@/lib/premiumApi");

  if (sessionId) {
    const result = await verifySession(sessionId);
    if (result.entitled) {
      markPremiumUnlocked();
      if (result.email) saveBuyerEmail(result.email);
      return { entitled: true, source: "server", email: result.email ?? email };
    }
    return { entitled: false, source: "none", reason: result.reason ?? "unverified_session" };
  }

  if (email) {
    const result = await verifyEmail(email);
    if (result.entitled) {
      markPremiumUnlocked();
      saveBuyerEmail(result.email ?? email);
      return { entitled: true, source: "server", email: result.email ?? email };
    }
    return { entitled: false, source: "none", reason: result.reason ?? "not_found" };
  }

  return { entitled: false, source: "none", reason: "no_verification_identity" };
}
