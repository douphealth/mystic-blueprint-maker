import { describe, it, expect } from "vitest";
import { parseIsoDateLocal } from "../lib/localDate";
import { calculateFullProfile } from "../lib/numerology";

describe("parseIsoDateLocal", () => {
  it("keeps the calendar date that was in the link", () => {
    const date = parseIsoDateLocal("1995-10-22");
    expect(date).not.toBeNull();
    expect(date!.getFullYear()).toBe(1995);
    expect(date!.getMonth()).toBe(9);
    expect(date!.getDate()).toBe(22);
  });

  it("parses at local midnight, not UTC midnight", () => {
    // This is the assertion that catches the regression.
    //
    // new Date("1995-10-22") is UTC midnight. On a machine east of UTC its
    // local hour is non-zero; on a machine west of UTC its local *date* is the
    // day before — so numerology, which reads the date with getDate(), was
    // silently handed the wrong birthday for every visitor in the Americas.
    expect(parseIsoDateLocal("1995-10-22")!.getHours()).toBe(0);
  });

  it("rejects dates that do not exist instead of rolling them over", () => {
    // new Date("2026-02-30T00:00:00") quietly becomes 2 March, which would
    // produce a confident reading for a day the visitor never entered.
    expect(parseIsoDateLocal("2026-02-30")).toBeNull();
    expect(parseIsoDateLocal("2026-02-31")).toBeNull();
    expect(parseIsoDateLocal("2026-13-01")).toBeNull();
    expect(parseIsoDateLocal("2026-00-10")).toBeNull();
  });

  it("rejects anything that is not strict YYYY-MM-DD", () => {
    const rejected = [
      "10-22-1995",
      "22/10/1995",
      "1995-10-22T00:00:00Z",
      "1995-1-2",
      "",
      "   ",
      "{{ contact.DOB_ISO }}",
      "null",
      "undefined",
    ];
    for (const bad of rejected) {
      expect(parseIsoDateLocal(bad), `expected ${JSON.stringify(bad)} to be rejected`).toBeNull();
    }
  });

  it("tolerates surrounding whitespace", () => {
    expect(parseIsoDateLocal("  1995-10-22  ")!.getDate()).toBe(22);
  });

  it("gives the same reading as the intake form for the same date", () => {
    // The link path and the typed path have to agree. Before the fix they did
    // not, and only the link path was wrong.
    const viaLink = parseIsoDateLocal("1995-10-22")!;
    const viaIntake = new Date("1995-10-22T00:00:00");
    expect(calculateFullProfile("Jane Doe", viaLink)).toEqual(
      calculateFullProfile("Jane Doe", viaIntake),
    );
  });
});
