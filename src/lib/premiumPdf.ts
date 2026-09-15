// ---------------------------------------------------------------------------
// Premium edition page builders.
//
// These live outside blueprintPdf.ts on purpose. The free workbook's layout was
// verified pixel-by-pixel against a measuring harness (see _qa_layout.py), and
// restructuring that file to share code would have put a verified artifact at
// risk. Instead blueprintPdf.ts assembles a `PdfKit` — a bundle of the drawing
// primitives it already defines — and hands it here.
//
// The premium edition is a strict superset of the free one: same core, plus
// roughly thirty-five additional pages of depth.
// ---------------------------------------------------------------------------

import type jsPDF from "jspdf";
import type { NumerologyProfile } from "./numerology";
import {
  shadowProfiles,
  relationshipSignatures,
  careerVectors,
  moneyArchetypes,
  luckyCodes,
  affirmations,
  pinnacleReadings,
  challengeReadings,
  growthPrompts,
  luckyCodeDisclaimer,
} from "./premiumContent";

export type RGB = [number, number, number];

export interface PdfKit {
  doc: jsPDF;
  PAGE_W: number;
  PAGE_H: number;
  M: number;
  CW: number;
  BOTTOM: number;
  PT2MM: number;
  FONT: { display: string; body: string; ui: string };
  // shared content tables, handed over rather than imported so that
  // premiumPdf.ts never has to import from blueprintPdf.ts (which imports this
  // module back, and a cycle here would be resolved at an unpredictable time)
  monthlyFocus: Record<number, { theme: string; do: string; avoid: string; ritual: string }>;
  numberPrinciples: Record<number, string[]>;
  C: {
    CREAM: RGB; CREAM_2: RGB; INK: RGB; INK_SOFT: RGB; INK_FAINT: RGB;
    GOLD: RGB; GOLD_DEEP: RGB; GOLD_LIGHT: RGB; MIDNIGHT: RGB;
    PEARL: RGB; PEARL_DIM: RGB; RULE: RGB; RULE_SOFT: RGB; ROSE: RGB; PURPLE: RGB;
  };
  y: number;
  font(fam: string, style: "normal" | "bold" | "italic", size: number, color: RGB, space?: number): void;
  textAt(s: string, x: number, yy: number, align?: "left" | "center" | "right"): void;
  para(s: string, size?: number, color?: RGB, style?: "normal" | "bold" | "italic", indent?: number, lead?: number, fam?: string): number;
  eyebrow(s: string, color?: RGB, indent?: number): void;
  h(s: string, size?: number, color?: RGB, indent?: number, lead?: number): number;
  rule(w?: number, color?: RGB, indent?: number, weight?: number): void;
  ornRule(width?: number, color?: RGB): void;
  box(x: number, top: number, w: number, ht: number, fill: RGB | null, stroke: RGB | null, r?: number): void;
  medal(value: number | string, cx: number, cy: number, r: number, dark?: boolean): void;
  fitText(s: string, fam: string, style: "normal" | "bold" | "italic", startSize: number, maxW: number, color: RGB, space?: number): number;
  writeLines(count: number, indent?: number, gap?: number, width?: number): void;
  checkbox(x: number, top: number, s?: number): void;
  bullet(x: number, top: number, color?: RGB): void;
  compass(cx: number, cy: number, r: number): void;
  newPage(kind?: "cream" | "dark", nextSection?: string): void;
  footer(dark?: boolean): void;
  ensure(needed: number, kind?: "cream" | "dark"): void;
  fullPageTitle(kicker: string, title: string, lede?: string): void;
  card(x: number, top: number, w: number, label: string, body: string, accent?: RGB, labelColor?: RGB): void;
}

// ---------------------------------------------------------------------------
// small local helpers
// ---------------------------------------------------------------------------

/** open a fresh content page with the standard masthead */
function sectionPage(kit: PdfKit, section: string, kicker: string, title: string, lede?: string) {
  kit.newPage("cream", section);
  kit.fullPageTitle(kicker, title, lede);
  kit.y += 3;
}

/**
 * A labelled paragraph block: small caps label, then body text, with a rule
 * underneath so long pages stay scannable.
 */
function labelled(kit: PdfKit, label: string, body: string, color?: RGB, gap = 3.4) {
  kit.ensure(22);
  kit.eyebrow(label, color ?? kit.C.GOLD_DEEP);
  kit.para(body, 10.2, kit.C.INK_SOFT, "normal", 0, 1.44);
  kit.y += gap;
}

/**
 * a two-column labelled pair, used heavily in the shadow and career pages.
 *
 * The card is filled first and the text drawn once on top. An earlier version
 * drew the text, painted the card over it, then redrew the text — which left
 * two copies of every string in the content stream. The duplicate is invisible
 * while the fill covers it exactly, but it doubles the text objects and any
 * rounding in the card's corners lets a ghost of the first copy show through.
 */
function pairRow(kit: PdfKit, left: [string, string], right: [string, string], accent?: RGB) {
  const colW = (kit.CW - 5) / 2;
  const LINE = 9.5 * kit.PT2MM * 1.42;
  const textW = colW - 7;

  // the font must be active before measuring, or splitTextToSize wraps against
  // whatever face the previous block left behind
  kit.font(kit.FONT.body, "normal", 9.5, kit.C.INK_SOFT, 0);
  const leftLines = kit.doc.splitTextToSize(left[1], textW) as string[];
  const rightLines = kit.doc.splitTextToSize(right[1], textW) as string[];

  const cardH = Math.max(8.4 + leftLines.length * LINE, 8.4 + rightLines.length * LINE) + 4.4;
  kit.ensure(cardH + 6);
  const top = kit.y;

  kit.box(kit.M, top, colW, cardH, kit.C.CREAM_2, kit.C.RULE_SOFT, 1.4);
  kit.box(kit.M + colW + 5, top, colW, cardH, kit.C.CREAM_2, kit.C.RULE_SOFT, 1.4);

  const blocks: [[string, string], number, string[]][] = [
    [left, kit.M + 3.5, leftLines],
    [right, kit.M + colW + 8.5, rightLines],
  ];
  blocks.forEach(([[label], x, lines]) => {
    kit.font(kit.FONT.ui, "bold", 5.9, accent ?? kit.C.GOLD_DEEP, 0.85);
    kit.doc.text(label.toUpperCase(), x, top + 3.6);
    kit.font(kit.FONT.body, "normal", 9.5, kit.C.INK_SOFT, 0);
    lines.forEach((ln, i) => kit.doc.text(ln, x, top + 8.6 + i * LINE));
  });

  kit.y = top + cardH + 5;
}

/** a write-in block with a heading and ruled lines */
function writeIn(kit: PdfKit, label: string, lines = 3, hint?: string) {
  kit.ensure(14 + lines * 7.4);
  kit.eyebrow(label, kit.C.GOLD_DEEP);
  if (hint) {
    kit.font(kit.FONT.body, "italic", 8.8, kit.C.INK_FAINT, 0);
    (kit.doc.splitTextToSize(hint, kit.CW) as string[]).forEach((ln, i) =>
      kit.doc.text(ln, kit.M, kit.y + i * (8.8 * kit.PT2MM * 1.36)),
    );
    kit.y += (kit.doc.splitTextToSize(hint, kit.CW) as string[]).length * (8.8 * kit.PT2MM * 1.36) + 1;
  }
  kit.writeLines(lines);
  kit.y += 3;
}

/** a full-width tinted callout with a left accent bar */
function callout(kit: PdfKit, label: string, body: string, accent?: RGB, barW = 1.1) {
  const col = accent ?? kit.C.GOLD;
  kit.ensure(30);
  kit.font(kit.FONT.body, "normal", 9.8, kit.C.INK_SOFT, 0);
  const lines = kit.doc.splitTextToSize(body, kit.CW - 10) as string[];
  const ht = 11 + lines.length * (9.8 * kit.PT2MM * 1.44) + 3;
  kit.box(kit.M, kit.y, kit.CW, ht, kit.C.CREAM_2, col, 1.6);
  kit.doc.setFillColor(col[0], col[1], col[2]);
  kit.doc.rect(kit.M, kit.y, barW, ht, "F");
  kit.font(kit.FONT.ui, "bold", 6.0, kit.C.GOLD_DEEP, 0.9);
  kit.doc.text(label.toUpperCase(), kit.M + 4, kit.y + 6.2);
  kit.font(kit.FONT.body, "normal", 9.8, kit.C.INK_SOFT, 0);
  lines.forEach((ln, i) => kit.doc.text(ln, kit.M + 4, kit.y + 11.4 + i * (9.8 * kit.PT2MM * 1.44)));
  kit.y += ht + 5;
}

// ---------------------------------------------------------------------------
// Section 1 — the inner architecture
// ---------------------------------------------------------------------------

export function premiumInnerArchitecture(kit: PdfKit, profile: NumerologyProfile, name: string) {
  sectionPage(
    kit,
    "Premium · The Deep Layer",
    "Premium Section One",
    "Your Inner Architecture",
    "The six numbers are not six separate readings. They are three tensions, and the tensions are what you actually experience.",
  );

  kit.para(
    `Most numerology reports hand you six numbers and leave you to reconcile them. That is where most people get stuck, because the numbers genuinely do disagree — ${name}'s Life Path and Soul Urge are asking for different things, and that friction is not an error in the calculation. It is the design.`,
    10.4,
  );
  kit.y += 5;

  kit.eyebrow("The three tensions", kit.C.GOLD_DEEP);
  kit.y += 1.4;

  const axes: [string, string, string, RGB][] = [
    [
      "Identity",
      `Life Path ${profile.lifePath} · Birthday ${profile.birthday}`,
      "What you are here to become. Fixed at birth, unaffected by your name, and the slowest of the three to change.",
      kit.C.PURPLE,
    ],
    [
      "Expression",
      `Expression ${profile.expression} · Personality ${profile.personality}`,
      "How you are built to operate in the world. This is your capability, your output, and the impression you leave.",
      kit.C.GOLD_DEEP,
    ],
    [
      "Desire",
      `Soul Urge ${profile.soulUrge} · Personal Year ${profile.personalYear}`,
      "What you privately need in order to feel satisfied — and the seasonal timing you are currently inside of.",
      kit.C.ROSE,
    ],
  ];

  axes.forEach(([label, nums, body, col]) => {
    kit.ensure(30);
    const top = kit.y;
    kit.font(kit.FONT.body, "normal", 9.6, kit.C.INK_SOFT, 0);
    const lines = kit.doc.splitTextToSize(body, kit.CW - 52) as string[];
    const ht = Math.max(20, 9 + lines.length * (9.6 * kit.PT2MM * 1.42) + 4);
    kit.box(kit.M, top, kit.CW, ht, kit.C.CREAM_2, kit.C.RULE_SOFT, 1.4);
    kit.doc.setFillColor(col[0], col[1], col[2]);
    kit.doc.rect(kit.M, top, 1.1, ht, "F");
    kit.font(kit.FONT.display, "bold", 10.4, kit.C.INK, 0.3);
    kit.doc.text(label, kit.M + 4.5, top + 7);
    kit.font(kit.FONT.ui, "bold", 5.8, kit.C.GOLD_DEEP, 0.85);
    kit.doc.text(nums.toUpperCase(), kit.M + 4.5, top + 12);
    kit.font(kit.FONT.body, "normal", 9.6, kit.C.INK_SOFT, 0);
    lines.forEach((ln, i) => kit.doc.text(ln, kit.M + 48, top + 7.6 + i * (9.6 * kit.PT2MM * 1.42)));
    kit.y = top + ht + 4;
  });

  kit.y += 2;
  callout(
    kit,
    "How to read this workbook",
    `Read the tension, not the number. Where your Identity and your Desire disagree, that gap is where most of your recurring frustration lives — and it is also where your most distinctive work comes from. The Shadow section later in this book exists specifically to make that gap visible.`,
    kit.C.GOLD,
  );

  writeIn(kit, "In my own words", 3, `Where do ${name}'s Life Path and Soul Urge most obviously disagree in daily life?`);
  kit.footer();
}

