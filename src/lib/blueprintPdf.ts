import jsPDF from "jspdf";
import { type NumerologyProfile } from "@/lib/numerology";
import { getInterpretation, birthdayInterpretations } from "@/lib/interpretations";
import { PDF_FONTS, FONT } from "@/lib/pdfFonts";
import {
  type PdfKit,
  premiumInnerArchitecture,
  premiumShadowAnalysis,
  premiumRelationship,
  premiumCareer,
  premiumWealth,
  premiumLuckyCodes,
  premiumLifePhaseMap,
  premiumGrowthPrompts,
  premiumForecastDeep,
  premiumOperatingSystem,
  premiumJournals,
} from "@/lib/premiumPdf";

/** Which edition to build. The premium edition is a strict superset. */
export type BlueprintTier = "free" | "premium";

export interface BlueprintOptions {
  tier?: BlueprintTier;
}

// ---------------------------------------------------------------------------
// Brand + reference tables
// ---------------------------------------------------------------------------
type RGB = [number, number, number];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const monthlyFocus: Record<number, { theme: string; do: string; avoid: string; ritual: string }> = {  1: { theme: "Initiation", do: "Choose one bold beginning and make the first visible move.", avoid: "Waiting for universal permission.", ritual: "Write one sentence that starts with: I am ready to lead by…" },
  2: { theme: "Partnership", do: "Strengthen one relationship through listening, patience, or repair.", avoid: "Absorbing everyone else’s emotions.", ritual: "Ask: what needs gentleness instead of force this week?" },
  3: { theme: "Expression", do: "Publish, pitch, write, record, design, or share something alive.", avoid: "Hiding your voice behind perfectionism.", ritual: "Create for 20 minutes before consuming anything." },
  4: { theme: "Foundation", do: "Turn an idea into a system: calendar, checklist, budget, or routine.", avoid: "Mistaking busyness for stability.", ritual: "Clear one friction point from your daily environment." },
  5: { theme: "Liberation", do: "Experiment intelligently; change the pattern, not your whole life at once.", avoid: "Impulsive escapes disguised as intuition.", ritual: "Name the habit you are outgrowing and the behavior replacing it." },
  6: { theme: "Devotion", do: "Care for home, body, beauty, family, and emotional responsibility.", avoid: "Rescuing people who have not asked to be saved.", ritual: "Make one space feel premium, and cared for." },
  7: { theme: "Wisdom", do: "Go deeper: research, reflect, pray, study, investigate, restore.", avoid: "Withdrawing so far that nobody can reach you.", ritual: "Spend 12 quiet minutes with one question and no phone." },
  8: { theme: "Power", do: "Make the adult decision around money, leadership, pricing, or boundaries.", avoid: "Playing small to stay likable.", ritual: "Write the number, boundary, or ask you have been avoiding." },
  9: { theme: "Completion", do: "Release what is complete; preserve only the wisdom.", avoid: "Keeping expired obligations alive out of guilt.", ritual: "Close one loop: delete, donate, forgive, archive, or finish." },
  11: { theme: "Illumination", do: "Trust the signal, then ground it into one practical action.", avoid: "Living only in signs without execution.", ritual: "Capture three intuitive hits, then choose one to test." },
  22: { theme: "Master Builder", do: "Give your vision architecture: scope, timeline, people, proof.", avoid: "Carrying the whole mountain alone.", ritual: "Break the big dream into the next three concrete deliverables." },
  33: { theme: "Compassionate Leadership", do: "Serve from overflow, teach through example, and protect your energy.", avoid: "Martyrdom marketed as love.", ritual: "Choose one helpful act that does not require self-abandonment." },
};

export const numberPrinciples: Record<number, string[]> = {
  1: ["Lead before you feel fully ready.", "Choose clean independence, not isolation.", "Let originality be useful, not merely different."],
  2: ["Sensitivity is data; boundaries make it sustainable.", "Partnership improves when truth stays kind.", "Your pace matters as much as the outcome."],
  3: ["Expression turns emotion into movement.", "Joy is a strategy when it creates connection.", "Finish small creative loops to build trust with your voice."],
  4: ["Freedom expands when foundations are strong.", "Your magic works better with a calendar.", "Build slowly enough that the structure can hold success."],
  5: ["Change is sacred when it has direction.", "Curiosity beats rebellion when the stakes are real.", "Adventure needs a landing pad."],
  6: ["Love without self-erasure.", "Beauty is a form of nervous-system leadership.", "Responsibility is powerful when it includes you."],
  7: ["Depth is your advantage.", "Solitude should clarify, not harden.", "Let evidence and intuition sit at the same table."],
  8: ["Power is stewardship.", "Money responds to clarity, value, and boundaries.", "Lead with standards, not pressure."],
  9: ["Completion creates space for the right future.", "Compassion needs discernment.", "Your story can become service after it becomes wisdom."],
  11: ["Your sensitivity needs grounding practices.", "Inspiration becomes trustworthy through action.", "Light is strongest when it has a vessel."],
  22: ["Vision requires operational rhythm.", "Great work needs delegation and proof.", "Build what can outlive your mood."],
  33: ["Healing leadership starts with self-respect.", "Teach what you embody.", "Protect the gift from overgiving."],
};

interface NumberDetail {
  whatItMeans: string;
  strengths: string;
  shadows: string;
  decision: string;
  relationship: string;
  career: string;
  actions: string[];
  prompts: string[];
}

