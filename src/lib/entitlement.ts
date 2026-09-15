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
// KNOWN LIMITATION — this is client-side gating, so it is enforceable only in
// the sense that a casual visitor will not stumble past it. Anyone who opens
// devtools can set the flag. Proper enforcement needs a server-side check
// (a Stripe webhook writing an entitlement row keyed to an email or session,
// verified before the premium PDF is served). That is a follow-up, not
// something this change pretends to solve.
// ---------------------------------------------------------------------------

const PROFILE_KEY = "md:blueprint-profile";
const PREMIUM_KEY = "md:premium-unlocked";

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