// ---------------------------------------------------------------------------
// Section 2 — deep shadow pattern analysis
// ---------------------------------------------------------------------------

export function premiumShadowAnalysis(kit: PdfKit, profile: NumerologyProfile, name: string) {
  sectionPage(
    kit,
    "Premium · Shadow Patterns",
    "Premium Section Two",
    "Deep Shadow Pattern Analysis",
    "Your shadow is not the opposite of your strengths. It is those same strengths running without supervision.",
  );

  kit.para(
    "Each number carries a distortion that only appears under load. The distortion is not random — it is the predictable failure mode of the gift. A person wired for independence becomes controlling when they feel cornered. A person wired for harmony disappears when the room gets tense. Neither is a character flaw; both are the strength over-applied because nothing else was available in the moment.",
    10.4,
  );
  kit.y += 4;

  kit.eyebrow("The shadow loop", kit.C.ROSE);
  kit.y += 1.4;
  kit.para(
    "Every shadow follows the same four-stage structure. Recognising the stage you are in is the entire skill, because the loop can only be interrupted at stage two — once you are in the coping move, it is already running.",
    10.2,
  );
  kit.y += 3;

  const loop: [string, string][] = [
    ["1 · The trigger", "A repeated emotion or situation. Usually small, usually familiar, usually the same one as last time."],
    ["2 · The coping move", "What you actually do about it. This is the interruption point. Everything before it is information."],
    ["3 · The cost", "What the coping move takes from you — time, trust, energy, or a relationship you wanted to keep."],
    ["4 · The mature response", "What this looks like when you are resourced, honest, and not in a hurry."],
  ];
  loop.forEach(([label, body], i) => {
    kit.ensure(16);
    kit.medal(String(i + 1), kit.M + 3.4, kit.y + 2, 3.1);
    kit.font(kit.FONT.ui, "bold", 6.0, kit.C.GOLD_DEEP, 0.85);
    kit.doc.text(label.toUpperCase(), kit.M + 9.4, kit.y);
    kit.y += 3.8;
    kit.para(body, 9.8, kit.C.INK_SOFT, "normal", 9.4, 1.42);
    kit.y += 3.2;
  });
  kit.footer();

  // ---- the core shadows, in full ------------------------------------------
  const coreShadows: [string, number, string][] = [
    ["Life Path", profile.lifePath, "The deepest and slowest-moving pattern. This is the shadow you will meet for your whole life, in increasingly subtle forms."],
    ["Expression", profile.expression, "The shadow of your capability. It shows up in how you work, not in how you feel — which is why other people often see it before you do."],
  ];

  coreShadows.forEach(([label, num, note], idx) => {
    const s = shadowProfiles[num];
    if (!s) return;
    if (idx > 0) {
      kit.footer();
      kit.newPage("cream", "Premium · Shadow Patterns");
      kit.fullPageTitle("Premium Section Two", `${label} ${num} — ${s.loop}`, note);
      kit.y += 3;
    } else {
      kit.y += 2;
      kit.eyebrow(`${label} ${num} · ${s.loop}`, kit.C.ROSE);
      kit.y += 1.4;
      kit.para(note, 9.8, kit.C.INK_FAINT, "italic");
      kit.y += 3;
    }
    pairRow(kit, ["The trigger", s.trigger], ["The coping move", s.coping], kit.C.ROSE);
    pairRow(kit, ["What it costs", s.cost], ["The mature response", s.mature], kit.C.GOLD_DEEP);
    callout(kit, "The practice", s.practice, kit.C.PURPLE);
    writeIn(kit, "Where I recognise this", 2, "Name one specific recent situation, not a general tendency.");
  });
  kit.footer();

  // ---- the remaining three ------------------------------------------------
  const otherShadows: [string, number][] = [
    ["Soul Urge", profile.soulUrge],
    ["Personality", profile.personality],
    ["Birthday", profile.birthday],
  ].filter(([, n]) => shadowProfiles[n as number]) as [string, number][];

  kit.newPage("cream", "Premium · Shadow Patterns");
  kit.fullPageTitle(
    "Premium Section Two",
    "The Supporting Shadows",
    "Your Soul Urge, Personality and Birthday shadows are quieter than the two above, but they are the ones that show up in ordinary weeks.",
  );
  kit.y += 3;

  otherShadows.forEach(([label, num]) => {
    const s = shadowProfiles[num];
    kit.ensure(56);
    kit.eyebrow(`${label} ${num} · ${s.loop}`, kit.C.GOLD_DEEP);
    kit.y += 1.6;
    kit.para(`Trigger: ${s.trigger}`, 9.8, kit.C.INK, "bold", 0, 1.4);
    kit.y += 0.6;
    kit.para(`Coping move: ${s.coping}`, 9.6, kit.C.INK_SOFT, "normal", 0, 1.42);
    kit.y += 0.6;
    kit.para(`Cost: ${s.cost}`, 9.6, kit.C.INK_SOFT, "italic", 0, 1.42);
    kit.y += 0.6;
    kit.para(`Mature: ${s.mature}`, 9.6, kit.C.INK, "normal", 0, 1.42);
    kit.y += 1.2;
    kit.rule(kit.CW, kit.C.RULE_SOFT, 0, 0.25);
    kit.y += 3;
  });
  kit.footer();

  // ---- the inventory worksheet -------------------------------------------
  kit.newPage("cream", "Premium · Shadow Patterns");
  kit.fullPageTitle(
    "Premium Section Two",
    "The Shadow Inventory",
    "The single most useful page in this book. Fill it in from memory now, then again in thirty days.",
  );
  kit.y += 3;
  kit.para(
    "Patterns become visible through repetition, not through insight. Write down the last four times this pattern ran. If you cannot remember four, that is itself information — it usually means the pattern is running right now.",
    10.2,
  );
  kit.y += 4;

  const hdrW = kit.CW;
  const colXs = [kit.M + 3, kit.M + 34, kit.M + 74, kit.M + 114];
  kit.ensure(12);
  kit.font(kit.FONT.ui, "bold", 5.8, kit.C.GOLD_DEEP, 0.85);
  ["#", "Trigger", "What I did", "What it cost"].forEach((h, i) => kit.doc.text(h.toUpperCase(), colXs[i], kit.y));
  kit.y += 2.4;
  kit.rule(hdrW, kit.C.GOLD, 0, 0.4);
  kit.y += 4;

  for (let i = 0; i < 6; i++) {
    kit.ensure(18);
    kit.medal(String(i + 1), kit.M + 4.4, kit.y + 2.2, 2.9);
    kit.writeLines(2, 30, 7.2, kit.CW - 30);
    kit.y += 4.4;
  }
  kit.footer();
}

// ---------------------------------------------------------------------------
// Section 3 — relationship compatibility map
// ---------------------------------------------------------------------------

