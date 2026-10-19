// Only the server can validate purchases. Local storage holds profile data, not authority.
const PROFILE_KEY = "md:blueprint-profile";
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

/** Never use browser storage as an entitlement authority. */
export function isPremiumUnlocked(): boolean { return false; }

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

export interface Entitlement {
  entitled: boolean;
  source: "server" | "none";
  email?: string;
  inconclusive?: boolean;
}

/** A Stripe redirect, a session ID, an email, or old localStorage flags NEVER grant access. */
export async function resolveEntitlement(opts: { sessionId?: string; email?: string } = {}): Promise<Entitlement> {
  const { verifySession } = await import("@/lib/premiumApi");
  const result = await verifySession(opts.sessionId);
  if (result.entitled && result.verified) {
    if (result.email) saveBuyerEmail(result.email);
    return { entitled: true, source: "server", email: result.email };
  }
  return { entitled: false, source: "none", inconclusive: result.inconclusive };
}