const numberDetails: Record<number, NumberDetail> = {
  1: {
    whatItMeans: "The number of independence, leadership, and pioneering action. It represents the spark of initiation and the courage to stand alone.",
    strengths: "Originality, self-reliance, initiative, unwavering focus, and creative drive.",
    shadows: "Stubbornness, impatience, self-centeredness, and a tendency to isolate when stressed.",
    decision: "Trust your internal signal. Make the choice that honors your independence rather than waiting for consensus.",
    relationship: "Thrives when given autonomy and space. Needs a partner who respects their drive and individuality.",
    career: "Best suited for leadership, entrepreneurship, or roles requiring solo execution and pioneering ideas.",
    actions: [
      "Launch one small project or initiative today.",
      "Take 10 minutes of complete silent solitude to ground your vision.",
      "Make a decision you have been delaying out of fear."
    ],
    prompts: [
      "Where am I waiting for permission to lead in my life?",
      "In what areas does my independence block healthy collaboration?",
      "What is the next bold boundary I need to set?"
    ]
  },
  2: {
    whatItMeans: "The number of peace, cooperation, sensitivity, and partnership. It represents the quiet strength of collaboration and deep intuition.",
    strengths: "Empathy, diplomacy, listening, harmony-building, and attention to detail.",
    shadows: "Self-erasure, over-sensitivity, fear of conflict, and passive-aggression.",
    decision: "Consider the relational impact. Seek consensus and harmony, but do not compromise your core integrity.",
    relationship: "Highly devoted and empathetic. Thrives in stable, peaceful, and communicative partnerships.",
    career: "Excels in mediation, advisory roles, collaborative team environments, and detailed work.",
    actions: [
      "Listen actively to someone today without offering advice.",
      "Clear one point of friction in an important relationship.",
      "Take a gentle, slow walk to calm your nervous system."
    ],
    prompts: [
      "Where am I swallowing my truth to keep a false peace?",
      "How can I use my sensitivity as a strength rather than a vulnerability?",
      "What partnership in my life needs nurturing right now?"
    ]
  },
  3: {
    whatItMeans: "The number of self-expression, joy, communication, and creative spirit. It represents the flow of inspiration and social connection.",
    strengths: "Charisma, artistic vision, verbal skill, optimism, and emotional expressiveness.",
    shadows: "Scattered energy, superficiality, moodiness, and fear of criticism.",
    decision: "Choose the path that allows for expression and brings genuine joy. Avoid choices that stifle your voice.",
    relationship: "Playful, expressive, and fun-loving. Needs open communication and appreciation from their partner.",
    career: "Perfect for writing, speaking, acting, designing, marketing, or any creative industry.",
    actions: [
      "Express yourself through writing, drawing, or speaking today.",
      "Complete one small creative loop without judging the outcome.",
      "Share a moment of laughter or inspiration with a friend."
    ],
    prompts: [
      "What creative impulse have I been holding back?",
      "Where is my energy scattered, and how can I refocus?",
      "How can I speak my authentic truth more clearly today?"
    ]
  },
  4: {
    whatItMeans: "The number of structure, foundation, discipline, and order. It represents the stability needed to build things that last.",
    strengths: "Reliability, loyalty, organization, practical wisdom, and perseverance.",
    shadows: "Rigidity, resistance to change, workaholism, and stubbornness.",
    decision: "Build a plan first. Choose the logical, stable, and sustainable path over quick wins.",
    relationship: "Highly loyal, protective, and committed. Needs stability and clear expectations in a relationship.",
    career: "Succeeds in management, operations, finance, architecture, or any field requiring systematic execution.",
    actions: [
      "Organize one physical or digital space that feels chaotic.",
      "Write down a clear, step-by-step checklist for a major task.",
      "Incorporate one grounding routine into your morning."
    ],
    prompts: [
      "Where is my rigidity blocking necessary growth or change?",
      "How can I make my daily foundations stronger and more supportive?",
      "What enduring project am I ready to commit to?"
    ]
  },
  5: {
    whatItMeans: "The number of freedom, adventure, versatility, and change. It represents the search for growth through diverse experience.",
    strengths: "Adaptability, curiosity, charisma, resourcefulness, and progressive thinking.",
    shadows: "Restlessness, fear of commitment, impulsiveness, and scattered focus.",
    decision: "Choose the path of learning and expansion, but ensure you have a landing pad to ground the choice.",
    relationship: "Needs variety, exciting experiences, and a partner who respects their absolute need for freedom.",
    career: "Excels in sales, travel, consulting, public relations, or any dynamic, fast-paced environment.",
    actions: [
      "Try a new route, food, or habit to feed your curiosity today.",
      "Define one clear boundary to prevent impulsive distractions.",
      "Spend 15 minutes moving your body or outdoors."
    ],
    prompts: [
      "Am I escaping a situation, or am I running toward true freedom?",
      "Where is my restlessness preventing me from building depth?",
      "What new adventure or change is my intuition calling for?"
    ]
  },
  6: {
    whatItMeans: "The number of nurturing, love, responsibility, and service. It represents the caretaker who creates beauty and harmony.",
    strengths: "Compassion, artistic sense, reliability, healing presence, and devotion.",
    shadows: "Martyrdom, codependency, control disguised as care, and self-neglect.",
    decision: "Filter your choice through care and service, but ensure your own cup remains full first.",
    relationship: "Extremely loving and nurturing. Seeks long-term, stable, and harmonious family-oriented bonds.",
    career: "Best suited for teaching, counseling, healthcare, design, hospitality, or community building.",
    actions: [
      "Do something kind for yourself that you would normally do for others.",
      "Beautify one area of your living or working environment.",
      "Check in on a loved one and offer a listening ear."
    ],
    prompts: [
      "Where am I over-giving at the expense of my own wellness?",
      "How can I release the need to control how others heal?",
      "What does premium self-respect look like in my relationships?"
    ]
  },
  7: {
    whatItMeans: "The number of wisdom, research, mystery, and spiritual search. It represents the seeker of inner and outer truth.",
    strengths: "Analytical mind, intuition, depth, spiritual awareness, and focus.",
    shadows: "Isolation, skepticism, coldness, and perfectionism.",
    decision: "Take time in solitude to research and reflect. Do not rush into options without analytical clarity.",
    relationship: "Reserved and deep. Needs intellectual connection and quiet time to recharge in partnerships.",
    career: "Thrives in research, science, writing, technology, philosophy, or spiritual teaching.",
    actions: [
      "Spend 15 minutes reading or studying a complex topic.",
      "Take a digital detox break for at least one hour today.",
      "Write down your dreams or intuitive insights in a journal."
    ],
    prompts: [
      "Am I isolating myself, or am I utilizing solitude for wisdom?",
      "What truth or belief am I currently avoiding examining?",
      "How can I combine my logical mind with my intuitive hits?"
    ]
  },
  8: {
    whatItMeans: "The number of material mastery, power, authority, and abundance. It represents executive leadership and practical stewardship.",
    strengths: "Strategic vision, ambition, efficiency, financial sense, and resilience.",
    shadows: "Workaholism, control issues, greed, and defining worth by success.",
    decision: "Make the adult, strategic decision. Focus on long-term leverage, value, and clear boundaries.",
    relationship: "Generous and protective. Seeks a partner who matches their ambition and supports their legacy.",
    career: "Designed for business, finance, management, entrepreneurship, and leadership roles.",
    actions: [
      "Review your finances or business goals with complete clarity.",
      "Wield your authority to protect or support someone today.",
      "Set a clear boundary around your working hours."
    ],
    prompts: [
      "Where am I playing small to remain comfortable or liked?",
      "How can I separate my personal worth from my achievements?",
      "What resources am I called to manage more effectively?"
    ]
  },
  9: {
    whatItMeans: "The number of completion, humanitarianism, and universal love. It represents the wise soul who clears space for the future.",
    strengths: "Generosity, tolerance, broad perspective, artistic talent, and compassion.",
    shadows: "Clinging to the past, martyrdom, emotional drama, and difficulty letting go.",
    decision: "Choose the path of release and service. Clear the old loop to make space for clean future growth.",
    relationship: "Romantic, compassionate, and idealistic. Needs a partner who shares their global values.",
    career: "Excels in charity, art, public service, teaching, environmental work, or counseling.",
    actions: [
      "Forgive someone or release a minor grudge today.",
      "Donate or declutter items that you no longer need.",
      "Perform a random act of kindness without expecting return."
    ],
    prompts: [
      "What expired cycle or relationship am I struggling to let go of?",
      "How can I serve others without sacrificing my own peace?",
      "What wisdom did I gain from my recent endings?"
    ]
  },
  11: {
    whatItMeans: "A Master Number representing spiritual illumination, visionary messenger, and high sensitivity. It is the lighthouse.",
    strengths: "Heightened intuition, inspiration, charisma, and spiritual awareness.",
    shadows: "Nervous tension, self-doubt, anxiety, and being ungrounded.",
    decision: "Trust the initial intuitive hit. Ground it immediately with one practical action.",
    relationship: "Highly sensitive and deep. Needs an emotionally supportive and spiritually aligned partner.",
    career: "Perfect for counseling, writing, spiritual teaching, media, or creative innovation.",
    actions: [
      "Write down three clear intuitive hits you receive today.",
      "Do a physical grounding exercise (walk barefoot, stretch).",
      "Share an inspiring message or idea with someone who needs it."
    ],
    prompts: [
      "How am I letting self-doubt block my spiritual messenger role?",
      "Where is nervous tension showing up in my body right now?",
      "What grounded action can I take to make my vision real?"
    ]
  },
  22: {
    whatItMeans: "A Master Number representing the Master Builder, grand vision, and practical transformation. It is the architect.",
    strengths: "Practical genius, leadership, organization, and massive manifestation potential.",
    shadows: "Crushing self-pressure, fear of failure, control struggles, and burnout.",
    decision: "Formulate a systematic operational plan. Think big, but build step-by-step with delegation.",
    relationship: "Loyal and supportive. Needs a partner who understands their dedication to large-scale work.",
    career: "Excels in global business, engineering, infrastructure, project management, or scaling ideas.",
    actions: [
      "Break down your biggest long-term goal into three daily actions.",
      "Delegate one task to someone else to build operational trust.",
      "Review your project timeline with complete realism."
    ],
    prompts: [
      "What high expectations am I using to paralyze myself?",
      "Am I building for my ego or building to serve others?",
      "How can I better balance my grand vision with daily rest?"
    ]
  },
  33: {
    whatItMeans: "A Master Number representing the Master Healer, selfless service, and unconditional love. It is the teacher of teachers.",
    strengths: "Compassion, emotional healing, artistic refinement, and spiritual protection.",
    shadows: "Emotional depletion, codependency, martyrdom, and over-giving.",
    decision: "Act from absolute overflow and self-respect. Avoid any decision based on guilt or rescue energy.",
    relationship: "Deeply loving and protective. Needs boundaries to avoid codependent dynamics.",
    career: "Succeeds in counseling, teaching, healing arts, environmental protection, or philanthropy.",
    actions: [
      "Practice deep self-love by saying 'no' to an expired obligation.",
      "Create a calm, beautiful space in your home to support healing.",
      "Offer emotional support from a place of grounded strength."
    ],
    prompts: [
      "Where am I sacrificing my own wellbeing under the guise of love?",
      "How can I teach through my actions rather than just words?",
      "What healing space am I called to create for myself today?"
    ]
  }
};

// ---------------------------------------------------------------------------
// Additional reference tables used by the premium generator
// ---------------------------------------------------------------------------
const karmicDebtInfo: Record<number, { title: string; body: string }> = {
  13: { title: "Karmic Debt 13 \u2014 Discipline", body: "Past-life laziness or shortcuts now manifest as repeated obstacles until you learn focused, honest work. Embrace discipline as liberation rather than punishment." },
  14: { title: "Karmic Debt 14 \u2014 Moderation", body: "Past-life excess demands you learn healthy boundaries. Freedom comes through responsibility, not indulgence. Structure is what makes your liberty sustainable." },
  16: { title: "Karmic Debt 16 \u2014 Ego Dissolution", body: "The universe periodically dismantles what you have built so you can rebuild with greater wisdom. Surrender ego attachment \u2014 your true self is indestructible." },
  19: { title: "Karmic Debt 19 \u2014 Self-Reliance", body: "Past-life misuse of power means you must learn to lead with compassion. Independence is earned through serving others, not dominating them." },
};

const challengeMeaning: Record<number, string> = {
  0: "A phase of free choice \u2014 all options are open, and nothing is being forced on you.",
  1: "Learning to stand on your own without waiting for permission.",
  2: "Learning to hold your own sensitivity without absorbing everyone else's.",
  3: "Learning to express what you actually feel rather than performing what is liked.",
  4: "Learning discipline and patience without hardening into rigidity.",
  5: "Learning to commit to one thing long enough for it to grow.",
  6: "Learning that care begins with your own cup being full.",
  7: "Learning to trust your inner knowing in a very noisy world.",
  8: "Learning to hold power and money without letting either define you.",
};

// ---------------------------------------------------------------------------
// PREMIUM PDF ENGINE
// Builds a branded, print-ready workbook: cosmic dark cover and closing,
// cream writable interior, with Cinzel / Cormorant Garamond / Inter embedded
// as real vector fonts (not Type3 rasterised glyphs).
//
// Returns the jsPDF document so the caller decides how to deliver it.
// ---------------------------------------------------------------------------
const PT2MM = 0.352778;