export function premiumRelationship(kit: PdfKit, profile: NumerologyProfile, name: string) {
  const sig = relationshipSignatures[profile.lifePath];
  sectionPage(
    kit,
    "Premium · Relationships",
    "Premium Section Three",
    "Relationship Compatibility Map",
    "What you need, what you give, what you fear, and who you keep attracting — read from your Life Path.",
  );

  kit.para(
    "Compatibility in numerology is not a score out of ten. Two numbers that 'clash' can build something neither could build alone, and two numbers that 'harmonise' can agree themselves into stagnation. What matters is knowing which friction you are signing up for before you sign up for it.",
    10.4,
  );
  kit.y += 5;

  kit.eyebrow(`Your relationship signature · Life Path ${profile.lifePath}`, kit.C.ROSE);
  kit.y += 1.6;

  const rows: [string, string][] = [
    ["What you need", sig.needs],
    ["What you give", sig.gives],
    ["What you fear", sig.fears],
    ["Who you attract", sig.attracts],
    ["Your recurring friction", sig.friction],
  ];
  rows.forEach(([label, body]) => {
    kit.ensure(20);
    kit.font(kit.FONT.ui, "bold", 5.9, kit.C.GOLD_DEEP, 0.85);
    kit.doc.text(label.toUpperCase(), kit.M, kit.y + 3.4);
    kit.font(kit.FONT.body, "normal", 9.9, kit.C.INK_SOFT, 0);
    const lines = kit.doc.splitTextToSize(body, kit.CW - 42) as string[];
    lines.forEach((ln, i) => kit.doc.text(ln, kit.M + 42, kit.y + 3.4 + i * (9.9 * kit.PT2MM * 1.42)));
    kit.y += Math.max(7, lines.length * (9.9 * kit.PT2MM * 1.42)) + 4.4;
    kit.rule(kit.CW, kit.C.RULE_SOFT, 0, 0.2);
    kit.y += 3.4;
  });

  kit.y += 1;
  callout(
    kit,
    "The pattern worth watching",
    sig.friction + " This is not a prediction. It is the specific place where your design, left unexamined, will cost you something you did not intend to spend.",
    kit.C.ROSE,
  );
  kit.footer();

  // ---- the pairing table --------------------------------------------------
  kit.newPage("cream", "Premium · Relationships");
  kit.fullPageTitle(
    "Premium Section Three",
    `Life Path ${profile.lifePath} Paired With Each Life Path`,
    "Every pairing below is workable. Mirror pairings are the ones people describe as 'we just got each other instantly'. Catalytic pairings are the ones they describe as 'I have never felt anything like this and I am exhausted'. Both descriptions are accurate.",
  );
  kit.y += 2;

  const harmony = (a: number, b: number) => {
    const base = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const norm = (n: number) => (n === 11 ? 2 : n === 22 ? 4 : n === 33 ? 6 : n);
    const x = norm(a);
    const yv = norm(b);
    if (x === yv) return "mirror";
    if (base.includes(x) && base.includes(yv) && (x + yv) % 3 === 0) return "supportive";
    if (Math.abs(x - yv) === 1) return "catalytic";
    return "growth";
  };
  const KIND: Record<string, { label: string; col: RGB }> = {
    mirror: { label: "Mirror", col: kit.C.GOLD_DEEP },
    supportive: { label: "Supportive", col: kit.C.PURPLE },
    catalytic: { label: "Catalytic", col: kit.C.ROSE },
    growth: { label: "Growth", col: kit.C.INK_FAINT },
  };

  // All twelve rows have to land on one page. At the original row height the
  // twelfth orphaned onto a page of its own, which read as a printing error.
  const LINE = 9.2 * kit.PT2MM * 1.38;
  const others = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
  const textW = kit.CW - 62;
  const measured = others.map((other) => {
    const body = relationshipSignatures[other]?.needs ?? "";
    kit.font(kit.FONT.body, "normal", 9.2, kit.C.INK_SOFT, 0);
    return { other, body, lines: kit.doc.splitTextToSize(body, textW) as string[] };
  });

  measured.forEach(({ other, lines }) => {
    const k = KIND[harmony(profile.lifePath, other)];
    const ht = Math.max(13.4, 5.4 + lines.length * LINE + 2);
    kit.ensure(ht + 2.6);
    const top = kit.y;
    kit.box(kit.M, top, kit.CW, ht, kit.C.CREAM_2, kit.C.RULE_SOFT, 1.4);
    kit.medal(String(other), kit.M + 8, top + ht / 2, 4.6);
    kit.font(kit.FONT.ui, "bold", 5.4, k.col, 0.75);
    kit.doc.text(k.label.toUpperCase(), kit.M + 15, top + 5.2);
    kit.font(kit.FONT.body, "normal", 9.2, kit.C.INK_SOFT, 0);
    lines.forEach((ln, i) => kit.doc.text(ln, kit.M + 52, top + 6 + i * LINE));
    kit.y = top + ht + 2.6;
  });
  kit.footer();

  // ---- red flags and the audit -------------------------------------------
  kit.newPage("cream", "Premium · Relationships");
  kit.fullPageTitle(
    "Premium Section Three",
    "Red Flags, Green Lights, And The Audit",
    "A checklist you can actually use, followed by the questions most people avoid until year three.",
  );
  kit.y += 3;

  kit.eyebrow("Green lights — be suspicious of anyone who cannot do these", kit.C.PURPLE);
  kit.y += 1.6;
  const greens = [
    "Can hear a boundary without treating it as a rejection.",
    "Says what they mean the first time, so you are not decoding.",
    "Has a life you are not required to rescue.",
    "Can be wrong out loud without collapsing or counter-attacking.",
    "Wants you to be impressive, not manageable.",
    "Repairs after conflict instead of storing it.",
  ];
  greens.forEach((g) => {
    kit.ensure(9);
    kit.checkbox(kit.M, kit.y - 2.4);
    kit.para(g, 9.8, kit.C.INK_SOFT, "normal", 5.4, 1.4);
    kit.y += 0.8;
  });
  kit.y += 3;

  kit.eyebrow("Red flags — the ones your number specifically under-reacts to", kit.C.ROSE);
  kit.y += 1.6;
  const reds = [
    "They are only generous when they are being watched.",
    "You are consistently the one who adjusts.",
    "Their calm depends on you not raising something.",
    "You have explained the same boundary more than twice.",
    "You feel more like a function than a person in the relationship.",
    "You are managing their feelings instead of sharing yours.",
  ];
  reds.forEach((g) => {
    kit.ensure(9);
    kit.checkbox(kit.M, kit.y - 2.4);
    kit.para(g, 9.8, kit.C.INK_SOFT, "normal", 5.4, 1.4);
    kit.y += 0.8;
  });
  kit.y += 4;

  writeIn(kit, "The honest audit", 3, "Which of the above did I recognise in a current or recent relationship, and what did I tell myself about it?");
  writeIn(kit, "The conversation I am avoiding", 2, "The sentence I would say if I trusted the relationship could hold it.");
  kit.footer();
}

// ---------------------------------------------------------------------------
// Section 4 — career and purpose alignment
// ---------------------------------------------------------------------------

export function premiumCareer(kit: PdfKit, profile: NumerologyProfile, name: string) {
  const cv = careerVectors[profile.expression] ?? careerVectors[1];
  const cvLife = careerVectors[profile.lifePath] ?? careerVectors[1];

  sectionPage(
    kit,
    "Premium · Career & Purpose",
    "Premium Section Four",
    "Career & Purpose Alignment",
    "Your Expression number describes how you are built to produce. Your Life Path describes what the producing is for.",
  );

  kit.para(
    `These are two different questions and they are usually answered separately. ${name}'s Expression ${profile.expression} is the machinery — the way you solve problems and what kind of output feels natural. The Life Path ${profile.lifePath} is the purpose the machinery serves. Work that matches the Expression but not the Life Path pays well and feels hollow. Work that matches the Life Path but not the Expression feels meaningful and exhausts you.`,
    10.4,
  );
  kit.y += 5;

  kit.eyebrow(`Expression ${profile.expression} · how you are built to work`, kit.C.GOLD_DEEP);
  kit.y += 1.6;
  const exprRows: [string, string][] = [
    ["Environments", cv.environments],
    ["Roles", cv.roles],
    ["Industries", cv.industries],
    ["Avoid", cv.avoid],
  ];
  exprRows.forEach(([label, body]) => {
    kit.ensure(18);
    kit.font(kit.FONT.ui, "bold", 5.9, kit.C.GOLD_DEEP, 0.85);
    kit.doc.text(label.toUpperCase(), kit.M, kit.y + 3.2);
    kit.font(kit.FONT.body, "normal", 9.9, kit.C.INK_SOFT, 0);
    const lines = kit.doc.splitTextToSize(body, kit.CW - 34) as string[];
    lines.forEach((ln, i) => kit.doc.text(ln, kit.M + 34, kit.y + 3.2 + i * (9.9 * kit.PT2MM * 1.42)));
    kit.y += Math.max(7, lines.length * (9.9 * kit.PT2MM * 1.42)) + 3.6;
  });

  kit.y += 2;
  kit.eyebrow(`Life Path ${profile.lifePath} · what the work is for`, kit.C.PURPLE);
  kit.y += 1.6;
  const lifeRows: [string, string][] = [
    ["Environments", cvLife.environments],
    ["Roles", cvLife.roles],
    ["Avoid", cvLife.avoid],
  ];
  lifeRows.forEach(([label, body]) => {
    kit.ensure(18);
    kit.font(kit.FONT.ui, "bold", 5.9, kit.C.PURPLE, 0.85);
    kit.doc.text(label.toUpperCase(), kit.M, kit.y + 3.2);
    kit.font(kit.FONT.body, "normal", 9.9, kit.C.INK_SOFT, 0);
    const lines = kit.doc.splitTextToSize(body, kit.CW - 34) as string[];
    lines.forEach((ln, i) => kit.doc.text(ln, kit.M + 34, kit.y + 3.2 + i * (9.9 * kit.PT2MM * 1.42)));
    kit.y += Math.max(7, lines.length * (9.9 * kit.PT2MM * 1.42)) + 3.6;
  });
  kit.footer();

  // ---- business models + fit grid ----------------------------------------
  kit.newPage("cream", "Premium · Career & Purpose");
  kit.fullPageTitle(
    "Premium Section Four",
    "Three Models That Fit You",
    "Not job titles — structures. The structure determines whether your natural way of working is an asset or a liability.",
  );
  kit.y += 3;

  cv.models.forEach((m, i) => {
    kit.ensure(30);
    const top = kit.y;
    kit.box(kit.M, top, kit.CW, 24, kit.C.CREAM_2, kit.C.RULE_SOFT, 1.4);
    kit.medal(String(i + 1), kit.M + 9, top + 12, 5.6);
    kit.font(kit.FONT.display, "bold", 11.6, kit.C.INK, 0.3);
    kit.doc.text(m, kit.M + 19, top + 9);
    kit.font(kit.FONT.body, "normal", 9.4, kit.C.INK_SOFT, 0);
    const note =
      i === 0
        ? "The lowest-risk entry point. Uses what you already know and can be started without capital."
        : i === 1
          ? "The compounding option. Slower to start, worth considerably more after three years."
          : "The highest-ceiling option. Requires help, and rewards patience.";
    (kit.doc.splitTextToSize(note, kit.CW - 24) as string[]).forEach((ln, k) =>
      kit.doc.text(ln, kit.M + 19, top + 14.6 + k * (9.4 * kit.PT2MM * 1.4)),
    );
    kit.y = top + 28;
  });

  kit.y += 3;
  kit.eyebrow("The fit grid — score the opportunity you are currently considering", kit.C.GOLD_DEEP);
  kit.y += 1.6;
  kit.para(
    "Score each line from 1 (nothing like me) to 5 (exactly like me). Below 22 out of 35, you are about to pay for someone else's dream with your own energy.",
    9.8,
    kit.C.INK_FAINT,
    "italic",
  );
  kit.y += 3;

  const fitRows = [
    "The daily work matches how I naturally solve problems.",
    "The environment matches the pace and structure I need.",
    "Success in this role would use my strongest natural ability.",
    "I would not have to perform a personality I do not have.",
    "The outcome of this work means something to me beyond income.",
    "The people around me would want me to be impressive, not manageable.",
    "I would still choose this if nobody ever knew I had done it.",
  ];
  fitRows.forEach((r) => {
    kit.ensure(13);
    kit.checkbox(kit.M, kit.y - 2.4);
    kit.font(kit.FONT.body, "normal", 9.7, kit.C.INK_SOFT, 0);
    const lines = kit.doc.splitTextToSize(r, kit.CW - 26) as string[];
    lines.forEach((ln, i) => kit.doc.text(ln, kit.M + 5.4, kit.y + i * (9.7 * kit.PT2MM * 1.4)));
    kit.font(kit.FONT.ui, "bold", 6.0, kit.C.GOLD_DEEP, 0.8);
    kit.doc.text("__ / 5", kit.M + kit.CW - 14, kit.y);
    kit.y += lines.length * (9.7 * kit.PT2MM * 1.4) + 4.4;
  });
  kit.footer();

  // ---- purpose statement builder -----------------------------------------
  kit.newPage("cream", "Premium · Career & Purpose");
  kit.fullPageTitle(
    "Premium Section Four",
    "The Purpose Statement Builder",
    "A purpose statement that cannot be falsified is a slogan. This one is built to be tested.",
  );
  kit.y += 3;
  kit.para(
    "Purpose is not discovered in a single moment of clarity. It is assembled from evidence — from the things you have already done that produced energy rather than only income. Build it from memory, not from aspiration.",
    10.2,
  );
  kit.y += 4;

  writeIn(kit, "Three things I have done that produced energy, not just money", 4, "Be specific. What were you actually doing in those moments?");
  writeIn(kit, "The problem I keep being asked to solve", 2, "What do people consistently bring to you, even when it is not your job?");
  writeIn(kit, "The person I am best equipped to help", 2, "Not everyone. The specific person whose situation matches your own history.");

  kit.y += 1;
  callout(
    kit,
    "Draft the sentence",
    "I help [specific person] to [specific outcome] by [the way I naturally work], because I have already lived through [the thing that taught me how].",
    kit.C.PURPLE,
  );
  writeIn(kit, "My draft", 3);
  kit.footer();

  // ---- testing the statement ---------------------------------------------
  kit.newPage("cream", "Premium · Career & Purpose");
  kit.fullPageTitle(
    "Premium Section Four",
    "Testing The Statement",
    "A purpose statement that cannot be falsified is a slogan. Four questions decide whether yours is real.",
  );
  kit.y += 3;
  kit.para(
    "Most purpose statements fail for the same reason: they are written to sound true rather than to be checkable. These four questions are not motivational. Each one is designed to find the specific way your sentence is vague.",
    10.2,
  );
  kit.y += 5;

  [
    "Could a competitor say the same sentence without lying? If yes, it is not specific enough.",
    "Does it name a person, or a demographic? Demographics do not buy things, and they do not remember you.",
    "Does it promise an outcome someone would pay to skip the learning curve on?",
    "Could I deliver this tomorrow with what I already have? If not, what exactly is missing?",
  ].forEach((q, i) => {
    kit.ensure(22);
    kit.medal(String(i + 1), kit.M + 3.4, kit.y + 2.2, 3.3);
    kit.para(q, 10, kit.C.INK_SOFT, "normal", 10, 1.44);
    kit.y += 4;
  });

  kit.y += 2;
  writeIn(kit, "My refined statement, after the four tests", 3);

  kit.y += 1;
  callout(
    kit,
    "The standard to aim for",
    "A statement that survives all four tests will feel narrower than you want it to. That is the point — narrow is what makes it findable. You can always widen it once people are actually paying for the narrow version.",
    kit.C.GOLD,
  );
  kit.footer();
}

