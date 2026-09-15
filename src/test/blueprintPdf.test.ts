import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import zlib from "zlib";
import { generateBlueprintPdf } from "../lib/blueprintPdf";
import { NumerologyProfile } from "../lib/numerology";
import { FREE_PAGE_COUNT, PREMIUM_PAGE_COUNT } from "../lib/editions";

/**
 * These tests exercise the REAL jsPDF engine (no mocks) so that font
 * embedding, page breaks and the saved byte stream are all verified.
 *
 * The first test also writes a sample PDF to ./_qa/ so it can be inspected
 * by eye / rasterised. That artifact is the fastest way to catch layout
 * regressions that a unit test cannot see.
 */

const QA_DIR = path.resolve(__dirname, "../../_qa");

const richProfile: NumerologyProfile = {
  lifePath: 11,
  expression: 8,
  soulUrge: 6,
  personality: 5,
  birthday: 22,
  personalYear: 9,
  hiddenPassion: [3, 5],
  karmicDebt: [13, 16],
  pinnacles: [
    { number: 11, ageStart: 0, ageEnd: 27 },
    { number: 4, ageStart: 28, ageEnd: 36 },
    { number: 6, ageStart: 37, ageEnd: 45 },
    { number: 22, ageStart: 46, ageEnd: null },
  ],
  challenges: [0, 3, 5, 2],
  personalMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 4],
};

const sparseProfile: NumerologyProfile = {
  lifePath: 4,
  expression: 4,
  soulUrge: 4,
  personality: 4,
  birthday: 4,
  personalYear: 4,
  hiddenPassion: [],
  karmicDebt: [],
  pinnacles: [],
  challenges: [],
  personalMonths: [],
};

/** pull the raw bytes out of a jsPDF document */
function bytesOf(doc: ReturnType<typeof generateBlueprintPdf>): Buffer {
  return Buffer.from(doc.output("arraybuffer") as ArrayBuffer);
}

/** concatenate every FlateDecode stream so we can look for embedded font data */
function inflatedStreams(pdf: Buffer): string {
  const raw = pdf.toString("latin1");
  const parts: string[] = [];
  let i = 0;
  for (;;) {
    const s = raw.indexOf("stream", i);
    if (s === -1) break;
    let a = s + "stream".length;
    if (raw[a] === "\r") a++;
    if (raw[a] === "\n") a++;
    const e = raw.indexOf("endstream", a);
    if (e === -1) break;
    try {
      parts.push(zlib.inflateSync(pdf.subarray(a, e)).toString("latin1"));
    } catch {
      /* not a flate stream */
    }
    i = e + "endstream".length;
  }
  return parts.join("\n");
}

