// ---------------------------------------------------------------------------
// Edition facts.
//
// These numbers appear in marketing copy, so they have to be true. The PDF
// tests assert that the generated documents match these constants, so if a
// section is added or removed the test fails and the copy gets updated rather
// than quietly becoming a lie.
//
// The premium count varies slightly with the profile: a chart with no pinnacle
// or personal-month data produces fewer worksheet pages. FREE_PAGE_COUNT is
// fixed because the free edition's page sequence is fixed.
// ---------------------------------------------------------------------------

export const FREE_PAGE_COUNT = 19;
/** typical premium length, for a profile with a full pinnacle and month set */
export const PREMIUM_PAGE_COUNT = 61;

/** what to say in marketing copy — never claim more than the minimum */
export const PREMIUM_PAGE_LABEL = "60+ page";

export const FREE_EDITION = {
  name: "Complete Blueprint",
  pages: FREE_PAGE_COUNT,
  summary:
    "Your six-number map, full interpretations, timing cycle, decision filter, shadow-to-strategy map, a 30-day plan and printable reflection pages.",
};

export const PREMIUM_EDITION = {
  name: "Premium Edition",
  pages: PREMIUM_PAGE_COUNT,
  summary:
    "Everything in the free edition plus nine deep sections — shadow pattern analysis, the relationship map, career and purpose alignment, wealth and legacy settings, personal codes, the full life phase map, growth prompts, a month-by-month forecast, an operating system and printable journals.",
};

/** Turn a display name into a safe download filename stem. */
export function blueprintSlug(name: string): string {
  return (
    name
      .trim()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "") || "mysticaldigits"
  );
}