// ---------------------------------------------------------------------------
// Section 5 — wealth and legacy
// ---------------------------------------------------------------------------

export function premiumWealth(kit: PdfKit, profile: NumerologyProfile, name: string) {
  const ma = moneyArchetypes[profile.lifePath] ?? moneyArchetypes[1];
  const maExpr = moneyArchetypes[profile.expression] ?? moneyArchetypes[1];

  sectionPage(
    kit,
    "Premium · Wealth & Legacy",
    "Premium Section Five",
    "Wealth & Legacy Settings",
    "Most people do not have an income problem. They have a pattern that returns the income to zero at a predictable rate.",
  );

  kit.para(
    `Your Life Path ${profile.lifePath} sets the archetype: the way you are naturally built to earn. Your Expression ${profile.expression} sets the channel: the way that earning actually reaches you. When the two disagree, you will often earn well and keep nothing, or keep everything and earn too little to matter.`,
    10.4,
  );
  kit.y += 5;

  kit.ensure(40);
  const top = kit.y;
  kit.box(kit.M, top, kit.CW, 34, kit.C.CREAM_2, kit.C.GOLD, 1.6);
  kit.doc.setFillColor(kit.C.GOLD[0], kit.C.GOLD[1], kit.C.GOLD[2]);
  kit.doc.rect(kit.M, top, 1.1, 34, "F");
  kit.font(kit.FONT.ui, "bold", 5.9, kit.C.GOLD_DEEP, 0.9);
  kit.doc.text("YOUR MONEY ARCHETYPE", kit.M + 4, top + 6.4);
  kit.font(kit.FONT.display, "bold", 16, kit.C.INK, 0.4);
  kit.doc.text(`${ma.archetype}`, kit.M + 4, top + 15.6);
  kit.font(kit.FONT.body, "italic", 9.4, kit.C.INK_FAINT, 0);
  kit.doc.text(`Life Path ${profile.lifePath} · channelled through Expression ${profile.expression} (${maExpr.archetype})`, kit.M + 4, top + 22);
  kit.y = top + 34 + 5;

  labelled(kit, "How you naturally earn", ma.earns, kit.C.GOLD_DEEP);
  labelled(kit, "Where it leaks", ma.leaks, kit.C.ROSE);
  callout(kit, "Your one financial rule", ma.rule, kit.C.PURPLE);

  kit.y += 2;
  kit.eyebrow("The leak audit", kit.C.GOLD_DEEP);
  kit.y += 1.6;
  kit.para(
    "Look at the last three months of statements and mark every outgoing that did not produce something you could point at. The total is your leak rate. Most people find it is between ten and thirty percent.",
    9.9,
    kit.C.INK_SOFT,
  );
  kit.y += 4;
  const leakRows: [string, string][] = [
    ["Leak category", "Monthly cost"],
    ["Subscriptions I would not rebuy today", ""],
    ["Tools bought instead of sold", ""],
    ["Discounts given to avoid an awkward conversation", ""],
    ["Work started and abandoned", ""],
    ["Spending that was really emotional regulation", ""],
  ];
  leakRows.forEach(([label], i) => {
    kit.ensure(11);
    if (i === 0) {
      kit.font(kit.FONT.ui, "bold", 5.8, kit.C.GOLD_DEEP, 0.85);
      kit.doc.text(label.toUpperCase(), kit.M, kit.y);
      kit.doc.text("MONTHLY COST", kit.M + kit.CW - 30, kit.y);
      kit.y += 2.4;
      kit.rule(kit.CW, kit.C.GOLD, 0, 0.4);
      kit.y += 3.4;
    } else {
      kit.font(kit.FONT.body, "normal", 9.7, kit.C.INK_SOFT, 0);
      kit.doc.text(label, kit.M, kit.y);
      kit.doc.setDrawColor(kit.C.RULE[0], kit.C.RULE[1], kit.C.RULE[2]);
      kit.doc.setLineWidth(0.2);
      kit.doc.line(kit.M + kit.CW - 30, kit.y + 0.8, kit.M + kit.CW, kit.y + 0.8);
      kit.y += 8.6;
    }
  });
  kit.footer();

  // ---- legacy -------------------------------------------------------------
  kit.newPage("cream", "Premium · Wealth & Legacy");
  kit.fullPageTitle(
    "Premium Section Five",
    "The Legacy Builder",
    "Legacy is not what you leave behind. It is what keeps working after you stop.",
  );
  kit.y += 3;
  kit.para(
    "There is a useful test for whether something is a job or an asset: if you stopped completely for ninety days, would it survive? Most income does not. That is not a failure — it is a design choice, and it can be changed deliberately rather than by accident.",
    10.2,
  );
  kit.y += 4;

  kit.eyebrow("What I am currently building", kit.C.GOLD_DEEP);
  kit.y += 1.6;
  const buildRows: [string, string][] = [
    ["Income (stops when I stop)", "60"],
    ["Systems (keep working briefly)", "30"],
    ["Assets (keep working without me)", "10"],
  ];
  buildRows.forEach(([label, hint]) => {
    kit.ensure(13);
    kit.checkbox(kit.M, kit.y - 2.4);
    kit.font(kit.FONT.body, "normal", 9.7, kit.C.INK_SOFT, 0);
    kit.doc.text(`${label}`, kit.M + 5.4, kit.y);
    kit.font(kit.FONT.body, "italic", 8.8, kit.C.INK_FAINT, 0);
    kit.doc.text(hint, kit.M + 5.4, kit.y + 4.4);
    kit.y += 10;
  });
  kit.y += 3;

  writeIn(kit, "The thing I want still working in ten years", 2);
  writeIn(kit, "Who it serves when I am not in the room", 2);
  writeIn(kit, "The one asset I could start building this quarter", 2, "It does not need to be large. It needs to be yours.");

  kit.y += 1;
  callout(
    kit,
    "The uncomfortable question",
    "If everything you personally do stopped tomorrow, what would still be standing? The honest answer to that question is your actual net worth — regardless of what the bank says.",
    kit.C.GOLD,
  );

  writeIn(kit, "My answer", 3);
  kit.footer();
}

// ---------------------------------------------------------------------------
// Section 6 — personalised lucky codes
// ---------------------------------------------------------------------------