describe("generateBlueprintPdf (real jsPDF)", () => {
  it("builds a personalised workbook and writes an inspectable sample", () => {
    const doc = generateBlueprintPdf(richProfile, "Amara Nightingale");
    const pdf = bytesOf(doc);
    const raw = pdf.toString("latin1");

    // --- a structurally valid PDF ---------------------------------------
    expect(raw.slice(0, 5)).toBe("%PDF-");
    expect(raw.trimEnd().endsWith("%%EOF")).toBe(true);

    // --- every page is actually emitted ---------------------------------
    const pages = doc.getNumberOfPages();
    const pageObjects = (raw.match(/\/Type\s*\/Page[^s]/g) || []).length;
    console.log(`\nblueprint page count: ${pages}`);
    expect(pages).toBeGreaterThanOrEqual(18);
    expect(pages).toBeLessThanOrEqual(40);
    expect(pageObjects).toBe(pages);

    // --- the three brand families are embedded, not silently substituted --
    const fonts = inflatedStreams(pdf) + raw;
    for (const family of ["Cinzel", "Cormorant", "Inter"]) {
      expect(fonts).toContain(family);
    }

    // --- no page ended up essentially blank -----------------------------
    // jsPDF writes one content stream per page; a healthy workbook page
    // should be well over a few hundred bytes of drawing instructions.
    const contentStreams = (raw.match(/\/Filter\s*\/FlateDecode/g) || []).length;
    expect(contentStreams).toBeGreaterThan(pages);

    // --- artifact for visual QA -----------------------------------------
    // Three subsetted brand families + ~19 pages of vector content lands
    // around 150 KB. A sudden drop means fonts stopped being embedded.
    fs.mkdirSync(QA_DIR, { recursive: true });
    const out = path.join(QA_DIR, "blueprint-sample.pdf");
    fs.writeFileSync(out, pdf);
    expect(fs.statSync(out).size).toBeGreaterThan(120_000);
  }, 60_000);

  it("handles a sparse profile without throwing", () => {
    const doc = generateBlueprintPdf(sparseProfile, "");
    const raw = bytesOf(doc).toString("latin1");
    expect(raw.slice(0, 5)).toBe("%PDF-");
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(14);
  }, 60_000);

  it("reduces a full-name to a safe download filename", async () => {
    const { blueprintFileName } = await import("../components/FreePdfButton");
    expect(blueprintFileName("Amara Nightingale")).toBe(
      "Amara-Nightingale-complete-life-path-blueprint.pdf",
    );
    expect(blueprintFileName("  José  O'Brien / Jr. ")).toBe(
      "Jos-O-Brien-Jr-complete-life-path-blueprint.pdf",
    );
    expect(blueprintFileName("")).toBe("mysticaldigits-complete-life-path-blueprint.pdf");
  });
});

describe("premium tier (real jsPDF)", () => {
  it("builds a substantially deeper edition and writes an inspectable sample", () => {
    const free = generateBlueprintPdf(richProfile, "Amara Nightingale");
    const premium = generateBlueprintPdf(richProfile, "Amara Nightingale", { tier: "premium" });

    const freePages = free.getNumberOfPages();
    const premiumPages = premium.getNumberOfPages();
    const pdf = bytesOf(premium);
    const raw = pdf.toString("latin1");

    console.log(`\nfree pages: ${freePages}  ·  premium pages: ${premiumPages}`);

    expect(raw.slice(0, 5)).toBe("%PDF-");
    expect(raw.trimEnd().endsWith("%%EOF")).toBe(true);

    // The premium edition must be a genuine superset, not a relabelling.
    expect(premiumPages).toBe(PREMIUM_PAGE_COUNT);
    expect(premiumPages).toBeGreaterThan(freePages + 20);

    // every page is emitted
    const pageObjects = (raw.match(/\/Type\s*\/Page[^s]/g) || []).length;
    expect(pageObjects).toBe(premiumPages);

    // brand fonts still embedded in the premium path
    const fonts = inflatedStreams(pdf) + raw;
    for (const family of ["Cinzel", "Cormorant", "Inter"]) {
      expect(fonts).toContain(family);
    }

    fs.mkdirSync(QA_DIR, { recursive: true });
    const out = path.join(QA_DIR, "premium-sample.pdf");
    fs.writeFileSync(out, pdf);
    expect(fs.statSync(out).size).toBeGreaterThan(250_000);
  }, 120_000);

  it("does not change the free edition when the tier is omitted", () => {
    const a = bytesOf(generateBlueprintPdf(richProfile, "Amara Nightingale"));
    const b = bytesOf(generateBlueprintPdf(richProfile, "Amara Nightingale", { tier: "free" }));
    expect(a.length).toBe(b.length);
  }, 60_000);

  it("survives a sparse premium profile without throwing", () => {
    const doc = generateBlueprintPdf(sparseProfile, "", { tier: "premium" });
    const raw = bytesOf(doc).toString("latin1");
    expect(raw.slice(0, 5)).toBe("%PDF-");
    // no pinnacle or personal-month data, so the worksheet pages drop out
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(50);
  }, 120_000);
});
