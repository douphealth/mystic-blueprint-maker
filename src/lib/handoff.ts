// ---------------------------------------------------------------------------
// Handoff from the free Life Path calculator on mysticaldigits.com.
//
// The calculator (life-path.mysticaldigits.com → mysticaldigits.com/
// life-path-number-calculator/) already has the visitor's birth date. Its
// Blueprint button links here with the date in the URL *fragment*:
//
//   https://blueprint.mysticaldigits.com/?utm_...#dob=1985-03-21
//
// A fragment is never sent to a server and never appears in a Referer header,
// so the birth date does not end up in access logs, analytics or third-party
// requests. We read it once and then remove it from the address bar.
//
// `?dob=` in the query string is still accepted for older links.
//
// The free-Blueprint email links back the same way, with the name as well:
//
//   https://blueprint.mysticaldigits.com/#name=Grace%20Moore&dob=1985-03-21&from=email
//
// That visitor already gave us their email, so the reading opens directly.
// ---------------------------------------------------------------------------

import { parseIsoDateLocal } from "./localDate";

export interface Handoff {
  /** ISO yyyy-mm-dd, already validated as a real calendar date. */
  dob?: string;
  /** Full birth name, only on links from our own email. */
  name?: string;
  /** Where the visitor came from, for the notice wording. */
  from?: "calculator" | "email";
}

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

function cleanDob(raw: string | null | undefined): string | undefined {
  const value = (raw ?? "").trim();
  if (!ISO_RE.test(value)) return undefined;
  const date = parseIsoDateLocal(value);
  if (!date) return undefined;
  const year = date.getFullYear();
  // Same range the calculator accepts; also rules out a future date.
  if (year < 1900 || date.getTime() > Date.now()) return undefined;
  return value;
}

/** Read the handoff fragment, if any. Pure: does not touch history. */
export function readHandoff(loc: Pick<Location, "hash"> = window.location): Handoff {
  const hash = loc.hash.startsWith("#") ? loc.hash.slice(1) : loc.hash;
  if (!hash) return {};
  const params = new URLSearchParams(hash);
  const dob = cleanDob(params.get("dob"));
  if (!dob) return {};
  const from = params.get("from");
  if (from === "email") {
    const name = cleanName(params.get("name"));
    return name ? { dob, name, from: "email" } : { dob };
  }
  return { dob, from: from === "calculator" ? "calculator" : undefined };
}

function cleanName(raw: string | null | undefined): string | undefined {
  const value = (raw ?? "").replace(/\s+/g, " ").trim();
  if (!value || value.length > 120) return undefined;
  // Letters (any script), spaces, hyphens, apostrophes and dots only.
  return /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u.test(value) ? value : undefined;
}

/** Remove the fragment so a shared or bookmarked URL does not carry the date. */
export function clearHandoffFromUrl(): void {
  try {
    if (!window.location.hash) return;
    const { pathname, search } = window.location;
    window.history.replaceState(window.history.state, "", pathname + search);
  } catch {
    /* history unavailable (sandboxed iframe) — harmless */
  }
}

export { cleanDob as cleanHandoffDob };