export function premiumLuckyCodes(kit: PdfKit, profile: NumerologyProfile, name: string) {
  const lc = luckyCodes[profile.lifePath] ?? luckyCodes[1];
  const lcExpr = luckyCodes[profile.expression] ?? luckyCodes[1];

  sectionPage(
    kit,
    "Premium · Personal Codes",
    "Premium Section Six",
    "Personalised Lucky Codes",
    "Colour, element, direction, day and number — mapped from your Life Path and cross-checked against your Expression.",
  );

  kit.para(luckyCodeDisclaimer, 9.8, kit.C.INK_FAINT, "italic");
  kit.y += 5;

  kit.ensure(46);
  const top = kit.y;
  kit.box(kit.M, top, kit.CW, 40, kit.C.CREAM_2, kit.C.GOLD, 1.6);
  kit.doc.setFillColor(kit.C.GOLD[0], kit.C.GOLD[1], kit.C.GOLD[2]);
  kit.doc.rect(kit.M, top, 1.1, 40, "F");
  kit.font(kit.FONT.ui, "bold", 5.9, kit.C.GOLD_DEEP, 0.9);
  kit.doc.text(`LIFE PATH ${profile.lifePath} · YOUR PRIMARY CODE`, kit.M + 4, top + 6.4);
  kit.y = top + 11;

  const codeRows: [string, string][] = [
    ["Power colours", lc.colors.join("  ·  ")],
    ["Crystal", lc.crystal],
    ["Element", lc.element],
    ["Direction", lc.direction],
    ["Favourable days", lc.days.join("  ·  ")],
    ["Favourable numbers", lc.numbers.join("  ·  ")],
  ];
  codeRows.forEach(([label, val]) => {
    kit.font(kit.FONT.ui, "bold", 5.8, kit.C.GOLD_DEEP, 0.8);
    kit.doc.text(label.toUpperCase(), kit.M + 4, kit.y + 3);
    kit.font(kit.FONT.body, "normal", 10, kit.C.INK, 0);
    kit.doc.text(val, kit.M + 44, kit.y + 3);
    kit.y += 4.6;
  });
  kit.y = top + 40 + 5;

  kit.eyebrow(`Expression ${profile.expression} · your secondary code`, kit.C.PURPLE);
  kit.y += 1.6;
  kit.para(
    `Where the primary code describes the environment you thrive in, the secondary code describes how you present. Yours adds ${lcExpr.colors.join(", ")} to the palette, ${lcExpr.crystal} to the stone set, and ${lcExpr.days.join(" and ")} as the days your expression is most fluent. Where the two codes disagree, treat the primary as the foundation and the secondary as the accent.`,
    10,
  );
  kit.y += 4;

  kit.eyebrow("How to actually use this", kit.C.GOLD_DEEP);
  kit.y += 1.6;
  [
    "Wear or work near your primary colours on days that require a difficult conversation.",
    "Put your favourable numbers in places you look at before deciding — a desk, a notebook cover, a password you type daily.",
    "Use your favourable days for initiating and your unfavourable days for completing.",
    "Keep the crystal on your desk rather than in a drawer. Its only job is to be a reminder that you chose a direction.",
  ].forEach((t) => {
    kit.ensure(10);
    kit.bullet(kit.M + 1.4, kit.y - 1.2);
    kit.para(t, 9.8, kit.C.INK_SOFT, "normal", 5.4, 1.4);
    kit.y += 0.8;
  });
  kit.footer();

  // ---- affirmations + ritual calendar ------------------------------------
  kit.newPage("cream", "Premium · Personal Codes");
  kit.fullPageTitle(
    "Premium Section Six",
    "Affirmations And The Ritual Calendar",
    "One sentence per number, written to be said out loud without embarrassment.",
  );
  kit.y += 3;

  const affKeys: [string, number][] = [
    ["Life Path", profile.lifePath],
    ["Expression", profile.expression],
    ["Soul Urge", profile.soulUrge],
    ["Personality", profile.personality],
    ["Birthday", profile.birthday],
    ["Personal Year", profile.personalYear],
  ].filter(([, n]) => affirmations[n as number]) as [string, number][];

  affKeys.forEach(([label, num]) => {
    kit.ensure(18);
    kit.font(kit.FONT.ui, "bold", 5.8, kit.C.GOLD_DEEP, 0.85);
    kit.doc.text(`${label.toUpperCase()} ${num}`, kit.M, kit.y);
    kit.y += 4.6;
    kit.font(kit.FONT.body, "italic", 11, kit.C.INK, 0);
    (kit.doc.splitTextToSize(`"${affirmations[num]}"`, kit.CW - 4) as string[]).forEach((ln, i) =>
      kit.doc.text(ln, kit.M + 4, kit.y + i * (11 * kit.PT2MM * 1.4)),
    );
    kit.y += (kit.doc.splitTextToSize(`"${affirmations[num]}"`, kit.CW - 4) as string[]).length * (11 * kit.PT2MM * 1.4) + 3.6;
  });

  kit.y += 2;
  kit.eyebrow("The ritual calendar", kit.C.GOLD_DEEP);
  kit.y += 1.6;
  kit.para(
    "Attach one practice to one recurring moment. A ritual that has no fixed trigger will not survive a busy month, and a ritual that does not survive a busy month is decoration.",
    9.9,
    kit.C.INK_SOFT,
  );
  kit.y += 4;

  const ritualRows: [string, string][] = [
    ["Weekly — the audit", "Every Sunday, answer one prompt from the Growth Prompts section in writing."],
    ["Monthly — the theme", "On the 1st, read your personal month focus and choose the single behaviour it implies."],
    ["Quarterly — the review", "Every 90 days, run the review protocol at the back of this workbook."],
    ["Annually — the reset", "On your birthday, re-read the Personal Year page and set the year's one theme."],
  ];
  ritualRows.forEach(([label, body]) => {
    kit.ensure(20);
    const rTop = kit.y;
    kit.font(kit.FONT.ui, "bold", 5.9, kit.C.PURPLE, 0.85);
    kit.font(kit.FONT.body, "normal", 9.7, kit.C.INK_SOFT, 0);
    const lines = kit.doc.splitTextToSize(body, kit.CW - 46) as string[];
    const ht = Math.max(16, 5.6 + lines.length * (9.7 * kit.PT2MM * 1.42) + 3);
    kit.box(kit.M, rTop, kit.CW, ht, kit.C.CREAM_2, kit.C.RULE_SOFT, 1.4);
    kit.font(kit.FONT.ui, "bold", 5.9, kit.C.PURPLE, 0.85);
    kit.doc.text(label.toUpperCase(), kit.M + 4, rTop + 5.6);
    kit.font(kit.FONT.body, "normal", 9.7, kit.C.INK_SOFT, 0);
    lines.forEach((ln, i) => kit.doc.text(ln, kit.M + 46, rTop + 5.6 + i * (9.7 * kit.PT2MM * 1.42)));
    kit.y = rTop + ht + 3.4;
  });
  kit.footer();
}

// ---------------------------------------------------------------------------
// Section 7 — life phase map, in depth
// ---------------------------------------------------------------------------

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function premiumLifePhaseMap(kit: PdfKit, profile: NumerologyProfile, name: string) {
  const pins = profile.pinnacles || [];
  const chs = profile.challenges || [];

  sectionPage(
    kit,
    "Premium · Life Phase Map",
    "Premium Section Seven",
    "The Life Phase Map",
    "Four pinnacles and four challenges, each with an age range. These are the longest arcs in your chart, and the ones people are least prepared for.",
  );

  kit.para(
    "A pinnacle is not a guarantee of good fortune. It is a description of the assignment. Some pinnacles arrive as opportunity and some arrive as obligation, and the same number can produce either depending on how deliberately you meet it. A challenge is not bad luck either — it is the specific skill you were not issued at birth and have to build yourself.",
    10.4,
  );
  kit.y += 5;

  kit.eyebrow("Your four pinnacles", kit.C.GOLD_DEEP);
  kit.y += 1.8;
  pins.forEach((p, i) => {
    const r = pinnacleReadings[p.number];
    kit.ensure(24);
    const top = kit.y;
    const range = p.ageEnd === null ? `Age ${p.ageStart} onward` : `Age ${p.ageStart} – ${p.ageEnd}`;
    kit.box(kit.M, top, kit.CW, 20, kit.C.CREAM_2, kit.C.RULE_SOFT, 1.4);
    kit.medal(String(p.number), kit.M + 9, top + 10, 5.4);
    kit.font(kit.FONT.ui, "bold", 5.7, kit.C.GOLD_DEEP, 0.85);
    kit.doc.text(`PINNACLE ${i + 1} · ${range.toUpperCase()}`, kit.M + 18, top + 6.4);
    kit.font(kit.FONT.display, "bold", 11.4, kit.C.INK, 0.3);
    kit.doc.text(r ? r.theme : `Pinnacle ${p.number}`, kit.M + 18, top + 12.4);
    kit.y = top + 23;
  });

  kit.y += 3;
  kit.eyebrow("Your four challenges", kit.C.ROSE);
  kit.y += 1.8;
  chs.forEach((c, i) => {
    const r = challengeReadings[c];
    kit.ensure(16);
    kit.font(kit.FONT.ui, "bold", 5.7, kit.C.ROSE, 0.85);
    kit.doc.text(`CHALLENGE ${i + 1}`, kit.M, kit.y);
    kit.font(kit.FONT.body, "normal", 9.8, kit.C.INK_SOFT, 0);
    kit.doc.text(`${c} — ${r ? r.lesson : "see the challenge pages that follow"}`, kit.M + 22, kit.y);
    kit.y += 7;
  });
  kit.footer();

  // ---- one page per pinnacle ---------------------------------------------
  pins.forEach((p, i) => {
    const r = pinnacleReadings[p.number];
    if (!r) return;
    kit.newPage("cream", "Premium · Life Phase Map");
    const range = p.ageEnd === null ? `Age ${p.ageStart} onward` : `Age ${p.ageStart} to ${p.ageEnd}`;
    kit.fullPageTitle(`Pinnacle ${i + 1} · ${range}`, `${r.theme}`, `Pinnacle number ${p.number}`);
    kit.y += 3;

    kit.ensure(34);
    const top = kit.y;
    kit.box(kit.M, top, kit.CW, 28, kit.C.CREAM_2, kit.C.GOLD, 1.6);
    kit.doc.setFillColor(kit.C.GOLD[0], kit.C.GOLD[1], kit.C.GOLD[2]);
    kit.doc.rect(kit.M, top, 1.1, 28, "F");
    kit.medal(String(p.number), kit.M + 13, top + 14, 8);
    kit.font(kit.FONT.ui, "bold", 5.9, kit.C.GOLD_DEEP, 0.9);
    kit.doc.text("THIS PHASE ASKS OF YOU", kit.M + 26, top + 8);
    kit.font(kit.FONT.body, "italic", 10.6, kit.C.INK, 0);
    (kit.doc.splitTextToSize(r.instruction, kit.CW - 34) as string[]).forEach((ln, k) =>
      kit.doc.text(ln, kit.M + 26, top + 13.4 + k * (10.6 * kit.PT2MM * 1.42)),
    );
    kit.y = top + 28 + 6;

    pairRow(kit, ["The opportunity", r.opportunity], ["The risk", r.risk], kit.C.GOLD_DEEP);
    pairRow(kit, ["Signs you are on track", r.onTrack], ["Signs you are off course", r.offCourse], kit.C.PURPLE);
    callout(kit, "The question for this phase", r.question, kit.C.PURPLE);

    kit.y += 1;
    writeIn(kit, "What I will build in this phase", 3, "Name one deliverable, not one intention.");
    writeIn(kit, "Who I will need", 2, "Nobody builds a pinnacle alone, even when the number says independence.");
    kit.footer();
  });

  // ---- two pages for the four challenges ---------------------------------
  for (let chunk = 0; chunk < 2; chunk++) {
    const slice = chs.slice(chunk * 2, chunk * 2 + 2);
    if (slice.length === 0) break;
    kit.newPage("cream", "Premium · Life Phase Map");
    kit.fullPageTitle(
      `Challenges ${chunk * 2 + 1}–${chunk * 2 + slice.length}`,
      chunk === 0 ? "The First Two Challenges" : "The Second Two Challenges",
      "A challenge is the skill you have to build rather than the talent you were given.",
    );
    kit.y += 3;

    slice.forEach((c, idx) => {
      const r = challengeReadings[c];
      if (!r) return;
      kit.ensure(70);
      kit.eyebrow(`Challenge ${chunk * 2 + idx + 1} · number ${c}`, kit.C.ROSE);
      kit.y += 1.6;
      kit.para(r.lesson, 10.4, kit.C.INK, "italic", 0, 1.42);
      kit.y += 4;

      pairRow(kit, ["The work", r.work], ["The trap", r.trap], kit.C.ROSE);
      callout(kit, "The practice", r.practice, kit.C.PURPLE);
      if (idx === 0) kit.y += 2;
    });
    kit.footer();
  }
}

