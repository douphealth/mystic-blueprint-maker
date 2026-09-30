import { describe, it, expect } from "vitest";
import { formatIsoDateLocal, parseIsoDateLocal } from "../lib/localDate";
import { loadProfile, loadProfileAsDate, saveProfile } from "../lib/entitlement";
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

describe("formatIsoDateLocal", () => {
  it("writes the calendar day the visitor picked, whatever the timezone", () => {
    // toISOString().split("T")[0] returned 1990-05-14 for this date east of UTC.
    expect(formatIsoDateLocal(new Date(1990, 4, 15))).toBe("1990-05-15");
    expect(formatIsoDateLocal(new Date(2000, 0, 1))).toBe("2000-01-01");
    expect(formatIsoDateLocal(new Date(1985, 11, 31))).toBe("1985-12-31");
  });

  it("round-trips with parseIsoDateLocal for every day from 1900 to 2030", () => {
    // Walks every DST change in the runtime's zone, which is where a
    // subtract-a-day bug shows up.
    for (let y = 1900; y <= 2030; y++)
      for (let m = 0; m < 12; m++)
        for (let d = 1; d <= 31; d++) {
          const date = new Date(y, m, d);
          if (date.getMonth() !== m) continue;
          const iso = formatIsoDateLocal(date);
          const back = parseIsoDateLocal(iso);
          expect(back?.getFullYear()).toBe(y);
          expect(back?.getMonth()).toBe(m);
          expect(back?.getDate()).toBe(d);
        }
  });
});

describe("saved profile (what the paid flow rebuilds the reading from)", () => {
  it("keeps the birth day the visitor chose", () => {
    window.localStorage.clear();
    saveProfile("Amara Nightingale", new Date(1990, 4, 15));
    expect(loadProfile()?.dob).toBe("1990-05-15");
    const restored = loadProfileAsDate();
    expect(restored?.dob.getFullYear()).toBe(1990);
    expect(restored?.dob.getMonth()).toBe(4);
    // 14 east of UTC (saved wrong) and 14 west of UTC (read back wrong) before the fix
    expect(restored?.dob.getDate()).toBe(15);
  });

  it("refuses a stored date that is not a real calendar day", () => {
    window.localStorage.setItem(
      "md:blueprint-profile",
      JSON.stringify({ name: "Someone", dob: "2026-02-31", savedAt: "" }),
    );
    expect(loadProfile()).toBeNull();
    expect(loadProfileAsDate()).toBeNull();
  });
});
