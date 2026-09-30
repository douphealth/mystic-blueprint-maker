import { describe, it, expect } from "vitest";
import {
  calculateChallenges,
  calculateFullProfile,
  calculateKarmicDebt,
  calculatePinnacles,
} from "../lib/numerology";
import { challengeReadings, pinnacleReadings } from "../lib/premiumContent";

/** Every real calendar date in [from, to], built at local midnight. */
function* eachDate(from: number, to: number) {
  for (let y = from; y <= to; y++)
    for (let m = 0; m < 12; m++)
      for (let d = 1; d <= 31; d++) {
        const date = new Date(y, m, d);
        if (date.getMonth() === m) yield date;
      }
}

describe("karmic debt", () => {
  it("does not flag a plain 7 as Karmic Debt 16", () => {
    // Destiny 7 here comes from 52 -> 7. It never passes through 16, and the
    // old check reported Karmic Debt 16 for every 7 (and 13/14/19 for 4, 5, 1).
    const profile = calculateFullProfile("QA Test Person", new Date(1990, 4, 15));
    expect(profile.expression).toBe(7);
    expect(profile.karmicDebt).toEqual([]);
  });

  it("finds a debt when the name total passes through 14", () => {
    // A(1) I(9) M(4) = 14 -> 5. Vowels 10 -> 1, consonants 4: nothing else fires.
    expect(calculateKarmicDebt(new Date(2000, 0, 1), "Aim")).toEqual([14]);
  });

  it("finds a debt in the Life Path total", () => {
    // 6 May 2003: month 5 + day 6 + year (2003 -> 5) = 16 -> 7
    expect(calculateKarmicDebt(new Date(2003, 4, 6), "")).toEqual([16]);
    // 9 Sep 1990: 9 + 9 + (1990 -> 1) = 19 -> 10 -> 1
    expect(calculateKarmicDebt(new Date(1990, 8, 9), "")).toEqual([19]);
  });

  it("finds a debt from the birth day", () => {
    expect(calculateKarmicDebt(new Date(1991, 2, 13), "")).toContain(13);
  });

  it("only ever returns the four known debts, sorted and unique", () => {
    for (const date of eachDate(1900, 2030)) {
      const debts = calculateKarmicDebt(date, "Amara Nightingale");
      expect(debts.every((d) => [13, 14, 16, 19].includes(d))).toBe(true);
      expect(debts).toEqual([...new Set(debts)].sort((a, b) => a - b));
    }
  });
});

describe("challenges and pinnacles", () => {
  it("every challenge for every birth date has a reading (0-8)", () => {
    // 3,023 of 46,021 dates used to produce a 9 or an 11, which has no reading,
    // so the Premium PDF quietly dropped that challenge.
    const misses: string[] = [];
    for (const date of eachDate(1900, 2030)) {
      for (const c of calculateChallenges(date)) {
        if (!(c in challengeReadings)) misses.push(`${date.toDateString()} -> ${c}`);
      }
    }
    expect(misses.slice(0, 5)).toEqual([]);
  });

  it("every pinnacle for every birth date has a reading", () => {
    for (const date of eachDate(1900, 2030)) {
      for (const p of calculatePinnacles(date)) {
        expect(p.number in pinnacleReadings, `${date.toDateString()} -> ${p.number}`).toBe(true);
      }
    }
  });

  it("the first pinnacle ends between ages 27 and 35, Master Life Paths included", () => {
    // Life Path 33 used to end the first pinnacle at age 3 (36 - 33).
    for (const date of eachDate(1900, 2030)) {
      const first = calculatePinnacles(date)[0];
      expect(first.ageEnd!).toBeGreaterThanOrEqual(27);
      expect(first.ageEnd!).toBeLessThanOrEqual(35);
    }
  });

  it("November no longer produces an unreadable challenge", () => {
    // Month 11 was kept as 11, so 20 Nov 2025 gave |11 - 2| = 9.
    expect(calculateChallenges(new Date(2025, 10, 20)).every((c) => c >= 0 && c <= 8)).toBe(true);
  });
});