// ---------------------------------------------------------------------------
// Section 8 — growth acceleration prompts
// ---------------------------------------------------------------------------

export function premiumGrowthPrompts(kit: PdfKit, profile: NumerologyProfile, name: string) {
  sectionPage(
    kit,
    "Premium · Growth Prompts",
    "Premium Section Eight",
    "Growth Acceleration Prompts",
    "Thirty-five questions across seven domains. Answer one per week for a year, or work through a domain at a time.",
  );

  kit.para(
    "A prompt only works if it is uncomfortable enough to slow you down and specific enough to answer in writing. Everything below is written to that standard. If a question feels easy, you have probably answered the polite version of it rather than the real one.",
    10.4,
  );
  kit.y += 4;

  kit.eyebrow("How to use these", kit.C.GOLD_DEEP);
  kit.y += 1.6;
  [
    "One question per week, in writing, for at least ten minutes. Speaking the answer does not count.",
    "Do not skip a question because you already know the answer. Write the answer anyway.",
    "Revisit a domain every quarter and compare your answers. The change is the data.",
  ].forEach((t) => {
    kit.ensure(10);
    kit.bullet(kit.M + 1.4, kit.y - 1.2);
    kit.para(t, 9.8, kit.C.INK_SOFT, "normal", 5.4, 1.4);
    kit.y += 0.8;
  });
  kit.footer();

  const groups: number[][] = [[0, 1], [2, 3], [4, 5], [6]];
  const titles = [
    "Identity, And Work And Craft",
    "Money, And Love And Connection",
    "Body, Boundaries And Voice",
    "Legacy And Direction",
  ];

  groups.forEach((group, gi) => {
    kit.newPage("cream", "Premium · Growth Prompts");
    kit.fullPageTitle(`Prompts · Set ${gi + 1} of 4`, titles[gi], "Write the answer, not the intention to answer.");
    kit.y += 3;

    group.forEach((domainIdx) => {
      const d = growthPrompts[domainIdx];
      if (!d) return;
      kit.ensure(26);
      kit.eyebrow(d.domain, kit.C.GOLD_DEEP);
      kit.y += 1.6;
      d.prompts.forEach((p, i) => {
        kit.ensure(20);
        kit.medal(String(i + 1), kit.M + 3.2, kit.y + 1.8, 2.9);
        kit.font(kit.FONT.body, "normal", 9.9, kit.C.INK, 0);
        const lines = kit.doc.splitTextToSize(p, kit.CW - 9) as string[];
        lines.forEach((ln, k) => kit.doc.text(ln, kit.M + 8.8, kit.y + k * (9.9 * kit.PT2MM * 1.42)));
        kit.y += lines.length * (9.9 * kit.PT2MM * 1.42) + 1;
        kit.writeLines(1, 8.8, 7, kit.CW - 8.8);
        kit.y += 2.4;
      });
      kit.y += 2.4;
    });
    kit.footer();
  });

  // ---- space for your own -------------------------------------------------
  kit.newPage("cream", "Premium · Growth Prompts");
  kit.fullPageTitle(
    "Prompts · Your Own",
    "The Questions You Would Not Write Down",
    "The prompts that matter most are the ones you would be slightly embarrassed to be asked.",
  );
  kit.y += 4;
  kit.para(
    "Write five questions you would not want to answer in front of the people who know you best. Then answer the one that made you pause.",
    10.2,
  );
  kit.y += 5;
  for (let i = 0; i < 5; i++) {
    kit.ensure(22);
    kit.medal(String(i + 1), kit.M + 3.2, kit.y + 2, 3.1);
    kit.writeLines(2, 8.8, 7.2, kit.CW - 8.8);
    kit.y += 4;
  }

  kit.y += 3;
  kit.eyebrow("Now answer the one that made you pause", kit.C.GOLD_DEEP);
  kit.y += 1.6;
  kit.para(
    "Not the most flattering one, and not the easiest. The one that produced a small physical reaction when you wrote it down. That reaction is the useful part.",
    9.9,
    kit.C.INK_SOFT,
    "normal",
    0,
    1.44,
  );
  kit.y += 2;
  kit.writeLines(5);
  kit.y += 2;

  callout(
    kit,
    "If you only do one thing",
    "Work through the thirty-five prompts at one per week for a year, in writing. Everything else in this workbook is a framework for that single habit — the habit is the product.",
    kit.C.PURPLE,
  );
  kit.footer();
}

// ---------------------------------------------------------------------------
// Section 9 — annual forecast, deep dive
// ---------------------------------------------------------------------------

const PERSONAL_YEAR_DEEP: Record<number, { title: string; purpose: string; warning: string; build: string }> = {
  1: { title: "The Year of Initiation", purpose: "This is the first year of a nine-year wave and the only year where starting costs nothing extra. Whatever you plant now sets the ceiling for the next eight years.", warning: "Waiting for conditions to improve. In a 1 year, conditions are the best they will be for a decade — the risk is hesitation, not error.", build: "One new commitment that you intend to still be running in three years." },
  2: { title: "The Year of Patience", purpose: "Everything planted last year is underground. This year rewards relationships, timing and quiet persistence rather than visible effort.", warning: "Reading the lack of visible progress as failure and abandoning something that is actually growing.", build: "One relationship and one habit, tended deliberately rather than urgently." },
  3: { title: "The Year of Expression", purpose: "The year the work becomes visible. Communication, publishing, and being seen produce disproportionate returns.", warning: "Scattering across too many channels and finishing nothing. Visibility without a focus is noise.", build: "One body of work, published consistently, under one name." },
  4: { title: "The Year of Foundation", purpose: "A consolidation year. Systems, structure, and the unglamorous work that makes the next five years possible.", warning: "Confusing rigidity with discipline and refusing to adapt when conditions change.", build: "One system that removes you as the bottleneck." },
  5: { title: "The Year of Change", purpose: "Movement, expansion, and the disruption that clears space. Opportunities arrive that were not available last year.", warning: "Changing everything at once. In a 5 year the temptation is to burn it all down and call it freedom.", build: "One deliberate change, fully completed, rather than five started." },
  6: { title: "The Year of Responsibility", purpose: "Family, home, service and commitment. The year where the personal life demands to be taken as seriously as the professional one.", warning: "Becoming indispensable to everybody and calling it love.", build: "One commitment that includes your own needs in the terms." },
  7: { title: "The Year of Depth", purpose: "The inward year. Study, mastery and the kind of understanding that cannot be rushed. Income often dips here, and that is normal.", warning: "Disappearing so completely that the people who matter stop being able to reach you.", build: "One genuine expertise, deepened rather than broadened." },
  8: { title: "The Year of Harvest", purpose: "The payoff year. Money, power, ownership and recognition for work done in the previous seven years.", warning: "Measuring everything and valuing only what can be measured.", build: "One negotiation for ownership rather than income." },
  9: { title: "The Year of Completion", purpose: "The final year of the wave. Release, closure and the clearing that makes the next cycle possible.", warning: "Clinging to what is finished because it is familiar.", build: "One major ending, completed properly rather than allowed to fade." },
  11: { title: "The Year of Illumination", purpose: "An intensified 2 year. Sensitivity, vision and creative reach are heightened, and so is anxiety.", warning: "Living inside the insight and never landing it in the physical world.", build: "One vision, given a deadline and a witness." },
  22: { title: "The Year of the Great Work", purpose: "An intensified 4 year. Capacity for building at genuine scale is unusually high.", warning: "Carrying the entire structure alone.", build: "One team, assembled before it is strictly needed." },
  33: { title: "The Year of Teaching", purpose: "An intensified 6 year. Service, community and leading through care.", warning: "Serving until there is nothing left to serve from.", build: "One container that refills you as it serves others." },
};

