/**
 * Birth dates have to be read as *local* midnight, everywhere.
 *
 * The reason is that numerology reads a birth date with the local getters —
 * `getDate()`, `getMonth()`, `getFullYear()` — and those answer in the
 * runtime's timezone, not UTC.
 *
 * `new Date("1995-10-22")` is parsed as **UTC** midnight. For a visitor west of
 * UTC that instant falls on 21 October locally, so `getDate()` returns 21 and
 * every number derived from the day — Birthday, the day component of the Life
 * Path, Personal Year and Personal Month — is computed from the wrong date.
 * The reading still renders, so nothing looks broken; it is simply wrong.
 *
 * Appending a time (`"1995-10-22T00:00:00"`) makes the string parse as local
 * time instead, and removes the shift entirely. That is what the intake form
 * has always done, which is why a visitor who typed their date got a correct
 * reading while a visitor who clicked a personalised email link did not.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse a strict `YYYY-MM-DD` string as local midnight.
 * Returns `null` for anything that is not a real calendar date, so callers can
 * recover instead of rendering a reading built on `Invalid Date`.
 */
export function parseIsoDateLocal(iso: string): Date | null {
  const trimmed = iso.trim();
  if (!ISO_DATE.test(trimmed)) return null;

  const date = new Date(`${trimmed}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  // `new Date("2026-02-31T00:00:00")` rolls over to 3 March rather than
  // failing, so confirm the parts survived the round trip.
  const [year, month, day] = trimmed.split("-").map(Number);
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}
