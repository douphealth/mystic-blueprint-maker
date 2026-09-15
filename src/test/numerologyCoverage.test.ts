import { describe, it, expect } from "vitest";
import { calculateFullProfile } from "../lib/numerology";
import { getInterpretation, getInterpretationSafe, birthdayInterpretations } from "../lib/interpretations";

/**
 * The results page (src/pages/Index.tsx) does:
 *     const lp = getInterpretation("lifePath", profile.lifePath)!;
 * with a non-null assertion and no fallback, then hands the value to
 * <NumerologySection interpretation={lp} />. If the lookup is undefined the
 * component throws during render and — because the app has no error boundary
 * — the entire page goes blank.
 *
 * These tests document every input class that produces an out-of-table number.
 */

const CASES: [label: string, name: string, dob: string][] = [
  ["ordinary western name", "Jane Doe", "1990-05-15"],
  ["no vowels in name", "Lynn Smyth", "1990-05-15"],
  ["single consonant cluster", "Ng", "1990-05-15"],
  ["all-vowel name", "Aoi", "1990-05-15"],
  ["cyrillic name", "Иван Петров", "1990-05-15"],
  ["chinese name", "张伟", "1990-05-15"],
  ["arabic name", "محمد", "1990-05-15"],
  ["digits only", "12345", "1990-05-15"],
  ["empty name", "", "1990-05-15"],
];

describe("profile -> interpretation coverage", () => {
  it("reports which inputs have no interpretation for a core number", () => {
    const broken: string[] = [];

    for (const [label, name, dob] of CASES) {
      const p = calculateFullProfile(name, new Date(dob + "T00:00:00"));
      const lookups: [string, number, unknown][] = [
        ["lifePath", p.lifePath, getInterpretation("lifePath", p.lifePath)],
        ["expression", p.expression, getInterpretation("expression", p.expression)],
        ["soulUrge", p.soulUrge, getInterpretation("soulUrge", p.soulUrge)],
        ["personality", p.personality, getInterpretation("personality", p.personality)],
        ["personalYear", p.personalYear, getInterpretation("personalYear", p.personalYear)],
        ["birthday", p.birthday, birthdayInterpretations[p.birthday]],
      ];

      const missing = lookups
        .filter(([, , v]) => v === undefined)
        .map(([k, n]) => `${k}=${n}`);

      if (missing.length) {
        broken.push(`${label} [${name}] -> ${missing.join(", ")}`);
      }
    }

    // Surface the finding rather than asserting a fix that does not exist yet.
    console.log("\nRAW-TABLE GAPS (getInterpretation returns undefined):\n" + broken.map((b) => "  " + b).join("\n"));
    expect(broken.length).toBeGreaterThan(0);
  });

  it("getInterpretationSafe always returns a renderable interpretation", () => {
    const gaps: string[] = [];

    for (const [label, name, dob] of CASES) {
      const p = calculateFullProfile(name, new Date(dob + "T00:00:00"));
      for (const type of ["lifePath", "expression", "soulUrge", "personality", "personalYear"]) {
        const n = (p as unknown as Record<string, number>)[type];
        const v = getInterpretationSafe(type, n);
        if (!v || typeof v.fullText !== "string" || typeof v.title !== "string") {
          gaps.push(`${label} ${type}=${n}`);
        }
      }
    }

    expect(gaps).toEqual([]);
  });
});