export function premiumForecastDeep(kit: PdfKit, profile: NumerologyProfile, name: string) {
  const py = PERSONAL_YEAR_DEEP[profile.personalYear] ?? PERSONAL_YEAR_DEEP[1];
  const now = new Date();
  const year = now.getFullYear();

  sectionPage(
    kit,
    "Premium · Annual Forecast",
    "Premium Section Nine",
    `Your Personal Year ${profile.personalYear} In Depth`,
    `${year} is not a neutral year for you. It has a specific assignment, and the assignment changes every twelve months.`,
  );

  kit.ensure(52);
  const top = kit.y;
  kit.box(kit.M, top, kit.CW, 46, kit.C.CREAM_2, kit.C.GOLD, 1.6);
  kit.doc.setFillColor(kit.C.GOLD[0], kit.C.GOLD[1], kit.C.GOLD[2]);
  kit.doc.rect(kit.M, top, 1.1, 46, "F");
  kit.font(kit.FONT.ui, "bold", 5.9, kit.C.GOLD_DEEP, 0.9);
  kit.doc.text(`PERSONAL YEAR ${profile.personalYear}`, kit.M + 4, top + 7);
  kit.font(kit.FONT.display, "bold", 17, kit.C.INK, 0.4);
  kit.doc.text(py.title, kit.M + 4, top + 17);
  kit.font(kit.FONT.body, "normal", 9.9, kit.C.INK_SOFT, 0);
  (kit.doc.splitTextToSize(py.purpose, kit.CW - 10) as string[]).forEach((ln, i) =>
    kit.doc.text(ln, kit.M + 4, top + 24 + i * (9.9 * kit.PT2MM * 1.44)),
  );
  kit.y = top + 46 + 6;

  labelled(kit, "What to watch for", py.warning, kit.C.ROSE);
  callout(kit, "What to build this year", py.build, kit.C.PURPLE);

  kit.y += 2;
  kit.eyebrow("Where you are in the nine-year wave", kit.C.GOLD_DEEP);
  kit.y += 1.8;
  kit.para(
    "The nine-year cycle is not a metaphor for progress — it is a description of sequence. Each year's work only produces its result if the previous year's work was done. A 1 year that was spent hesitating produces a thin 8 year eight years later, because there was nothing to harvest.",
    9.9,
    kit.C.INK_SOFT,
  );
  kit.y += 4;

  const norm = profile.personalYear === 11 ? 2 : profile.personalYear === 22 ? 4 : profile.personalYear === 33 ? 6 : profile.personalYear;
  const waves = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const colW = (kit.CW - 8 * 1.4) / 9;
  kit.ensure(30);
  const wTop = kit.y;
  waves.forEach((w, i) => {
    const x = kit.M + i * (colW + 1.4);
    const active = w === norm;
    kit.box(x, wTop, colW, 22, active ? kit.C.GOLD : kit.C.CREAM_2, active ? kit.C.GOLD_DEEP : kit.C.RULE_SOFT, 1.2);
    kit.font(kit.FONT.display, "bold", 11, active ? kit.C.INK : kit.C.INK_FAINT, 0);
    kit.textAt(String(w), x + colW / 2, wTop + 9, "center");
    kit.font(kit.FONT.ui, "bold", 4.6, active ? kit.C.INK : kit.C.INK_FAINT, 0.4);
    kit.textAt(active ? "NOW" : "", x + colW / 2, wTop + 14.4, "center");
  });
  kit.y = wTop + 22 + 6;
  kit.para(
    `You are in position ${norm} of 9. ${norm < 5 ? "You are still in the building half of the wave, which means effort compounds rather than pays out." : "You are in the harvesting half of the wave, which means the results arriving now were earned two to four years ago."}`,
    9.8,
    kit.C.INK_FAINT,
    "italic",
  );
  kit.footer();

  // ---- four months per page, with real detail -----------------------------
  for (let q = 0; q < 3; q++) {
    const slice = profile.personalMonths.slice(q * 4, q * 4 + 4);
    if (slice.length === 0) break;
    kit.newPage("cream", "Premium · Annual Forecast");
    const startM = (now.getMonth() + q * 4) % 12;
    kit.fullPageTitle(
      `Months ${q * 4 + 1}–${q * 4 + slice.length} Ahead`,
      "The Month-By-Month Deep Dive",
      "Each month below carries its own number, theme, and a specific instruction.",
    );
    kit.y += 3;

    slice.forEach((m, idx) => {
      const focus = kit.monthlyFocus[m];
      const monthIdx = (startM + idx) % 12;
      const label = MONTH_NAMES[monthIdx];
      kit.ensure(52);
      const top2 = kit.y;
      kit.font(kit.FONT.body, "normal", 9.4, kit.C.INK_SOFT, 0);
      const doLines = kit.doc.splitTextToSize(focus.do, kit.CW - 60) as string[];
      const ht = Math.max(30, 22 + doLines.length * (9.4 * kit.PT2MM * 1.4));
      kit.box(kit.M, top2, kit.CW, ht, kit.C.CREAM_2, kit.C.RULE_SOFT, 1.4);
      kit.medal(String(m), kit.M + 10, top2 + 12, 6.6);
      kit.font(kit.FONT.ui, "bold", 5.6, kit.C.GOLD_DEEP, 0.85);
      kit.doc.text(label.toUpperCase(), kit.M + 20, top2 + 5.6);
      kit.font(kit.FONT.display, "bold", 11.6, kit.C.INK, 0.3);
      kit.doc.text(focus.theme, kit.M + 20, top2 + 12);
      kit.font(kit.FONT.body, "normal", 9.4, kit.C.INK_SOFT, 0);
      doLines.forEach((ln, k) => kit.doc.text(ln, kit.M + 20, top2 + 17.4 + k * (9.4 * kit.PT2MM * 1.4)));
      const yy = top2 + 17.4 + doLines.length * (9.4 * kit.PT2MM * 1.4) + 2;
      kit.font(kit.FONT.ui, "bold", 5.2, kit.C.ROSE, 0.7);
      kit.doc.text("AVOID", kit.M + 20, yy);
      kit.font(kit.FONT.body, "normal", 8.8, kit.C.INK_SOFT, 0);
      (kit.doc.splitTextToSize(focus.avoid, kit.CW - 34) as string[]).forEach((ln, k) =>
        kit.doc.text(ln, kit.M + 32, yy + k * (8.8 * kit.PT2MM * 1.36)),
      );
      kit.y = top2 + ht + 4;
    });
    kit.footer();
  }
}

// ---------------------------------------------------------------------------
// Section 10 — personal operating system
// ---------------------------------------------------------------------------

export function premiumOperatingSystem(kit: PdfKit, profile: NumerologyProfile, name: string) {
  const lp = kit.numberPrinciples[profile.lifePath] ?? [];
  const sh = shadowProfiles[profile.lifePath];

  sectionPage(
    kit,
    "Premium · Operating System",
    "Premium Section Ten",
    "Your Personal Operating System",
    "One page you can actually keep in front of you. Everything above, compressed into decisions.",
  );

  kit.para(
    "A workbook is useless if it lives on a shelf. This section reduces the previous thirty pages into something you can read in ninety seconds on a difficult morning — decision rules, red lines, and a rhythm.",
    10.4,
  );
  kit.y += 5;

  kit.eyebrow("Your five operating principles", kit.C.GOLD_DEEP);
  kit.y += 1.8;
  const principles = [...lp];
  if (principles.length < 5) {
    principles.push(
      `Lead with the standard, not the pressure.`,
      `Change one variable at a time.`,
    );
  }
  principles.slice(0, 5).forEach((p, i) => {
    kit.ensure(16);
    kit.medal(String(i + 1), kit.M + 3.4, kit.y + 2, 3.2);
    kit.para(p, 10.6, kit.C.INK, "normal", 9.4, 1.4);
    kit.y += 3;
  });
  kit.y += 2;

  kit.eyebrow("Your decision filter", kit.C.PURPLE);
  kit.y += 1.8;
  const decisions: [string, string][] = [
    ["If it requires me to abandon my design", "Decline. It will cost more than it pays."],
    ["If it is aligned but the timing is wrong", "Wait, and say when you will revisit it."],
    ["If it is aligned and the timing is right", `Say yes within 48 hours. Life Path ${profile.lifePath} rarely regrets a decisive yes.`],
    ["If I cannot tell whether it is aligned", "It is not. Clarity is not a luxury for your number."],
  ];
  decisions.forEach(([cond, act]) => {
    kit.ensure(18);
    const top = kit.y;
    kit.font(kit.FONT.body, "normal", 9.7, kit.C.INK_SOFT, 0);
    const condLines = kit.doc.splitTextToSize(cond, kit.CW / 2 - 8) as string[];
    const actLines = kit.doc.splitTextToSize(act, kit.CW / 2 - 8) as string[];
    const ht = Math.max(16, Math.max(condLines.length, actLines.length) * (9.7 * kit.PT2MM * 1.4) + 6);
    kit.box(kit.M, top, kit.CW, ht, kit.C.CREAM_2, kit.C.RULE_SOFT, 1.4);
    kit.doc.setDrawColor(kit.C.RULE[0], kit.C.RULE[1], kit.C.RULE[2]);
    kit.doc.setLineWidth(0.2);
    kit.doc.line(kit.M + kit.CW / 2, top + 2, kit.M + kit.CW / 2, top + ht - 2);
    condLines.forEach((ln, i) => kit.doc.text(ln, kit.M + 3, top + 5.4 + i * (9.7 * kit.PT2MM * 1.4)));
    kit.font(kit.FONT.body, "normal", 9.7, kit.C.INK, 0);
    actLines.forEach((ln, i) => kit.doc.text(ln, kit.M + kit.CW / 2 + 3, top + 5.4 + i * (9.7 * kit.PT2MM * 1.4)));
    kit.y = top + ht + 3;
  });

  kit.y += 2;
  if (sh) {
    callout(kit, "The one pattern to interrupt", `${sh.loop}: ${sh.practice}`, kit.C.ROSE);
  }
  kit.footer();

  // ---- the 90-day board ---------------------------------------------------
  kit.newPage("cream", "Premium · Operating System");
  kit.fullPageTitle(
    "Premium Section Ten",
    "The Ninety-Day Execution Board",
    "Ninety days is the shortest interval in which a new behaviour becomes evidence.",
  );
  kit.y += 3;
  kit.para(
    "Fill this in with three outcomes, not three activities. An outcome is something that will be true at the end of the quarter whether or not you feel motivated in week seven. Then break each one into the single weekly action that moves it.",
    10.2,
  );
  kit.y += 5;

  for (let i = 0; i < 3; i++) {
    kit.ensure(46);
    const top = kit.y;
    kit.box(kit.M, top, kit.CW, 42, kit.C.CREAM_2, kit.C.RULE_SOFT, 1.4);
    kit.medal(String(i + 1), kit.M + 8, top + 8, 5);
    kit.font(kit.FONT.ui, "bold", 5.7, kit.C.GOLD_DEEP, 0.85);
    kit.doc.text("OUTCOME", kit.M + 16, top + 5.6);
    kit.font(kit.FONT.body, "normal", 9.6, kit.C.INK, 0);
    kit.doc.setDrawColor(kit.C.RULE[0], kit.C.RULE[1], kit.C.RULE[2]);
    kit.doc.setLineWidth(0.2);
    kit.doc.line(kit.M + 16, top + 11, kit.M + kit.CW - 4, top + 11);
    kit.font(kit.FONT.ui, "bold", 5.7, kit.C.PURPLE, 0.85);
    kit.doc.text("THE WEEKLY ACTION THAT MOVES IT", kit.M + 16, top + 16);
    kit.doc.line(kit.M + 16, top + 21.4, kit.M + kit.CW - 4, top + 21.4);
    kit.font(kit.FONT.ui, "bold", 5.7, kit.C.GOLD_DEEP, 0.85);
    kit.doc.text("WHAT I WILL STOP DOING TO MAKE ROOM", kit.M + 16, top + 26.4);
    kit.doc.line(kit.M + 16, top + 31.8, kit.M + kit.CW - 4, top + 31.8);
    kit.font(kit.FONT.ui, "bold", 5.7, kit.C.ROSE, 0.85);
    kit.doc.text("THE COST IF I DO NOT", kit.M + 16, top + 36.4);
    kit.y = top + 42 + 4.4;
  }
  kit.footer();

  // ---- quarterly review protocol -----------------------------------------
  kit.newPage("cream", "Premium · Operating System");
  kit.fullPageTitle(
    "Premium Section Ten",
    "The Quarterly Review Protocol",
    "Ninety minutes, four times a year. This is the mechanism that keeps the rest of the workbook alive.",
  );
  kit.y += 3;
  kit.para(
    "Do this on the same date every quarter, in the same place, with the previous quarter's answers in front of you. The ritual matters less than the comparison — reviewing the last quarter is the only way to see a pattern rather than an incident.",
    10.2,
  );
  kit.y += 5;

  const protocol: [string, string, number][] = [
    ["Part one — evidence", "Read the three outcomes from the board. Which are true? Do not explain, justify, or contextualise. Write only what is factually the case.", 3],
    ["Part two — pattern", "Which behaviour produced the result, and which behaviour only produced activity? Name the specific coping move from your shadow section if it appeared.", 3],
    ["Part three — cost", "What did the quarter cost — in money, sleep, relationships, or self-respect? Be exact rather than dramatic.", 2],
    ["Part four — keep", "What worked well enough to keep exactly as it is? Most people skip this and rebuild what was already fine.", 2],
    ["Part five — release", "What are you carrying that is complete? Name it, and name the date you will close it.", 2],
    ["Part six — the next theme", "One sentence. It should name a behaviour, not a feeling. Write it where you will see it daily.", 2],
  ];
  protocol.forEach(([label, body, lines], i) => {
    kit.ensure(30);
    kit.eyebrow(label, kit.C.GOLD_DEEP);
    kit.y += 1.4;
    kit.para(body, 9.8, kit.C.INK_SOFT, "normal", 0, 1.44);
    kit.y += 2;
    kit.writeLines(lines as number);
    kit.y += 3.4;
    if (i === 2) {
      kit.footer();
      kit.newPage("cream", "Premium · Operating System");
    }
  });

  // the second protocol page would otherwise sit two-thirds empty
  kit.y += 3;
  kit.eyebrow("The annual reset", kit.C.GOLD_DEEP);
  kit.y += 1.6;
  kit.para(
    "Once a year — your birthday is the natural anchor — re-read the Personal Year page and set a single theme for the year ahead. It is the only review in this workbook that looks forward rather than back.",
    9.8,
    kit.C.INK_SOFT,
    "normal",
    0,
    1.44,
  );
  kit.y += 3;
  writeIn(kit, "My theme for the year ahead", 2, "One sentence. A behaviour, not a feeling.");
  kit.y += 1;
  callout(
    kit,
    "Keeping this workbook alive",
    "A workbook read once has the same value as a horoscope. Ninety minutes, four times a year, is the entire maintenance cost — and it is the difference between a document you own and a document you used.",
    kit.C.PURPLE,
  );
  kit.footer();
}

