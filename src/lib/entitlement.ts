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
//   1. The server (WordPress mdx/v1/verify-entitlement), which answers only
//      from a row written by the signature-verified Stripe webhook. This is
//      the real check and it cannot be forged from the browser.
//   2. This local flag, which is set only after (1) has confirmed a purchase
//      in this browser, so a buyer is not re-checked on every visit.
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

import { formatIsoDateLocal, parseIsoDateLocal } from "./localDate";

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
    dob: formatIsoDateLocal(dob),
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
    if (!parseIsoDateLocal(parsed.dob)) return null;
    return { name: parsed.name, dob: parsed.dob, savedAt: parsed.savedAt ?? "" };
  } catch {
    return null;
  }
}

export function loadProfileAsDate(): { name: string; dob: Date } | null {
  const stored = loadProfile();
  if (!stored) return null;
  // Local midnight, so getDate() answers with the day that was saved.
  const dob = parseIsoDateLocal(stored.dob);
  if (!dob) return null;
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

export type EntitlementSource = "server" | "local" | "none";

export interface Entitlement {
  entitled: boolean;
  source: EntitlementSource;
  /** The email the purchase is recorded against, when we know it. */
  email?: string;
  /** The backend could not be reached, so this rests on weaker evidence. */
  unverified?: boolean;
  /** A session id was given but is not confirmed yet; worth checking again. */
  pending?: boolean;
  /** The backend could not be reached at all. */
  inconclusive?: boolean;
  /** Order details from the server, for the receipt on the success page. */
  receipt?: Receipt;
}

export interface Receipt {
  amount_total?: number;
  currency?: string;
  purchased_at?: string;
}

/**
 * Decide whether this visitor may download the Premium Edition.
 *
 * Precedence: server confirmation > local flag.
 *
 * Since 2026-11-22 the Stripe payment link redirects to
 * /payment-success?session_id={CHECKOUT_SESSION_ID}, and a signed webhook
 * records every paid session of that link on the WordPress backend. So the
 * success page no longer has to trust a bare visit: it unlocks only when the
 * backend confirms the session id. A session that is not confirmed yet (the
 * webhook is a few seconds behind, or the backend is unreachable) is reported
 * as `pending`, and the page offers to check again rather than unlocking or
 * declining outright.
 */
export async function resolveEntitlement(
  opts: { sessionId?: string; email?: string; restoreToken?: string } = {},
): Promise<Entitlement> {
  const restoreToken = opts.restoreToken?.trim();
  if (restoreToken) {
    const { verifyRestoreToken } = await import("@/lib/premiumApi");
    const result = await verifyRestoreToken(restoreToken);
    if (result.entitled) {
      markPremiumUnlocked();
      if (result.email) saveBuyerEmail(result.email);
      return { entitled: true, source: "server", email: result.email, receipt: result.receipt };
    }
    if (isPremiumUnlocked()) {
      return { entitled: true, source: "local", email: loadBuyerEmail() ?? undefined, unverified: true };
    }
    return { entitled: false, source: "none", inconclusive: result.inconclusive };
  }

  const sessionId = opts.sessionId?.trim();
  const email = opts.email?.trim().toLowerCase();
  const locallyUnlocked = isPremiumUnlocked();
  const knownEmail = email || loadBuyerEmail() || undefined;

  // Imported here rather than at module scope so that the profile helpers do
  // not pull the backend client into every consumer of this file.
  const { verifySession, verifyEmail } = await import("@/lib/premiumApi");

  if (sessionId) {
    const result = await verifySession(sessionId);
    if (result.entitled) {
      markPremiumUnlocked();
      if (result.email) saveBuyerEmail(result.email);
      return { entitled: true, source: "server", email: result.email ?? knownEmail, receipt: result.receipt };
    }
    // Not confirmed. Never unlock on an unconfirmed id: anyone can type one.
    // A browser that already holds a confirmed purchase keeps it.
    if (locallyUnlocked) {
      return { entitled: true, source: "local", email: knownEmail, unverified: true };
    }
    return { entitled: false, source: "none", pending: true, inconclusive: result.inconclusive };
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
    return { entitled: false, source: "none", inconclusive: result.inconclusive };
  }

  return locallyUnlocked
    ? { entitled: true, source: "local", email: knownEmail }
    : { entitled: false, source: "none" };
}