export function generateBlueprintPdf(
    profile: NumerologyProfile,
    name: string,
    options: BlueprintOptions = {},
): jsPDF {
    const tier: BlueprintTier = options.tier ?? "free";
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

    // ---- register embedded brand fonts -----------------------------------
    for (const face of PDF_FONTS) {
      const file = `${face.family}-${face.style}.ttf`;
      doc.addFileToVFS(file, face.base64);
      doc.addFont(file, face.family, face.style);
    }

    const PAGE_W = doc.internal.pageSize.getWidth();
    const PAGE_H = doc.internal.pageSize.getHeight();
    const M = 16;
    const CW = PAGE_W - M * 2;
    const BOTTOM = PAGE_H - 18;

    // ---- palette ---------------------------------------------------------
    const CREAM: RGB = [252, 249, 242];
    const CREAM_2: RGB = [246, 240, 227];
    const INK: RGB = [34, 31, 46];
    const INK_SOFT: RGB = [76, 72, 89];
    const INK_FAINT: RGB = [124, 118, 138];
    const GOLD: RGB = [198, 148, 38];
    const GOLD_DEEP: RGB = [134, 109, 45];
    const GOLD_LIGHT: RGB = [240, 205, 117];
    const MIDNIGHT: RGB = [13, 15, 22];
    const PEARL: RGB = [235, 232, 224];
    const PEARL_DIM: RGB = [152, 155, 168];
    const RULE: RGB = [222, 212, 188];
    const RULE_SOFT: RGB = [236, 229, 212];
    const ROSE: RGB = [179, 71, 110];
    const PURPLE: RGB = [77, 46, 107];

    let y = M + 6;
    let pageNo = 1;
    let section = "";

    // ---- primitives ------------------------------------------------------
    const font = (
      fam: string,
      style: "normal" | "bold" | "italic",
      size: number,
      color: RGB,
      space = 0,
    ) => {
      doc.setFont(fam, style);
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.setCharSpace(space);
    };

    /**
     * jsPDF's align:"right" and align:"center" COMPLETELY IGNORE setCharSpace().
     * Measured against 16 size/spacing combinations, the real advance width is
     *
     *     getTextWidth(s) + charSpace * (s.length - 1)
     *
     * independent of font size — and getTextWidth() itself returns a WRONG,
     * smaller value while charSpace is set. The practical effect was that every
     * letter-spaced aligned string in this document sat in the wrong place:
     * right-aligned footers overshot the margin (the disclaimer footer actually
     * ran off the paper edge) and centred cover text drifted right.
     *
     * So: measure with spacing temporarily zeroed, add it back by hand, and
     * position with a plain left-aligned draw.
     */
    const measure = (s: string, space: number) => {
      doc.setCharSpace(0);
      const w = doc.getTextWidth(s);
      doc.setCharSpace(space);
      return w + space * Math.max(0, s.length - 1);
    };

    /** alignment-aware text draw that respects the active letter-spacing */
    const textAt = (
      s: string,
      x: number,
      yy: number,
      align: "left" | "center" | "right" = "left",
    ) => {
      const space = doc.getCharSpace();
      const w = measure(s, space);
      const ax = align === "right" ? x - w : align === "center" ? x - w / 2 : x;
      doc.text(s, ax, yy);
    };

    const para = (
      s: string,
      size = 10.4,
      color: RGB = INK_SOFT,
      style: "normal" | "bold" | "italic" = "normal",
      indent = 0,
      lead = 1.44,
      fam = FONT.body,
    ) => {
      font(fam, style, size, color, 0);
      const lines = doc.splitTextToSize(s, CW - indent) as string[];
      const lh = size * PT2MM * lead;
      lines.forEach((ln, i) => doc.text(ln, M + indent, y + i * lh));
      y += lines.length * lh;
      return lines.length * lh;
    };

    const eyebrow = (s: string, color: RGB = GOLD_DEEP, indent = 0) => {
      font(FONT.ui, "bold", 6.4, color, 0.9);
      doc.text(s.toUpperCase(), M + indent, y);
      y += 4.6;
    };

    const h = (s: string, size = 19, color: RGB = INK, indent = 0, lead = 1.16) => {
      const space = 0.5;
      font(FONT.display, "bold", size, color, space);
      const avail = CW - indent;
      // splitTextToSize measures with charSpace ignored, so for a tracked
      // display face it picks a wrap point that is too late and the title runs
      // past the right margin. (A 41-character Cinzel title at 19pt overflows
      // by ~24pt.) Re-wrap any line whose real advance width exceeds the
      // column, using measure() which accounts for the tracking.
      const lines: string[] = [];
      (doc.splitTextToSize(s, avail) as string[]).forEach((ln) => {
        if (measure(ln, space) <= avail) {
          lines.push(ln);
          return;
        }
        let current = "";
        ln.split(" ").forEach((word) => {
          const candidate = current ? `${current} ${word}` : word;
          if (measure(candidate, space) <= avail) {
            current = candidate;
          } else {
            if (current) lines.push(current);
            current = word;
          }
        });
        if (current) lines.push(current);
      });
      const lh = size * PT2MM * lead;
      lines.forEach((ln, i) => doc.text(ln, M + indent, y + i * lh));
      y += lines.length * lh;
      return lines.length * lh;
    };

    const rule = (w = CW, color: RGB = GOLD, indent = 0, weight = 0.35) => {
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(weight);
      doc.line(M + indent, y, M + indent + w, y);
      y += 1.2;
    };

    const ornRule = (width = 40, color: RGB = GOLD) => {
      const cx = PAGE_W / 2;
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(0.35);
      doc.line(cx - width / 2, y, cx - 3, y);
      doc.line(cx + 3, y, cx + width / 2, y);
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(cx, y, 0.75, "F");
      y += 1.6;
    };

    const box = (
      x: number,
      top: number,
      w: number,
      ht: number,
      fill: RGB | null,
      stroke: RGB | null,
      r = 1.6,
    ) => {
      if (fill) doc.setFillColor(fill[0], fill[1], fill[2]);
      if (stroke) {
        doc.setDrawColor(stroke[0], stroke[1], stroke[2]);
        doc.setLineWidth(0.25);
      }
      const mode = fill && stroke ? "FD" : fill ? "F" : "S";
      doc.roundedRect(x, top, w, ht, r, r, mode);
    };

    const medal = (value: number | string, cx: number, cy: number, r: number, dark = false) => {
      const label = String(value);
      doc.setFillColor(...(dark ? ([18, 20, 31] as RGB) : ([255, 253, 247] as RGB)));
      doc.setDrawColor(...(dark ? GOLD_DEEP : GOLD));
      doc.setLineWidth(0.5);
      doc.circle(cx, cy, r, "FD");
      doc.setDrawColor(...(dark ? ([70, 62, 42] as RGB) : ([243, 231, 200] as RGB)));
      doc.setLineWidth(0.25);
      doc.circle(cx, cy, r + 1.3, "S");
      // a two-digit value needs a smaller face to stay inside the disc
      const size = label.length > 1 ? r * 2.9 : r * 4.1;
      font(FONT.display, "bold", size, dark ? GOLD_LIGHT : GOLD_DEEP, 0);
      // centre the glyphs optically: the baseline sits ~0.36em below the middle
      textAt(label, cx, cy + size * PT2MM * 0.36, "center");
    };

    /** shrink a font until `s` fits `maxW`, then leave the font set at that size */
    const fitText = (
      s: string,
      fam: string,
      style: "normal" | "bold" | "italic",
      startSize: number,
      maxW: number,
      color: RGB,
      space = 0,
    ) => {
      let size = startSize;
      font(fam, style, size, color, space);
      while (size > 5.5 && doc.getTextWidth(s) + space * s.length > maxW) {
        size -= 0.4;
        font(fam, style, size, color, space);
      }
      return size;
    };

    const writeLines = (count: number, indent = 0, gap = 7.4, width = CW) => {
      doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
      doc.setLineWidth(0.2);
      doc.setLineDashPattern([0.5, 1.0], 0);
      for (let i = 0; i < count; i++) {
        y += gap;
        doc.line(M + indent, y, M + indent + width, y);
      }
      doc.setLineDashPattern([], 0);
      y += 1.4;
    };

    const checkbox = (x: number, top: number, s = 2.9) => {
      doc.setDrawColor(GOLD_DEEP[0], GOLD_DEEP[1], GOLD_DEEP[2]);
      doc.setLineWidth(0.35);
      doc.roundedRect(x, top, s, s, 0.4, 0.4, "S");
    };

    const bullet = (x: number, top: number, color: RGB = GOLD) => {
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(x, top, 0.7, "F");
    };

    // ---- page furniture --------------------------------------------------
    const stars = (seed: number, count: number) => {
      let s = seed;
      const rnd = () => {
        s = (s * 1103515245 + 12345) % 2147483648;
        return s / 2147483648;
      };
      for (let i = 0; i < count; i++) {
        const x = rnd() * PAGE_W;
        const yy = rnd() * PAGE_H;
        const rr = 0.16 + rnd() * 0.4;
        const t = rnd();
        const col: RGB = t > 0.72 ? [240, 205, 117] : t > 0.4 ? [120, 122, 138] : [68, 70, 84];
        doc.setFillColor(col[0], col[1], col[2]);
        doc.circle(x, yy, rr, "F");
      }
    };

    const compass = (cx: number, cy: number, r: number) => {
      doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
      doc.setLineWidth(0.35);
      doc.circle(cx, cy, r, "S");
      doc.setLineWidth(0.22);
      doc.circle(cx, cy, r * 0.72, "S");
      doc.circle(cx, cy, r * 0.34, "S");
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6 - Math.PI / 2;
        const long = i % 3 === 0;
        doc.setLineWidth(long ? 0.5 : 0.2);
        doc.line(
          cx + Math.cos(a) * r * 0.34,
          cy + Math.sin(a) * r * 0.34,
          cx + Math.cos(a) * r,
          cy + Math.sin(a) * r,
        );
      }
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 - Math.PI / 2;
        doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
        doc.circle(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0.85, "F");
      }
    };

    const newPage = (kind: "cream" | "dark" = "cream", nextSection?: string) => {
      doc.addPage();
      pageNo++;
      if (nextSection !== undefined) section = nextSection;
      if (kind === "dark") {
        doc.setFillColor(...MIDNIGHT);
        doc.rect(0, 0, PAGE_W, PAGE_H, "F");
        stars(pageNo * 7919 + 13, 120);
        y = M + 8;
      } else {
        doc.setFillColor(...CREAM);
        doc.rect(0, 0, PAGE_W, PAGE_H, "F");
        y = M + 8;
        if (section) {
          font(FONT.ui, "normal", 6.0, INK_FAINT, 1.1);
          doc.text(section.toUpperCase(), M, M - 3.4);
          doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
          doc.setLineWidth(0.2);
          doc.line(M, M - 1.6, PAGE_W - M, M - 1.6);
          font(FONT.ui, "normal", 6.0, GOLD_DEEP, 0.8);
          textAt(String(pageNo).padStart(2, "0"), PAGE_W - M, M - 3.4, "right");
        }
      }
    };

    const footer = (dark = false) => {
      const col = dark ? PEARL_DIM : INK_FAINT;
      doc.setDrawColor(...(dark ? ([50, 48, 40] as RGB) : RULE));
      doc.setLineWidth(0.2);
      doc.line(M, PAGE_H - 13.5, PAGE_W - M, PAGE_H - 13.5);
      font(FONT.ui, "normal", 5.8, col, 1.0);
      doc.text("MYSTICALDIGITS  ·  LIFE PATH BLUEPRINT", M, PAGE_H - 10.6);
      textAt("MYSTICALDIGITS.COM", PAGE_W - M, PAGE_H - 10.6, "right");
    };

    const ensure = (needed: number, kind: "cream" | "dark" = "cream") => {
      if (y + needed > BOTTOM) {
        footer(kind === "dark");
        newPage(kind);
      }
    };

    const fullPageTitle = (kicker: string, title: string, lede?: string) => {
      eyebrow(kicker);
      // a 19pt Cinzel cap rises ~4.8mm above its baseline, so the title needs
      // real clearance from the eyebrow above it or the two visually collide
      y += 2.8;
      h(title, 19, INK);
      y += 0.8;
      rule(22, GOLD, 0, 0.5);
      y += 2.4;
      if (lede) {
        para(lede, 11.6, INK_SOFT, "italic", 0, 1.4);
        y += 1.2;
      }
    };

    const card = (
      x: number,
      top: number,
      w: number,
      label: string,
      body: string,
      accent: RGB = GOLD,
      labelColor: RGB = GOLD_DEEP,
    ) => {
      font(FONT.ui, "bold", 5.9, labelColor, 0.85);
      font(FONT.body, "normal", 9.6, INK_SOFT, 0);
      const bodyLines = doc.splitTextToSize(body, w - 7) as string[];
      const bodyH = bodyLines.length * 9.6 * PT2MM * 1.42;
      const boxH = 6.4 + bodyH + 3.4;
      box(x, top, w, boxH, CREAM_2, RULE, 1.4);
      doc.setFillColor(accent[0], accent[1], accent[2]);
      doc.rect(x, top, 1.1, boxH, "F");
      font(FONT.ui, "bold", 5.9, labelColor, 0.85);
      doc.text(label.toUpperCase(), x + 4, top + 4.6);
      font(FONT.body, "normal", 9.6, INK_SOFT, 0);
      bodyLines.forEach((ln, i) => doc.text(ln, x + 4, top + 8.6 + i * (9.6 * PT2MM * 1.42)));
      return boxH;
    };

    // ---- data ------------------------------------------------------------
    const numbers = [
      { label: "Life Path", value: profile.lifePath, type: "lifePath", governs: "Your recurring growth pattern — the lesson that keeps returning until it is learned." },
      { label: "Expression", value: profile.expression, type: "expression", governs: "Your talent vector — the gift that grows stronger each time you practise and share it." },
      { label: "Soul Urge", value: profile.soulUrge, type: "soulUrge", governs: "Your private motivation — what must be satisfied for a decision to feel emotionally clean." },
      { label: "Personality", value: profile.personality, type: "personality", governs: "Your social signal — the impression you make before you speak." },
      { label: "Birthday", value: profile.birthday, type: "birthday", governs: "Your raw talent — a specific gift you were born holding." },
      { label: "Personal Year", value: profile.personalYear, type: "personalYear", governs: "Your timing season — what this year is asking you to build, release, or begin." },
    ] as const;

    const cleanName = name.trim() || "Your Blueprint";
    const now = new Date();
    const today = `${now.getDate()} ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

    // =====================================================================
    // PAGE 1 — COVER
    // =====================================================================
    doc.setFillColor(...MIDNIGHT);
    doc.rect(0, 0, PAGE_W, PAGE_H, "F");
    stars(4242, 150);
    doc.setDrawColor(GOLD_DEEP[0], GOLD_DEEP[1], GOLD_DEEP[2]);
    doc.setLineWidth(0.4);
    doc.rect(9, 9, PAGE_W - 18, PAGE_H - 18, "S");

    y = 34;
    font(FONT.display, "bold", 11, GOLD_LIGHT, 2.4);
    textAt("MYSTICALDIGITS", PAGE_W / 2, y, "center");
    y += 5;
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.35);
    doc.line(PAGE_W / 2 - 16, y, PAGE_W / 2 + 16, y);
    y += 5.4;
    font(FONT.ui, "normal", 6.0, PEARL_DIM, 1.6);
    textAt("NUMEROLOGY · SELF-DISCOVERY · ALIGNED ACTION", PAGE_W / 2, y, "center");

    compass(PAGE_W / 2, 104, 25);

    y = 142;
    font(FONT.ui, "bold", 6.6, GOLD, 2.0);
    textAt("A PREMIUM SELF-DISCOVERY WORKBOOK", PAGE_W / 2, y, "center");
    y += 16;
    font(FONT.display, "bold", 33, GOLD_LIGHT, 0.8);
    textAt("LIFE PATH", PAGE_W / 2, y, "center");
    y += 15.5;
    textAt("BLUEPRINT", PAGE_W / 2, y, "center");
    y += 9;
    ornRule(46, GOLD);
    y += 6;
    font(FONT.body, "italic", 13, PEARL, 0);
    textAt("For clarity, timing, and aligned action", PAGE_W / 2, y, "center");

    y = 212;
    doc.setDrawColor(GOLD_DEEP[0], GOLD_DEEP[1], GOLD_DEEP[2]);
    doc.setLineWidth(0.25);
    doc.line(PAGE_W / 2 - 34, y, PAGE_W / 2 + 34, y);
    y += 7.5;
    font(FONT.ui, "normal", 5.9, PEARL_DIM, 1.5);
    textAt("PREPARED FOR", PAGE_W / 2, y, "center");
      y += 9.5;
      fitText(cleanName, FONT.display, "bold", 17, CW - 20, GOLD_LIGHT, 0.6);
      textAt(cleanName, PAGE_W / 2, y, "center");
      y += 7.5;
      font(FONT.ui, "normal", 7, PEARL_DIM, 1.2);
      textAt(today.toUpperCase(), PAGE_W / 2, y, "center");

      y = PAGE_H - 44;
      ornRule(60, GOLD_DEEP);
      y += 5.4;
      // two short centred lines — a single long line overflows the page frame
      font(FONT.ui, "normal", 5.6, PEARL_DIM, 1.4);
      textAt("SIX NUMBERS · ONE OPERATING SYSTEM", PAGE_W / 2, y, "center");
      y += 4.6;
      textAt("FOR DECISIONS, RELATIONSHIPS, WORK, ENERGY, AND TIMING", PAGE_W / 2, y, "center");

    // =====================================================================
    // PAGE 2 — WELCOME
    // =====================================================================
    newPage("cream", "Welcome");
    fullPageTitle("Introduction", "Your Blueprint, Assembled", `${cleanName}, this workbook is built from your own birth name and birth date. Every number in it is yours.`);
    y += 3;
    para(
      "This is a working document, not a horoscope. Numerology is a symbolic language: it does not predict your future and it cannot tell you what to do. What it does well is give you a vocabulary for patterns you have already lived — the way you repeatedly lead, withdraw, over-give, or hesitate.",
      10.4,
    );
    y += 2.2;
    para(
      "Naming a pattern is the first honest step toward changing it. That is the whole purpose of the pages that follow.",
      10.4,
    );
    y += 5;

    box(M, y, CW, 30, CREAM_2, GOLD, 1.6);
    doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.rect(M, y, 1.1, 30, "F");
    font(FONT.ui, "bold", 6.0, GOLD_DEEP, 0.9);
    doc.text("THE ONE RULE THAT MATTERS", M + 4, y + 6.2);
    font(FONT.body, "normal", 9.8, INK_SOFT, 0);
    (doc.splitTextToSize(
      "Treat every page as a question, not a verdict. Where a description fits, underline it and ask what it costs you. Where it does not fit, cross it out. A workbook you argue with is working correctly.",
      CW - 8,
    ) as string[]).forEach((ln, i) => doc.text(ln, M + 4, y + 11.4 + i * (9.8 * PT2MM * 1.42)));
    y += 37;

    const welcomeCards: [string, string, RGB][] = [
      ["What this is", "A complete interpretation of your six core numbers, plus printable tools: a decision filter, a shadow-to-strategy map, a 30-day activation plan, and reflection prompts.", GOLD],
      ["What this is not", "Medical, psychological, legal, financial, or relationship advice. It does not predict events and makes no claim to scientific proof. It is a reflective framework.", PURPLE],
    ];
    const cw2 = (CW - 5) / 2;
    let maxH = 0;
    welcomeCards.forEach(([t, b, a], i) => {
      const hh = card(M + i * (cw2 + 5), y, cw2, t, b, a);
      maxH = Math.max(maxH, hh);
    });
    y += maxH + 7;

    eyebrow("How to use this workbook", GOLD_DEEP);
    y += 1.4;
    const steps: [string, string][] = [
      ["Read your Life Path first", "It is the spine of the book. Everything else supports it."],
      ["Then your Soul Urge", "Compare it to your Personality. The gap between them is where dissatisfaction lives."],
      ["Then your timing", "Your Personal Year tells you what this season is for. Read it before you plan anything."],
      ["Then work the tools", "The decision filter and 30-day plan are the functional core. Use them on a real decision this week."],
    ];
    steps.forEach(([t, b], i) => {
      ensure(16);
      medal(String(i + 1), M + 3.6, y + 2.6, 3.4);
      font(FONT.display, "bold", 10.4, INK, 0.3);
      doc.text(t, M + 9.5, y + 1.6);
      font(FONT.body, "normal", 9.8, INK_SOFT, 0);
      doc.text(doc.splitTextToSize(b, CW - 10) as string[], M + 9.5, y + 6.2);
      y += 12.4;
    });
    footer();

    // =====================================================================
    // PAGE 3 — AT A GLANCE
    // =====================================================================
    newPage("cream", "Your Blueprint At A Glance");
    fullPageTitle("Your Map", "Your Blueprint At A Glance", "Your six numbers, what each one governs, and what each says about you.");
    y += 4;

    numbers.forEach((n) => {
      ensure(30);
      const interp = n.type === "birthday"
        ? undefined
        : getInterpretation(n.type, n.value as number);
      const title = n.type === "birthday"
        ? (birthdayInterpretations[n.value as number] || "").split(".")[0]
        : (interp?.title || "");
      const rowTop = y;
      box(M, rowTop, CW, 26, CREAM_2, RULE_SOFT, 1.4);
      medal(n.value as number, M + 11, rowTop + 13, 7.2);
      font(FONT.ui, "bold", 6.0, GOLD_DEEP, 1.0);
      doc.text(n.label.toUpperCase(), M + 22, rowTop + 7.4);
      font(FONT.display, "bold", 11.6, INK, 0.3);
      doc.text(doc.splitTextToSize(title, CW - 30)[0] || "", M + 22, rowTop + 13.4);
      font(FONT.body, "normal", 9.2, INK_SOFT, 0);
      doc.text(
        doc.splitTextToSize(n.governs, CW - 30) as string[],
        M + 22,
        rowTop + 18.4,
      );
      y = rowTop + 29;
    });
    footer();

    // =====================================================================
    // PAGES 4+ — ONE PAGE PER NUMBER
    // =====================================================================
    numbers.forEach((n) => {
      const isBirthday = n.type === "birthday";
      const interp = isBirthday ? undefined : getInterpretation(n.type, n.value as number);
      const title = isBirthday
        ? "The Gift You Were Born Holding"
        : interp?.title || n.label;
      const keywords = interp?.keywords || [];
      const shortDesc = interp?.shortDesc || "";
      const fullText = isBirthday
        ? birthdayInterpretations[n.value as number] || ""
        : interp?.fullText || "";

      newPage("cream", `${n.label} ${n.value}`);

      // header block
      medal(n.value as number, M + 12, y + 11, 11);
      font(FONT.ui, "bold", 6.0, GOLD_DEEP, 1.0);
      doc.text(n.label.toUpperCase(), M + 27, y + 5.6);
      font(FONT.display, "bold", 21, INK, 0.4);
      doc.text(doc.splitTextToSize(title, CW - 30)[0], M + 27, y + 14.6);
      y += 25;
      rule(24, GOLD, 0, 0.5);
      y += 3.6;

        if (keywords.length) {
          let kx = M;
          keywords.forEach((k) => {
            const txt = k.toUpperCase();
            // getTextWidth() ignores setCharSpace(), so add it back per glyph
            font(FONT.ui, "bold", 5.7, GOLD_DEEP, 0.7);
            const w = doc.getTextWidth(txt) + 0.7 * txt.length + 5.4;
            if (kx + w > PAGE_W - M) {
              kx = M;
              y += 6;
            }
            doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
            doc.setLineWidth(0.2);
            doc.setFillColor(252, 246, 232);
            doc.roundedRect(kx, y - 3.4, w, 5.2, 2.6, 2.6, "FD");
            doc.text(txt, kx + 2.7, y);
            kx += w + 2.2;
          });
          y += 9;
        }

      if (shortDesc) {
        para(shortDesc, 12.4, INK, "italic", 0, 1.4);
        y += 2.4;
      }
      if (fullText) {
        fullText.split("\n\n").forEach((pgh) => {
          ensure(18);
          para(pgh.replace(/\n/g, " "), 10.4);
          y += 2.6;
        });
      }

      // Life Path gets the deep-dive cards + actions + prompts
      if (n.type === "lifePath") {
        const d = numberDetails[n.value as number];
        if (d) {
          ensure(40);
          const half = (CW - 5) / 2;
          let hh = 0;
          hh = Math.max(hh, card(M, y, half, "Strengths", d.strengths, GOLD));
          hh = Math.max(hh, card(M + half + 5, y, half, "The shadow", d.shadows, ROSE, ROSE));
          y += hh + 5;
          ensure(34);
          const third = (CW - 8) / 3;
          let h3 = 0;
          h3 = Math.max(h3, card(M, y, third, "In decision", d.decision, GOLD_DEEP, GOLD_DEEP));
          h3 = Math.max(h3, card(M + third + 4, y, third, "In relationship", d.relationship, PURPLE, PURPLE));
          h3 = Math.max(h3, card(M + (third + 4) * 2, y, third, "In career", d.career, GOLD_DEEP, GOLD_DEEP));
          y += h3 + 7;

          ensure(28);
          eyebrow("Your first three moves");
          y += 1.2;
          d.actions.forEach((a, i) => {
            ensure(12);
            medal(String(i + 1), M + 3, y + 1.2, 3.1);
            font(FONT.body, "normal", 10, INK_SOFT, 0);
            const lines = doc.splitTextToSize(a, CW - 10) as string[];
            lines.forEach((ln, j) => doc.text(ln, M + 8.4, y + j * (10 * PT2MM * 1.4)));
            y += Math.max(9.6, lines.length * (10 * PT2MM * 1.4)) + 1.6;
          });
          y += 4;
        }
      }

      // reflection prompts (every number page)
      ensure(30);
      eyebrow("Reflect on", GOLD_DEEP);
      y += 1.4;
      const prompts: string[] = n.type === "lifePath"
        ? numberDetails[n.value as number]?.prompts || []
        : [
          `Where does ${n.label.toLowerCase()} ${n.value} show up most strongly in my life right now?`,
          `Where am I resisting the mature expression of this number?`,
          `What is one thing I will do differently this week because of this number?`,
        ];
      prompts.forEach((p) => {
        ensure(20);
        font(FONT.body, "normal", 9.8, INK_SOFT, 0);
        const lines = doc.splitTextToSize(p, CW) as string[];
        lines.forEach((ln, j) => doc.text(ln, M, y + j * (9.8 * PT2MM * 1.4)));
        y += lines.length * (9.8 * PT2MM * 1.4) + 0.8;
        writeLines(1);
      });
      footer();
    });

    // =====================================================================
    // HIDDEN PASSION + KARMIC DEBT
    // =====================================================================
    newPage("cream", "Hidden Passion & Karmic Debt");
    fullPageTitle("Deeper Layers", "Hidden Passion & Karmic Debt", "Two quieter figures in your chart: what you are drawn to repeat, and what you are here to work through.");
    y += 4;

    ensure(34);
    eyebrow("Hidden passion");
    y += 1.6;
    para(
      "Your Hidden Passion is the number that appears most often in your birth name. It describes a drive you return to again and again — often without noticing, because it feels like simply who you are.",
      10.2,
    );
    y += 3.4;
    const hp = profile.hiddenPassion || [];
    if (hp.length) {
      hp.forEach((num) => {
        ensure(24);
        const rowTop = y;
        box(M, rowTop, CW, 21, CREAM_2, RULE_SOFT, 1.4);
        medal(num, M + 10, rowTop + 10.5, 6.4);
        const pr = numberPrinciples[num] || [];
        font(FONT.ui, "bold", 5.8, GOLD_DEEP, 0.9);
        doc.text(`MOST FREQUENT IN YOUR NAME: ${num}`, M + 20, rowTop + 6.6);
        font(FONT.body, "normal", 9.4, INK_SOFT, 0);
        const txt = pr.length ? pr.join(" ") : "A drive that repeats throughout your life and shapes what you notice first.";
        (doc.splitTextToSize(txt, CW - 26) as string[]).forEach((ln, i) =>
          doc.text(ln, M + 20, rowTop + 11.4 + i * (9.4 * PT2MM * 1.4)),
        );
        y = rowTop + 24;
      });
    } else {
      para("No dominant repeated number was found in your birth name — your energies are unusually evenly distributed.", 10.2);
    }
    y += 6;

    ensure(34);
    eyebrow("Karmic debt", ROSE);
    y += 1.6;
    para(
      "A Karmic Debt appears when one of your core numbers reduces through 13, 14, 16, or 19. It marks a specific lesson — friction that repeats until it is met deliberately rather than endured.",
      10.2,
    );
    y += 3.4;
    const kd = profile.karmicDebt || [];
    if (kd.length) {
      kd.forEach((num) => {
        const info = karmicDebtInfo[num];
        if (!info) return;
          ensure(30);
          const rowTop = y;
          // measure with the face that will actually be drawn
          font(FONT.body, "normal", 9.4, INK_SOFT, 0);
          const bodyLines = doc.splitTextToSize(info.body, CW - 12) as string[];
        const hh = 14 + bodyLines.length * (9.4 * PT2MM * 1.42);
        box(M, rowTop, CW, hh, CREAM_2, RULE, 1.4);
        doc.setFillColor(ROSE[0], ROSE[1], ROSE[2]);
        doc.rect(M, rowTop, 1.1, hh, "F");
        font(FONT.display, "bold", 11.4, INK, 0.3);
        doc.text(info.title, M + 5, rowTop + 7.4);
        font(FONT.body, "normal", 9.4, INK_SOFT, 0);
        bodyLines.forEach((ln, i) => doc.text(ln, M + 5, rowTop + 13 + i * (9.4 * PT2MM * 1.42)));
        y = rowTop + hh + 4.4;
      });
    } else {
      const rowTop = y;
      box(M, rowTop, CW, 18, CREAM_2, RULE_SOFT, 1.4);
      font(FONT.body, "normal", 9.8, INK_SOFT, 0);
      doc.text(
        doc.splitTextToSize("You carry no Karmic Debt numbers in your core chart. Your lessons arrive through your Life Path rather than through a specific debt.", CW - 12) as string[],
        M + 5,
        rowTop + 7,
      );
      y = rowTop + 21;
    }
    footer();

    // =====================================================================
    // PINNACLES & CHALLENGES
    // =====================================================================
    newPage("cream", "Life Phases");
    fullPageTitle("Timing", "Your Pinnacles & Challenges", "Four developmental phases, each with a pinnacle to build and a challenge to work.");
    y += 4;
    para(
      "Where the Personal Year describes a season, the Pinnacles describe the decades. Each phase carries a gift to develop and a difficulty to work — at every point in life you have both.",
      10.2,
    );
    y += 5;

    const pins = profile.pinnacles || [];
    pins.forEach((p, i) => {
      ensure(26);
      const rowTop = y;
      box(M, rowTop, CW, 23, CREAM_2, RULE_SOFT, 1.4);
      medal(p.number, M + 10, rowTop + 11.5, 6.6);
      font(FONT.ui, "bold", 5.8, GOLD_DEEP, 0.9);
      const range = p.ageEnd === null
        ? `AGE ${p.ageStart} ONWARD`
        : `AGE ${p.ageStart} – ${p.ageEnd}`;
      doc.text(`PINNACLE ${["I", "II", "III", "IV"][i] || i + 1}  ·  ${range}`, M + 20, rowTop + 7);
      font(FONT.display, "bold", 12, INK, 0.3);
      const pTitle = getInterpretation("lifePath", p.number)?.title || `Number ${p.number}`;
      doc.text(`Pinnacle ${p.number} — ${pTitle}`, M + 20, rowTop + 13.4);
      font(FONT.body, "normal", 9.2, INK_SOFT, 0);
      const pDesc = getInterpretation("lifePath", p.number)?.shortDesc || "";
      (doc.splitTextToSize(pDesc, CW - 26) as string[]).slice(0, 2).forEach((ln, k) =>
        doc.text(ln, M + 20, rowTop + 18.4 + k * (9.2 * PT2MM * 1.38)),
      );
      y = rowTop + 26;
    });

    y += 5;
    ensure(30);
    eyebrow("Your four challenges", PURPLE);
    y += 1.6;
    para("Challenge numbers describe the specific skill each phase is asking you to develop.", 10.2);
    y += 3.4;
    const chs = profile.challenges || [];
    // 2x2 rather than 1x4: at four columns the cards are only ~42mm wide and a
    // full sentence becomes an unreadable five-line ribbon that also spills
    // past the card's bottom edge
    const chW = (CW - 5) / 2;
    const chH = 26;
    const chTop = y;
    chs.slice(0, 4).forEach((c, i) => {
      const cx = M + (i % 2) * (chW + 5);
      const cy = chTop + Math.floor(i / 2) * (chH + 4);
      box(cx, cy, chW, chH, CREAM_2, RULE_SOFT, 1.4);
      medal(c, cx + 10.5, cy + 13, 6.4);
      font(FONT.ui, "bold", 5.6, GOLD_DEEP, 0.85);
      doc.text(`CHALLENGE ${["I", "II", "III", "IV"][i]}`, cx + 21, cy + 7);
      font(FONT.body, "normal", 9.2, INK_SOFT, 0);
      const ct = challengeMeaning[c] || "A lesson worked through this phase.";
      (doc.splitTextToSize(ct, chW - 26) as string[]).slice(0, 3).forEach((ln, k) =>
        doc.text(ln, cx + 21, cy + 12.6 + k * (9.2 * PT2MM * 1.36)),
      );
    });
    y = chTop + 2 * chH + 8;
    footer();

    // =====================================================================
    // 12-MONTH FORECAST
    // =====================================================================
    newPage("cream", "The Year Ahead");
    fullPageTitle("Forecast", "Your Twelve-Month Forecast", "Your Personal Year sets the theme. Your Personal Month sets the tempo within it.");
    y += 4;
    para(
      `You are in a Personal Year ${profile.personalYear}. Each month below combines that year with the calendar month to give you a tempo for the next twelve months. Use it to decide what to start, what to protect, and what to release.`,
      10.2,
    );
    y += 5;

    const months = profile.personalMonths || [];
    const colW = (CW - 4) / 2;
    let col = 0;
    let rowTop = y;
    const rowH = 19;
    months.slice(0, 12).forEach((m, i) => {
      if (i === 6) {
        y = rowTop;
        col = 1;
      }
      ensure(rowH + 2);
      const x = M + col * (colW + 4);
      box(x, y, colW, rowH, CREAM_2, RULE_SOFT, 1.3);
      medal(m, x + 9.5, y + rowH / 2, 6);
      font(FONT.ui, "bold", 5.6, GOLD_DEEP, 0.9);
      doc.text(MONTH_NAMES[i].toUpperCase(), x + 18, y + 7);
      font(FONT.body, "normal", 9.6, INK_SOFT, 0);
      const theme = monthlyFocus[m]?.theme || "";
      doc.text(doc.splitTextToSize(theme, colW - 22)[0] || "", x + 18, y + 14);
      y += rowH + 3;
    });

    y += 3;
    ensure(28);
    box(M, y, CW, 25, CREAM_2, RULE, 1.4);
    doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.rect(M, y, 1.1, 25, "F");
    font(FONT.ui, "bold", 5.9, GOLD_DEEP, 0.85);
    doc.text("HOW TO READ THIS FORECAST", M + 4, y + 6.2);
    font(FONT.body, "normal", 9.4, INK_SOFT, 0);
    (doc.splitTextToSize(
      "The month numbers are not deadlines and not promises. They describe the kind of attention each month rewards. When a month's theme matches something you were already planning, move earlier and louder. When it does not, protect your energy and let the calendar do the work.",
      CW - 8,
    ) as string[]).forEach((ln, i) => doc.text(ln, M + 4, y + 11.6 + i * (9.4 * PT2MM * 1.42)));
    y += 28;
    footer();

    // =====================================================================
    // DECISION FILTER
    // =====================================================================
    newPage("cream", "The Premium Decision Filter");
    fullPageTitle("Tool One", "The Premium Decision Filter", "Five questions, asked in order, before you say yes to anything that will cost you time, money, energy, or peace.");
    y += 3;
    const filters: [string, string][] = [
      ["Alignment", `Does this decision support my Life Path ${profile.lifePath} growth, or does it repeat an old shadow pattern?`],
      ["Integrity", `Does my Soul Urge ${profile.soulUrge} feel genuinely satisfied, or am I performing for approval or guilt?`],
      ["Capability", `Will this let my Expression ${profile.expression} talents be used, refined, and visible?`],
      ["Season", `Does this match my Personal Year ${profile.personalYear}, or am I forcing the wrong action for this season?`],
      ["Leverage", "What is the smallest test I can run in 24–72 hours before overcommitting?"],
    ];
    filters.forEach(([label, q], i) => {
      ensure(18);
      medal(String(i + 1), M + 3.6, y + 2.4, 3.4);
      font(FONT.display, "bold", 10.2, GOLD_DEEP, 0.3);
      doc.text(label.toUpperCase(), M + 9.4, y + 1.6);
      font(FONT.body, "normal", 9.8, INK_SOFT, 0);
      (doc.splitTextToSize(q, CW - 10) as string[]).forEach((ln, k) =>
        doc.text(ln, M + 9.4, y + 6.4 + k * (9.8 * PT2MM * 1.4)),
      );
      y += 6.4 + (doc.splitTextToSize(q, CW - 10) as string[]).length * (9.8 * PT2MM * 1.4) + 2.6;
      doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
      doc.setLineWidth(0.2);
      doc.line(M, y, PAGE_W - M, y);
      y += 3;
    });

    y += 2;
    ensure(40);
    eyebrow("Run it on a real decision", GOLD_DEEP);
    y += 1.6;
    font(FONT.body, "normal", 9.8, INK_SOFT, 0);
    doc.text("Decision under evaluation", M, y);
    y += 2;
    writeLines(2);
    y += 1.6;
    filters.forEach(([label]) => {
      ensure(12);
      checkbox(M, y - 2.6);
      font(FONT.ui, "bold", 6.0, GOLD_DEEP, 0.8);
      doc.text(label.toUpperCase(), M + 5, y);
      y += 2.6;
      writeLines(1, 5, 6.6, CW - 5);
    });
    footer();

    // =====================================================================
    // SHADOW -> STRATEGY
    // =====================================================================
    newPage("cream", "The Shadow-To-Strategy Map");
    fullPageTitle("Tool Two", "The Shadow-To-Strategy Map", "Every number has a mature expression and a distorted one. This is where friction becomes a procedure.");
    y += 3;
    para(
      "Your shadow is not a flaw in the design — it is the design under pressure. The map works because it separates three things that usually arrive tangled together: the trigger, the coping move, and the mature response. The coping move is what actually costs you, and it is almost always invisible until written down.",
      10.2,
    );
    y += 6;

    const shadowRows: { label: string; hint: string; col: RGB }[] = [
      { label: "1. The trigger", hint: "The repeated emotion or situation — control, anxiety, collapse, comparison.", col: ROSE },
      { label: "2. My default coping move", hint: "What I actually do — avoid, chase, overgive, overthink, rebel, isolate.", col: ROSE },
      { label: "3. The mature response", hint: "What this looks like when I am calm, resourced, and honest.", col: GOLD_DEEP },
      { label: "4. The ten-minute shift", hint: "A micro-action small enough to do while still triggered.", col: PURPLE },
    ];
    shadowRows.forEach(({ label, hint, col }) => {
      ensure(30);
      eyebrow(label, col);
      font(FONT.body, "italic", 9.2, INK_FAINT, 0);
      doc.text(doc.splitTextToSize(hint, CW) as string[], M, y);
      y += (doc.splitTextToSize(hint, CW) as string[]).length * (9.2 * PT2MM * 1.36) + 1.2;
      writeLines(2);
      y += 2.6;
    });
    footer();

    // =====================================================================
    // 30-DAY ACTIVATION PLAN
    // =====================================================================
    newPage("cream", "The 30-Day Activation Plan");
    fullPageTitle("Tool Three", "The 30-Day Activation Plan", "One theme. Four weeks. The goal is not transformation — it is making your existing patterns conscious, useful, and grounded.");
    y += 3;
    para(
      "Insight decays. Within about a week of a good realisation most people return to the same behaviour with better vocabulary. This plan exists to prevent that specific failure. Week One changes nothing, which is why it works.",
      10.2,
    );
    y += 5;
    const themeBoxH = 30;
    box(M, y, CW, themeBoxH, CREAM_2, GOLD, 1.6);
    doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.rect(M, y, 1.1, themeBoxH, "F");
    font(FONT.ui, "bold", 6.0, GOLD_DEEP, 0.9);
    doc.text("MY 30-DAY ACTIVATION THEME", M + 4, y + 6.2);
    font(FONT.body, "italic", 8.8, INK_FAINT, 0);
    doc.text("One sentence. It should name a behaviour, not a feeling.", M + 4, y + 10.6);
    y += 13.5;
    writeLines(2, 4, 6.8, CW - 8);
    y += 4;

    const weeks: [string, string, string][] = [
      ["Week One", "Observational Tracking", "Change nothing yet. Notice where your number shows up naturally — in decisions, conflicts, boundaries, and avoidances. The point is evidence, not improvement."],
      ["Week Two", "Calibration & Boundaries", "Choose one specific behaviour to upgrade. Not a personality change — a single observable behaviour: a clearer boundary, a routine that holds, an hour of rest that is defended."],
      ["Week Three", "Bold Alignment", "Take one visible step. Publish the work, ask for what you need, resolve the dispute, finish the open loop. This is the week the pattern meets daylight."],
      ["Week Four", "Integration & Audit", "Audit without flattery. Keep what worked, release what was performative, and set the next monthly focus."],
    ];
    weeks.forEach(([wk, title, desc], i) => {
      // three weeks fill the first page; the fourth opens a second page that
      // also carries the day-31 audit, so neither page is left half empty
      if (i === 3) {
        footer();
        newPage("cream");
        y += 1;
      }
      ensure(38);
      const rowTop = y;
      // the font must be active before measuring, or splitTextToSize wraps to
      // whatever face was left over from the previous block and the text
      // overflows the card
      font(FONT.body, "normal", 9.4, INK_SOFT, 0);
      const descLines = doc.splitTextToSize(desc, CW - 26) as string[];
      // 17.4mm header + description + "MY NOTES" + two ruled lines, plus margin
      const hh = 34 + descLines.length * (9.4 * PT2MM * 1.4);
      box(M, rowTop, CW, hh, CREAM_2, RULE_SOFT, 1.4);
      medal(String(i + 1), M + 9, rowTop + 10, 5.8);
      font(FONT.ui, "bold", 5.8, GOLD_DEEP, 0.9);
      doc.text(wk.toUpperCase(), M + 18, rowTop + 6);
      font(FONT.display, "bold", 11.4, INK, 0.3);
      doc.text(title, M + 18, rowTop + 12);
      font(FONT.body, "normal", 9.4, INK_SOFT, 0);
      descLines.forEach((ln, k) => doc.text(ln, M + 18, rowTop + 17.4 + k * (9.4 * PT2MM * 1.4)));
      const wlTop = rowTop + 17.4 + descLines.length * (9.4 * PT2MM * 1.4) + 2.4;
      font(FONT.ui, "bold", 5.4, GOLD_DEEP, 0.8);
      doc.text("MY NOTES", M + 18, wlTop);
      doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
      doc.setLineWidth(0.2);
      doc.setLineDashPattern([0.5, 1.0], 0);
      doc.line(M + 18, wlTop + 6, PAGE_W - M - 4, wlTop + 6);
      doc.line(M + 18, wlTop + 12, PAGE_W - M - 4, wlTop + 12);
      doc.setLineDashPattern([], 0);
      y = rowTop + hh + 4.6;
    });

    // ---- day 31: close the loop ------------------------------------------
    y += 3;
    ensure(30);
    eyebrow("Day 31 — the audit", GOLD_DEEP);
    y += 1.6;
    para(
      "Thirty days is long enough for a pattern to show itself and short enough that you can still remember the starting point. Answer these four questions in writing before you choose the next theme.",
      10.2,
    );
    y += 3.4;
    const auditPrompts = [
      "Which behaviour actually changed, and what made it possible?",
      "Which behaviour did I only talk about? What was I avoiding?",
      "What did I learn about the cost of my default coping move?",
      "What is the one sentence that should become next month's theme?",
    ];
    auditPrompts.forEach((p, i) => {
      ensure(20);
      medal(String(i + 1), M + 3.4, y + 1.6, 3.1);
      font(FONT.body, "normal", 9.8, INK_SOFT, 0);
      const lines = doc.splitTextToSize(p, CW - 10) as string[];
      lines.forEach((ln, k) => doc.text(ln, M + 9.4, y + k * (9.8 * PT2MM * 1.4)));
      y += lines.length * (9.8 * PT2MM * 1.4) + 0.8;
      writeLines(2, 9.4, 6.8, CW - 9.4);
      y += 3.4;
    });
    footer();

    // =====================================================================
    // REFLECTION PROMPTS
    // =====================================================================
    newPage("cream", "High-Value Reflection Prompts");
    fullPageTitle("Tool Four", "High-Value Reflection Prompts", "Six questions for a weekly review. Designed to be uncomfortable, specific, and answerable in writing.");
    y += 3;
    const corePrompts = [
      `Where am I making life harder by ignoring my Life Path ${profile.lifePath} design?`,
      `What do people consistently receive from me — and how does that reflect my Expression ${profile.expression}?`,
      `What specific boundary would make my core gift easier for others to trust?`,
      `What opportunity am I calling "not the right time" because it asks me to step into leadership?`,
      `What would premium self-respect look like this week in my calendar, my body, my home, my inbox, and my budget?`,
      `What project is complete, and what wisdom can I keep without carrying the obligation forward?`,
    ];
    corePrompts.forEach((p, i) => {
      ensure(30);
      medal(String(i + 1), M + 3.4, y + 2.4, 3.2);
      font(FONT.body, "normal", 10, INK, 0);
      (doc.splitTextToSize(p, CW - 9.5) as string[]).forEach((ln, k) =>
        doc.text(ln, M + 9.5, y + k * (10 * PT2MM * 1.4)),
      );
      y += (doc.splitTextToSize(p, CW - 9.5) as string[]).length * (10 * PT2MM * 1.4) + 1.2;
      writeLines(2, 9.5, 7, CW - 9.5);
      y += 3.2;
    });
    footer();

    // =====================================================================
    // PREMIUM EDITION
    //
    // Everything above this line is the free workbook. The premium edition is
    // a strict superset: the same core reading, followed by roughly forty pages
    // of depth across nine sections. Nothing above is altered, so the free
    // edition stays byte-identical to what was verified.
    // =====================================================================
    if (tier === "premium") {
      newPage("dark");
      y = 88;
      ornRule(70, GOLD);
      y += 8;
      font(FONT.ui, "bold", 6.4, GOLD, 2.0);
      textAt("PREMIUM EDITION", PAGE_W / 2, y, "center");
      y += 17;
      font(FONT.display, "bold", 23, GOLD_LIGHT, 0.6);
      textAt("THE DEEP", PAGE_W / 2, y, "center");
      y += 11;
      textAt("LAYER", PAGE_W / 2, y, "center");
      y += 13;
      ornRule(50, GOLD);
      y += 13;
      font(FONT.body, "normal", 11, PEARL, 0);
      [
        "Everything before this point describes what your numbers are.",
        "Everything after it describes what to do about them.",
      ].forEach((ln) => {
        textAt(ln, PAGE_W / 2, y, "center");
        y += 6.6;
      });
      y += 9;
      font(FONT.body, "italic", 10, PEARL_DIM, 0);
      [
        "Nine sections follow — your inner architecture, deep shadow analysis,",
        "the relationship map, career and purpose alignment, wealth and legacy,",
        "personal codes, the full life phase map, growth prompts, a month-by-month",
        "forecast, a personal operating system, and printable journals.",
      ].forEach((ln) => {
        textAt(ln, PAGE_W / 2, y, "center");
        y += 5.8;
      });
      footer(true);

      // The premium builders live in premiumPdf.ts. They receive this kit
      // rather than importing the primitives, which keeps the dependency
      // one-directional and avoids an import cycle.
      const kit: PdfKit = {
        doc,
        PAGE_W,
        PAGE_H,
        M,
        CW,
        BOTTOM,
        PT2MM,
        FONT,
        C: {
          CREAM, CREAM_2, INK, INK_SOFT, INK_FAINT, GOLD, GOLD_DEEP,
          GOLD_LIGHT, MIDNIGHT, PEARL, PEARL_DIM, RULE, RULE_SOFT, ROSE, PURPLE,
        },
        get y() {
          return y;
        },
        set y(v: number) {
          y = v;
        },
        font,
        textAt,
        para,
        eyebrow,
        h,
        rule,
        ornRule,
        box,
        medal,
        fitText,
        writeLines,
        checkbox,
        bullet,
        compass,
        newPage,
        footer,
        ensure,
        fullPageTitle,
        card,
        monthlyFocus,
        numberPrinciples,
      };

      premiumInnerArchitecture(kit, profile, cleanName);
      premiumShadowAnalysis(kit, profile, cleanName);
      premiumRelationship(kit, profile, cleanName);
      premiumCareer(kit, profile, cleanName);
      premiumWealth(kit, profile, cleanName);
      premiumLuckyCodes(kit, profile, cleanName);
      premiumLifePhaseMap(kit, profile, cleanName);
      premiumGrowthPrompts(kit, profile, cleanName);
      premiumForecastDeep(kit, profile, cleanName);
      premiumOperatingSystem(kit, profile, cleanName);
      premiumJournals(kit, profile, cleanName);
    }

    // =====================================================================
    // CLOSING (dark)
    // =====================================================================
    newPage("dark");
    y = 90;
    ornRule(70, GOLD);
    y += 8;
    font(FONT.ui, "bold", 6.4, GOLD, 2.0);
    textAt("IN CLOSING", PAGE_W / 2, y, "center");
    y += 16;
    font(FONT.display, "bold", 24, GOLD_LIGHT, 0.6);
    textAt("THE MAP IS NOT", PAGE_W / 2, y, "center");
    y += 12;
    textAt("THE TERRITORY", PAGE_W / 2, y, "center");
    y += 12;
    ornRule(50, GOLD);
    y += 10;
    font(FONT.body, "normal", 11, PEARL, 0);
    [
      `Your numbers describe a tendency. They do not describe a ceiling.`,
      `${cleanName}, nothing in this workbook has ever made a decision for you,`,
      `and nothing in it ever will — that remains entirely yours.`,
    ].forEach((ln) => {
      textAt(ln, PAGE_W / 2, y, "center");
      y += 6.4;
    });
    y += 8;
    font(FONT.body, "italic", 10.4, PEARL_DIM, 0);
    [
      "What the system offers is a vocabulary. When the same friction arrives for the fourth time,",
      "a name for it is the difference between a pattern and a personality.",
      "Use the names. Argue with them. Then go and do the thing.",
    ].forEach((ln) => {
      textAt(ln, PAGE_W / 2, y, "center");
      y += 6.2;
    });

    y = PAGE_H - 78;
    doc.setDrawColor(GOLD_DEEP[0], GOLD_DEEP[1], GOLD_DEEP[2]);
    doc.setLineWidth(0.25);
    doc.roundedRect(M + 18, y, CW - 36, 30, 1.6, 1.6, "S");
    font(FONT.ui, "bold", 5.9, GOLD, 1.0);
    doc.text("KEEP GOING", M + 24, y + 7);
    font(FONT.body, "normal", 9.6, PEARL, 0);
    doc.text("Your six numbers are calculated instantly, and free, at", M + 24, y + 13.4);
    font(FONT.ui, "bold", 7.4, GOLD_LIGHT, 0.8);
    doc.text("blueprint.mysticaldigits.com", M + 24, y + 19.4);
      font(FONT.body, "normal", 9.6, PEARL_DIM, 0);
      doc.text("Deeper interpretations and printable reports live there too.", M + 24, y + 25.4);
    footer(true);

    // =====================================================================
    // DISCLAIMER
    // =====================================================================
    newPage("cream", "Scope, Method, And Limits");
    fullPageTitle("Notice", "Scope, Method, And Limits", "Please read this page once. It matters more than it looks.");
    y += 3;
    eyebrow("What this workbook is");
    y += 1.2;
    para("A self-reflection instrument built on the symbolic framework of Pythagorean numerology. Every interpretation in it is offered as a prompt for your own thinking, not as a statement of fact about you.", 10.2);
    y += 4;
    eyebrow("What it is not");
    y += 1.2;
    para("This workbook is not medical, psychological, psychiatric, legal, financial, or relationship advice, and it is not a substitute for professional care from a qualified practitioner. It does not diagnose, treat, cure, or prevent any condition. It does not predict future events, outcomes, or the behaviour of other people.", 10.2);
    y += 2.4;
    para("No claim is made that numerology is scientifically validated. It is presented here as a cultural and reflective tradition. You are the only authority on your own life, and no number in this book overrides your judgment, your values, or your circumstances.", 10.2);
    y += 4.6;
    box(M, y, CW, 26, CREAM_2, GOLD, 1.6);
    doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.rect(M, y, 1.1, 26, "F");
    font(FONT.ui, "bold", 6.0, GOLD_DEEP, 0.9);
    doc.text("IF YOU ARE IN DIFFICULTY", M + 4, y + 6.4);
    font(FONT.body, "normal", 9.6, INK_SOFT, 0);
    (doc.splitTextToSize(
      "If you are experiencing a medical or mental-health concern, financial hardship, or a situation involving your safety or someone else's, please speak to a qualified professional or a trusted person rather than relying on this workbook. That is the responsible use of a book like this one.",
      CW - 8,
    ) as string[]).forEach((ln, i) => doc.text(ln, M + 4, y + 12 + i * (9.6 * PT2MM * 1.42)));
    y += 33;
    eyebrow("Method notes");
    y += 1.2;
    para("Calculations use the standard Pythagorean method: birth month, day, and year are reduced independently before being combined, and the master numbers 11, 22, and 33 are preserved when they arise at the final step. Name-based numbers use the full birth name. Alternative traditions exist and will produce different results; this workbook uses one method consistently.", 10.2);
    y += 6;
    doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
    doc.setLineWidth(0.2);
    doc.line(M, y, PAGE_W - M, y);
    y += 7;
    font(FONT.display, "bold", 11, INK, 0.4);
    doc.text("MysticalDigits", M, y);
    font(FONT.ui, "normal", 6.4, INK_FAINT, 1.0);
    doc.text("MYSTICALDIGITS.COM", M, y + 5);
    font(FONT.ui, "normal", 6.4, INK_FAINT, 1.0);
    textAt("PREMIUM WORKBOOK · LIFE PATH BLUEPRINT", PAGE_W - M, y + 5, "right");
    footer();

  return doc;
}