// ---------------------------------------------------------------------------
// Section 11 — printable journals
// ---------------------------------------------------------------------------

export function premiumJournals(kit: PdfKit, profile: NumerologyProfile, name: string) {
  // ---- weekly review spread ----------------------------------------------
  for (let w = 0; w < 2; w++) {
    kit.newPage("cream", "Premium · Printable Journals");
    kit.fullPageTitle(
      `Printable · Weekly Review ${w + 1} of 2`,
      "The Weekly Review",
      "Ten minutes, same day each week. Photocopy this page rather than printing the whole workbook again.",
    );
    kit.y += 3;

    kit.ensure(20);
    kit.font(kit.FONT.ui, "bold", 5.7, kit.C.GOLD_DEEP, 0.85);
    kit.doc.text("WEEK COMMENCING", kit.M, kit.y);
    kit.doc.setDrawColor(kit.C.RULE[0], kit.C.RULE[1], kit.C.RULE[2]);
    kit.doc.setLineWidth(0.2);
    kit.doc.line(kit.M + 32, kit.y + 0.8, kit.M + 96, kit.y + 0.8);
    kit.doc.text("PERSONAL MONTH", kit.M + 108, kit.y);
    kit.doc.line(kit.M + 138, kit.y + 0.8, kit.M + 168, kit.y + 0.8);
    kit.y += 8;

    const blocks: [string, number][] = [
      ["What actually happened this week", 3],
      ["Where my shadow pattern ran", 2],
      ["What I avoided, and what it cost", 2],
      ["One thing that worked and should be repeated", 2],
      ["The single priority for next week", 1],
      ["The boundary I will hold", 1],
    ];
    blocks.forEach(([label, lines]) => {
      kit.ensure(14 + lines * 7.4);
      kit.eyebrow(label, kit.C.GOLD_DEEP);
      kit.writeLines(lines);
      kit.y += 3;
    });

    kit.y += 1;
    kit.eyebrow("How aligned did this week feel?", kit.C.PURPLE);
    kit.y += 2.4;
    const cx = kit.M + 6;
    for (let i = 0; i < 5; i++) {
      kit.doc.setDrawColor(kit.C.GOLD_DEEP[0], kit.C.GOLD_DEEP[1], kit.C.GOLD_DEEP[2]);
      kit.doc.setLineWidth(0.4);
      kit.doc.circle(cx + i * 12, kit.y, 3.2, "S");
    }
    kit.y += 9;
    kit.font(kit.FONT.ui, "normal", 5.4, kit.C.INK_FAINT, 0.6);
    kit.doc.text("1 · DRIFTING", cx - 3, kit.y);
    kit.textAt("5 · ALIGNED", cx + 48 + 3, kit.y, "center");
    kit.footer();
  }

  // ---- monthly tracker ---------------------------------------------------
  kit.newPage("cream", "Premium · Printable Journals");
  kit.fullPageTitle(
    "Printable · Monthly Tracker",
    "The Monthly Tracker",
    "One row per month. Twelve months on a single page makes the pattern impossible to miss.",
  );
  kit.y += 3;

  const headers = ["Month", "PM", "Theme", "Energy 1-5", "Key win", "What I released"];
  const widths = [26, 10, 32, 18, 44, 42];
  kit.ensure(14);
  let hx = kit.M;
  kit.font(kit.FONT.ui, "bold", 5.6, kit.C.GOLD_DEEP, 0.8);
  headers.forEach((h2, i) => {
    kit.doc.text(h2.toUpperCase(), hx + 1, kit.y);
    hx += widths[i];
  });
  kit.y += 2.4;
  kit.rule(kit.CW, kit.C.GOLD, 0, 0.4);
  kit.y += 5;

  for (let i = 0; i < 12; i++) {
    kit.ensure(14);
    let x = kit.M;
    kit.font(kit.FONT.body, "normal", 9, kit.C.INK_SOFT, 0);
    kit.doc.text(MONTH_NAMES[i], x + 1, kit.y);
    x += widths[0];
    const pm = profile.personalMonths[i] ?? "";
    kit.font(kit.FONT.display, "bold", 9.6, kit.C.GOLD_DEEP, 0);
    kit.doc.text(String(pm), x + 2, kit.y);
    x += widths[1];
    kit.font(kit.FONT.body, "normal", 8.8, kit.C.INK_SOFT, 0);
    const pmTheme = kit.monthlyFocus[Number(pm)]?.theme ?? "";
    kit.doc.text(pmTheme, x + 1, kit.y);
    // ruled write-in cells
    const rx = kit.M + widths[0] + widths[1] + widths[2] + widths[3];
    kit.doc.setDrawColor(kit.C.RULE[0], kit.C.RULE[1], kit.C.RULE[2]);
    kit.doc.setLineWidth(0.2);
    kit.doc.line(rx, kit.y + 1.2, kit.M + kit.CW, kit.y + 1.2);
    kit.doc.line(kit.M + widths[0] + widths[1] + widths[2], kit.y + 1.2, kit.M + widths[0] + widths[1] + widths[2] + widths[3], kit.y + 1.2);
    kit.y += 11.5;
  }
  kit.footer();

  // ---- yearly map --------------------------------------------------------
  kit.newPage("cream", "Premium · Printable Journals");
  kit.fullPageTitle(
    "Printable · The Year At A Glance",
    "The Year At A Glance",
    "Fill this in at the end of the year, then keep it. Five of these side by side is a life pattern.",
  );
  kit.y += 3;

  kit.ensure(30);
  kit.font(kit.FONT.ui, "bold", 5.7, kit.C.GOLD_DEEP, 0.85);
  kit.doc.text("YEAR", kit.M, kit.y);
  kit.doc.setDrawColor(kit.C.RULE[0], kit.C.RULE[1], kit.C.RULE[2]);
  kit.doc.setLineWidth(0.2);
  kit.doc.line(kit.M + 14, kit.y + 0.8, kit.M + 60, kit.y + 0.8);
  kit.doc.text("PERSONAL YEAR", kit.M + 72, kit.y);
  kit.doc.line(kit.M + 104, kit.y + 0.8, kit.M + 134, kit.y + 0.8);
  kit.y += 10;

  const yBlocks: [string, number][] = [
    ["The theme that actually defined this year", 2],
    ["The most important thing I built", 2],
    ["The most important thing I released", 2],
    ["The lesson I paid the most for", 3],
    ["What I now know about my own pattern", 3],
    ["What I am taking into next year", 2],
    ["What I am leaving behind", 2],
  ];
  yBlocks.forEach(([label, lines]) => {
    kit.ensure(14 + lines * 7.4);
    kit.eyebrow(label, kit.C.GOLD_DEEP);
    kit.writeLines(lines);
    kit.y += 3;
  });

  kit.y += 2;
  callout(
    kit,
    "The five-year test",
    "Read this page again in five years. If the answers have not changed, the workbook was decoration. If they have changed in ways you did not plan, you were paying attention.",
    kit.C.PURPLE,
  );
  kit.footer();
}


