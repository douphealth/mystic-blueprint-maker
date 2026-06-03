import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type NumerologyProfile } from "@/lib/numerology";
import { getInterpretation } from "@/lib/interpretations";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface FreePdfButtonProps {
  profile: NumerologyProfile;
  name: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const monthThemes: Record<number, { title: string; action: string }> = {
  1: { title: "Initiation",      action: "Plant a seed. Start the project you've been circling." },
  2: { title: "Partnership",     action: "Soften. Listen twice as much as you speak this month." },
  3: { title: "Expression",      action: "Create something for the joy of it — no audience required." },
  4: { title: "Foundation",      action: "Build the boring structure that future-you will thank you for." },
  5: { title: "Movement",        action: "Say yes to one thing that scares your routine self." },
  6: { title: "Devotion",        action: "Tend to home, body, and the people you love most." },
  7: { title: "Inner Inquiry",   action: "Protect solitude. Journal. Read. Walk without your phone." },
  8: { title: "Empowerment",     action: "Ask for the money, the deal, the room — own your authority." },
  9: { title: "Completion",      action: "Forgive, release, donate, finish. Make room for what's next." },
  11: { title: "Awakening",      action: "Trust the download. Your intuition is the strategy." },
  22: { title: "Master Building",action: "Translate the grand vision into a single concrete blueprint." },
  33: { title: "Master Healing", action: "Lead with the heart. Your presence itself is medicine." },
};

const passionDescriptions: Record<number, { title: string; body: string }> = {
  1: { title: "The Pioneer's Fire",      body: "Originality and independence fuel your engine. You're built to start, not to follow." },
  2: { title: "The Connector's Gift",    body: "You're wired for relationship. Depth, harmony, and quiet diplomacy are your superpower." },
  3: { title: "The Artist's Voice",      body: "Self-expression isn't a hobby — it's your nervous system regulator. Make. Speak. Sing." },
  4: { title: "The Architect's Hands",   body: "You find peace in process. Building lasting things is your most natural prayer." },
  5: { title: "The Wanderer's Pulse",    body: "Variety, sensuality, freedom. You learn through experience, not theory." },
  6: { title: "The Caretaker's Heart",   body: "Beauty, family, and healing call you. You make spaces feel like home." },
  7: { title: "The Mystic's Mind",       body: "You crave truth beneath the surface. Research, contemplation, and silence sharpen you." },
  8: { title: "The Builder of Empires",  body: "Mastery, money, and impact magnetize you. Don't apologize for your ambition." },
  9: { title: "The Humanitarian's Soul", body: "You're here for the bigger picture. Service and art are your twin languages." },
};

const karmicLessons: Record<number, { title: string; lesson: string }> = {
  13: {
    title: "Karmic Debt 13 — The Discipline of the Shortcut",
    lesson:
      "Past patterns of cutting corners now ask for patient, disciplined work. Show up daily for the unglamorous parts. The reward is real, lasting mastery — and a level of trust in yourself that no shortcut can buy.",
  },
  14: {
    title: "Karmic Debt 14 — The Discipline of the Senses",
    lesson:
      "Old habits of excess (substances, distraction, overstimulation) ask to be met with healthy moderation. Freedom is your gift — but anchored freedom. Choose containers that let you fly without burning out.",
  },
  16: {
    title: "Karmic Debt 16 — The Discipline of the Ego",
    lesson:
      "Towers built on pride will fall — gently, if you allow it. This debt resolves through humility, spiritual surrender, and rebuilding from a more authentic foundation. What's true in you cannot be destroyed.",
  },
  19: {
    title: "Karmic Debt 19 — The Discipline of Power",
    lesson:
      "You're learning to lead without dominating, to be strong without isolating. Independence is healthy; refusing help is not. Let collaboration multiply your impact.",
  },
};

const FreePdfButton = ({ profile, name }: FreePdfButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [generationStep, setGenerationStep] = useState("Preparing your workbook…");
  const { toast } = useToast();

  const generatePdf = async () => {
    if (generating) return;
    setGenerating(true);
    setDone(false);
    setGenerationStep("Preparing your workbook…");

    try {
    await new Promise((r) => setTimeout(r, 50));
    setGenerationStep("Designing your private edition…");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const pageW = doc.internal.pageSize.getWidth();   // 210
    const pageH = doc.internal.pageSize.getHeight();  // 297
    const margin = 22;
    const contentW = pageW - margin * 2;

    // ===== Palette =====
    const ink         : [number, number, number] = [12, 14, 28];
    const inkDeep     : [number, number, number] = [8, 9, 20];
    const inkMid      : [number, number, number] = [22, 24, 48];
    const gold        : [number, number, number] = [201, 168, 76];
    const goldSoft    : [number, number, number] = [232, 207, 138];
    const cream       : [number, number, number] = [245, 240, 224];
    const parchment   : [number, number, number] = [250, 246, 235];
    const parchLine   : [number, number, number] = [220, 210, 184];
    const violet      : [number, number, number] = [138, 109, 196];
    const muted       : [number, number, number] = [124, 122, 148];
    const softInk     : [number, number, number] = [78, 80, 110];
    const white       : [number, number, number] = [255, 255, 255];

    let y = 0;
    let pageNum = 0;
    const totalPagesTarget = 16; // approximate, used only for footer "of"

    // ===== Background painters =====
    const paintDark = () => {
      // vertical gradient by stacked rects
      const steps = 60;
      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const r = Math.round(inkDeep[0] + (inkMid[0] - inkDeep[0]) * t);
        const g = Math.round(inkDeep[1] + (inkMid[1] - inkDeep[1]) * t);
        const b = Math.round(inkDeep[2] + (inkMid[2] - inkDeep[2]) * t);
        doc.setFillColor(r, g, b);
        doc.rect(0, (pageH / steps) * i, pageW, pageH / steps + 0.5, "F");
      }
      // subtle "stars"
      doc.setFillColor(...goldSoft);
      const seed = (name.length || 7) * 11 + 31;
      const rnd = (i: number) => {
        const x = Math.sin(seed + i * 12.9898) * 43758.5453;
        return x - Math.floor(x);
      };
      for (let i = 0; i < 70; i++) {
        const px = rnd(i) * pageW;
        const py = rnd(i + 100) * pageH;
        const sz = rnd(i + 200) * 0.5 + 0.1;
        doc.circle(px, py, sz, "F");
      }
    };

    const paintParchment = () => {
      doc.setFillColor(...parchment);
      doc.rect(0, 0, pageW, pageH, "F");
      // top + bottom gold hairline framing
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.4);
      doc.line(margin, 16, pageW - margin, 16);
      doc.setLineWidth(0.15);
      doc.line(margin, 18.2, pageW - margin, 18.2);
      doc.setLineWidth(0.4);
      doc.line(margin, pageH - 16, pageW - margin, pageH - 16);
      doc.setLineWidth(0.15);
      doc.line(margin, pageH - 18.2, pageW - margin, pageH - 18.2);
    };

    const drawSigil = (cx: number, cy: number, r: number) => {
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.4);
      doc.circle(cx, cy, r);
      doc.setLineWidth(0.15);
      doc.circle(cx, cy, r * 0.78);
      doc.circle(cx, cy, r * 0.55);
      // 12 ticks
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + Math.cos(a) * r;
        const y1 = cy + Math.sin(a) * r;
        const x2 = cx + Math.cos(a) * (r + 1.6);
        const y2 = cy + Math.sin(a) * (r + 1.6);
        doc.line(x1, y1, x2, y2);
      }
    };

    const newPage = (kind: "dark" | "parchment") => {
      doc.addPage();
      pageNum++;
      if (kind === "dark") paintDark();
      else paintParchment();
      y = margin + 8;
    };

    const footer = (kind: "dark" | "parchment", label: string) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...(kind === "dark" ? muted : softInk));
      doc.text("YOUR NUMEROLOGY BLUEPRINT", margin, pageH - 9);
      doc.text(label.toUpperCase(), pageW / 2, pageH - 9, { align: "center" });
      doc.text(`${String(pageNum).padStart(2, "0")} / ${String(totalPagesTarget).padStart(2, "0")}`, pageW - margin, pageH - 9, { align: "right" });
    };

    const sectionLabel = (kind: "dark" | "parchment", text: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...gold);
      doc.text(text.toUpperCase(), margin, y);
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.3);
      doc.line(margin, y + 1.6, margin + 14, y + 1.6);
      y += 8;
    };

    const ensureSpace = (needed: number, kind: "dark" | "parchment", label: string) => {
      if (y + needed > pageH - 22) {
        footer(kind, label);
        newPage(kind);
      }
    };

    // ============================================================
    // PAGE 1 — COVER
    // ============================================================
    pageNum = 1;
    paintDark();

    // top frame
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.4);
    doc.line(margin, 24, pageW - margin, 24);
    doc.setLineWidth(0.15);
    doc.line(margin, 26.2, pageW - margin, 26.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...goldSoft);
    doc.text("MYSTICAL DIGITS  ·  PRIVATE EDITION", pageW / 2, 33, { align: "center" });

    // sigil
    drawSigil(pageW / 2, 70, 18);

    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...goldSoft);
    doc.text("✦", pageW / 2, 70.5, { align: "center" });

    // Title
    doc.setFont("times", "normal");
    doc.setFontSize(40);
    doc.setTextColor(...cream);
    doc.text("The Numerology", pageW / 2, 108, { align: "center" });
    doc.setFont("times", "italic");
    doc.text("Blueprint", pageW / 2, 122, { align: "center" });

    // small caps subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...goldSoft);
    doc.text("A   P E R S O N A L   R E A D I N G   F O R", pageW / 2, 138, { align: "center" });

    // name
    doc.setFont("times", "normal");
    doc.setFontSize(26);
    doc.setTextColor(...white);
    doc.text(name.toUpperCase(), pageW / 2, 152, { align: "center" });

    // hairline under name
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.3);
    doc.line(pageW / 2 - 22, 157, pageW / 2 + 22, 157);

    // Core number grid (6 cards on dark)
    const numbers = [
      { label: "Life Path",     value: profile.lifePath },
      { label: "Destiny",       value: profile.expression },
      { label: "Soul Urge",     value: profile.soulUrge },
      { label: "Personality",   value: profile.personality },
      { label: "Birthday",      value: profile.birthday },
      { label: "Personal Year", value: profile.personalYear },
    ];

    const gridTop = 178;
    const cardW = (contentW - 8) / 3;
    const cardH = 36;
    numbers.forEach((n, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = margin + col * (cardW + 4);
      const yy = gridTop + row * (cardH + 4);

      // card fill
      doc.setFillColor(18, 20, 40);
      doc.roundedRect(x, yy, cardW, cardH, 2, 2, "F");
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.25);
      doc.roundedRect(x, yy, cardW, cardH, 2, 2, "S");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...goldSoft);
      doc.text(n.label.toUpperCase(), x + cardW / 2, yy + 7, { align: "center" });

      doc.setFont("times", "normal");
      doc.setFontSize(26);
      doc.setTextColor(...cream);
      doc.text(String(n.value), x + cardW / 2, yy + 26, { align: "center" });
    });

    // Master / karmic flags
    const flags: string[] = [];
    [profile.lifePath, profile.expression, profile.soulUrge, profile.personality].forEach((v) => {
      if ([11, 22, 33].includes(v) && !flags.includes(`Master ${v}`)) flags.push(`Master ${v}`);
    });
    profile.karmicDebt.forEach((d) => flags.push(`Karmic ${d}`));
    if (flags.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...goldSoft);
      doc.text(`✦  ${flags.join("   ·   ")}  ✦`, pageW / 2, gridTop + cardH * 2 + 12, { align: "center" });
    }

    // Bottom edition / date
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.4);
    doc.line(margin, pageH - 26, pageW - margin, pageH - 26);
    doc.setLineWidth(0.15);
    doc.line(margin, pageH - 23.8, pageW - margin, pageH - 23.8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...goldSoft);
    doc.text(
      `EDITION  ·  ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }).toUpperCase()}`,
      pageW / 2,
      pageH - 17,
      { align: "center" },
    );
    doc.setFontSize(6.5);
    doc.setTextColor(...muted);
    doc.text("MYSTICALDIGITS.COM", pageW / 2, pageH - 12, { align: "center" });

    // ============================================================
    // PAGE 2 — FOREWORD / HOW TO READ
    // ============================================================
    newPage("parchment");

    sectionLabel("parchment", "Foreword");
    doc.setFont("times", "normal");
    doc.setFontSize(28);
    doc.setTextColor(...ink);
    doc.text("How to read", margin, y + 4);
    doc.setFont("times", "italic");
    doc.text("your blueprint.", margin, y + 16);
    y += 28;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...softInk);
    const intro = `This reading is built using Pythagorean numerology — the system attributed to the Greek mathematician and mystic Pythagoras (c. 570–495 BCE), who taught that "all is number." Each letter of your full birth name and each digit of your date of birth carries a specific vibration. Reduced and combined, these vibrations describe the energetic architecture you were born to carry.

Six core numbers form the spine of your blueprint:

·  Life Path — the soul mission you incarnated to fulfill (from your date of birth).
·  Destiny / Expression — the gifts and tasks encoded in your full birth name.
·  Soul Urge — what your inner self genuinely wants (the vowels of your name).
·  Personality — how the world first perceives you (the consonants of your name).
·  Birthday — the special talent imprinted by the day you arrived.
·  Personal Year — the energetic theme guiding the current calendar year.

Master Numbers (11, 22, 33) and Karmic Debts (13, 14, 16, 19) are preserved when they appear, rather than reduced — they carry an intensified frequency that asks for conscious work.

This is not fortune-telling. Treat it as a mirror. Read slowly. Highlight what resonates. Question what doesn't. Numerology is most powerful when used as a contemplative tool — a language for understanding the patterns already alive in you.`;

    const introLines = doc.splitTextToSize(intro, contentW);
    doc.text(introLines, margin, y);
    y += introLines.length * 4.6 + 6;

    // Pull-quote card
    ensureSpace(40, "parchment", "Foreword");
    doc.setFillColor(...cream);
    doc.roundedRect(margin, y, contentW, 32, 2, 2, "F");
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.3);
    doc.line(margin + 4, y + 6, margin + 4, y + 26);
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.setTextColor(...ink);
    const quote = doc.splitTextToSize(
      `"Number is the within of all things." — attributed to Pythagoras`,
      contentW - 14,
    );
    doc.text(quote, margin + 9, y + 14);
    y += 38;

    footer("parchment", "Foreword");

    // ============================================================
    // PAGES 3-7 — CORE NUMBER SPREADS
    // ============================================================
    const coreNumbers = [
      { key: "lifePath",     label: "Life Path",                 value: profile.lifePath,    type: "lifePath"     as const },
      { key: "expression",   label: "Destiny / Expression",      value: profile.expression,  type: "expression"   as const },
      { key: "soulUrge",     label: "Soul Urge",                 value: profile.soulUrge,    type: "soulUrge"     as const },
      { key: "personality",  label: "Personality",               value: profile.personality, type: "personality"  as const },
      { key: "personalYear", label: `Personal Year ${new Date().getFullYear()}`, value: profile.personalYear, type: "personalYear" as const },
    ];

    for (const num of coreNumbers) {
      const interp = getInterpretation(num.type, num.value);
      if (!interp) continue;

      newPage("dark");

      // Section label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...gold);
      doc.text(num.label.toUpperCase(), margin, y);
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.3);
      doc.line(margin, y + 1.6, margin + 14, y + 1.6);

      // Huge number on right
      doc.setFont("times", "normal");
      doc.setFontSize(96);
      doc.setTextColor(...gold);
      doc.text(String(num.value), pageW - margin, y + 22, { align: "right" });

      y += 14;

      // Title
      doc.setFont("times", "italic");
      doc.setFontSize(12);
      doc.setTextColor(...goldSoft);
      doc.text("The archetype", margin, y);
      y += 6;

      doc.setFont("times", "normal");
      doc.setFontSize(26);
      doc.setTextColor(...cream);
      const titleLines = doc.splitTextToSize(interp.title, contentW - 35);
      doc.text(titleLines, margin, y + 8);
      y += titleLines.length * 9 + 8;

      // Keyword pills
      const pills = interp.keywords;
      let px = margin;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      pills.forEach((k) => {
        const w = doc.getTextWidth(k) + 8;
        if (px + w > pageW - margin) {
          y += 8;
          px = margin;
        }
        doc.setFillColor(28, 30, 60);
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.15);
        doc.roundedRect(px, y - 4, w, 6.5, 3, 3, "FD");
        doc.setTextColor(...goldSoft);
        doc.text(k, px + w / 2, y + 0.5, { align: "center" });
        px += w + 3;
      });
      y += 10;

      // hairline
      doc.setDrawColor(60, 60, 90);
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageW - margin, y);
      y += 8;

      // Quote-style short desc
      doc.setFont("times", "italic");
      doc.setFontSize(13);
      doc.setTextColor(...goldSoft);
      const sdLines = doc.splitTextToSize(`"${interp.shortDesc}"`, contentW - 8);
      doc.text(sdLines, margin + 4, y);
      y += sdLines.length * 6 + 6;

      // Full text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(215, 215, 230);
      const paragraphs = interp.fullText.split("\n\n");
      for (const para of paragraphs) {
        const lines = doc.splitTextToSize(para, contentW);
        ensureSpace(lines.length * 4.8 + 4, "dark", num.label);
        doc.text(lines, margin, y);
        y += lines.length * 4.8 + 5;
      }

      // Strengths / Shadow two-column card
      ensureSpace(46, "dark", num.label);
      const colW = (contentW - 6) / 2;
      const boxY = y + 2;
      // Strengths
      doc.setFillColor(18, 20, 40);
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, boxY, colW, 40, 2, 2, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...gold);
      doc.text("STRENGTHS TO LEAN INTO", margin + 4, boxY + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.8);
      doc.setTextColor(220, 220, 235);
      const strengths = interp.keywords.slice(0, 4).map((k) => `◆  ${k}`);
      strengths.forEach((s, i) => doc.text(s, margin + 4, boxY + 13 + i * 5.6));

      // Shadow
      doc.roundedRect(margin + colW + 6, boxY, colW, 40, 2, 2, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...violet);
      doc.text("SHADOW TO INTEGRATE", margin + colW + 10, boxY + 6);
      doc.setFont("times", "italic");
      doc.setFontSize(9);
      doc.setTextColor(220, 220, 235);
      const shadowText =
        paragraphs[1]?.split(".").slice(0, 2).join(".") + "." ||
        "The opposite extreme of your strengths is your most important growth edge.";
      const shadowLines = doc.splitTextToSize(shadowText, colW - 8);
      doc.text(shadowLines.slice(0, 5), margin + colW + 10, boxY + 13);
      y = boxY + 44;

      // Practice this week
      ensureSpace(22, "dark", num.label);
      doc.setFillColor(...gold);
      doc.roundedRect(margin, y, contentW, 16, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...inkDeep);
      doc.text("PRACTICE THIS WEEK", margin + 4, y + 6);
      doc.setFont("times", "italic");
      doc.setFontSize(10);
      const practice = practiceFor(num.type, num.value);
      const pl = doc.splitTextToSize(practice, contentW - 8);
      doc.text(pl, margin + 4, y + 11);
      y += 22;

      // Famous people
      if (interp.famousPeople?.length) {
        ensureSpace(10, "dark", num.label);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...muted);
        doc.text(`KINDRED ${num.value}s   ·   ${interp.famousPeople.join("   ·   ")}`, margin, y + 2);
        y += 6;
      }

      footer("dark", num.label);
    }

    // ============================================================
    // MONTHLY FORECAST PAGE
    // ============================================================
    newPage("parchment");
    sectionLabel("parchment", `${new Date().getFullYear()} Forecast`);
    doc.setFont("times", "normal");
    doc.setFontSize(28);
    doc.setTextColor(...ink);
    doc.text("Your monthly", margin, y + 4);
    doc.setFont("times", "italic");
    doc.text("energy map.", margin, y + 16);
    y += 26;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...softInk);
    const fcIntro = doc.splitTextToSize(
      `Your Personal Year ${profile.personalYear} sets the tone for the next twelve months. Each Personal Month below blends that yearly current with the vibration of the calendar month — a practical compass for where to put your energy.`,
      contentW,
    );
    doc.text(fcIntro, margin, y);
    y += fcIntro.length * 4.6 + 4;

    const currentMonth = new Date().getMonth();
    profile.personalMonths.forEach((n, i) => {
      ensureSpace(16, "parchment", "Forecast");
      const isCurrent = i === currentMonth;
      // row
      if (isCurrent) {
        doc.setFillColor(...cream);
        doc.roundedRect(margin, y, contentW, 14, 1.5, 1.5, "F");
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.4);
        doc.roundedRect(margin, y, contentW, 14, 1.5, 1.5, "S");
      } else {
        doc.setDrawColor(...parchLine);
        doc.setLineWidth(0.2);
        doc.line(margin, y + 14, pageW - margin, y + 14);
      }

      // month
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...softInk);
      doc.text(MONTH_NAMES[i].toUpperCase(), margin + 4, y + 9);
      // number
      doc.setFont("times", "normal");
      doc.setFontSize(18);
      doc.setTextColor(...gold);
      doc.text(String(n), margin + 36, y + 10);
      // theme
      const theme = monthThemes[n] || { title: "Transformation", action: "Stay open. The path is being shown." };
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...ink);
      doc.text(theme.title, margin + 50, y + 7);
      doc.setFont("times", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(...softInk);
      const at = doc.splitTextToSize(theme.action, contentW - 60);
      doc.text(at[0], margin + 50, y + 12);

      if (isCurrent) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...gold);
        doc.text("NOW", pageW - margin - 6, y + 5, { align: "right" });
      }

      y += isCurrent ? 16 : 14.5;
    });

    footer("parchment", "Forecast");

    // ============================================================
    // HIDDEN PASSION + KARMIC PAGE
    // ============================================================
    newPage("dark");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...gold);
    doc.text("HIDDEN PATTERNS", margin, y);
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.3);
    doc.line(margin, y + 1.6, margin + 14, y + 1.6);
    y += 10;

    doc.setFont("times", "normal");
    doc.setFontSize(28);
    doc.setTextColor(...cream);
    doc.text("What's quietly", margin, y + 4);
    doc.setFont("times", "italic");
    doc.text("running the show.", margin, y + 16);
    y += 28;

    // Hidden Passion section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...goldSoft);
    doc.text("HIDDEN PASSION", margin, y);
    y += 6;

    profile.hiddenPassion.forEach((hp) => {
      const desc = passionDescriptions[hp] || passionDescriptions[1];
      ensureSpace(28, "dark", "Hidden Patterns");
      // Card
      doc.setFillColor(18, 20, 40);
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, y, contentW, 24, 2, 2, "FD");
      // number
      doc.setFont("times", "normal");
      doc.setFontSize(28);
      doc.setTextColor(...gold);
      doc.text(String(hp), margin + 14, y + 16, { align: "center" });
      // divider
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.2);
      doc.line(margin + 26, y + 5, margin + 26, y + 19);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...cream);
      doc.text(desc.title, margin + 30, y + 9);
      doc.setFont("times", "italic");
      doc.setFontSize(9);
      doc.setTextColor(215, 215, 230);
      const dl = doc.splitTextToSize(desc.body, contentW - 36);
      doc.text(dl, margin + 30, y + 15);

      y += 28;
    });

    // Karmic Debts
    if (profile.karmicDebt.length) {
      ensureSpace(20, "dark", "Hidden Patterns");
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...violet);
      doc.text("KARMIC DEBT", margin, y);
      y += 6;

      profile.karmicDebt.forEach((d) => {
        const k = karmicLessons[d];
        if (!k) return;
        ensureSpace(28, "dark", "Hidden Patterns");
        doc.setFillColor(24, 18, 44);
        doc.setDrawColor(...violet);
        doc.setLineWidth(0.2);
        doc.roundedRect(margin, y, contentW, 24, 2, 2, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...cream);
        doc.text(k.title, margin + 5, y + 7);
        doc.setFont("times", "italic");
        doc.setFontSize(9);
        doc.setTextColor(215, 215, 230);
        const kl = doc.splitTextToSize(k.lesson, contentW - 10);
        doc.text(kl.slice(0, 3), margin + 5, y + 13);
        y += 28;
      });
    } else {
      ensureSpace(16, "dark", "Hidden Patterns");
      doc.setFont("times", "italic");
      doc.setFontSize(10);
      doc.setTextColor(...goldSoft);
      doc.text(`No Karmic Debt detected in ${name.split(" ")[0]}'s core numbers — a relatively clean past-life slate.`, margin, y + 6);
      y += 14;
    }

    footer("dark", "Hidden Patterns");

    // ============================================================
    // AFFIRMATIONS & RITUAL PAGE
    // ============================================================
    newPage("parchment");
    sectionLabel("parchment", "Practice");
    doc.setFont("times", "normal");
    doc.setFontSize(28);
    doc.setTextColor(...ink);
    doc.text("Daily anchors", margin, y + 4);
    doc.setFont("times", "italic");
    doc.text("for the year ahead.", margin, y + 16);
    y += 28;

    // Affirmation block
    const aff = affirmationFor(profile.lifePath);
    doc.setFillColor(...cream);
    doc.roundedRect(margin, y, contentW, 38, 2, 2, "F");
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.3);
    doc.line(margin + 4, y + 6, margin + 4, y + 32);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...gold);
    doc.text("DAILY AFFIRMATION", margin + 9, y + 9);
    doc.setFont("times", "italic");
    doc.setFontSize(15);
    doc.setTextColor(...ink);
    const affLines = doc.splitTextToSize(`"${aff}"`, contentW - 16);
    doc.text(affLines, margin + 9, y + 19);
    y += 44;

    // Rituals
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...gold);
    doc.text("THREE-MINUTE MORNING RITUAL", margin, y);
    y += 6;
    const ritual = [
      "1.  Sit still. Three slow breaths — in through the nose, out through the mouth.",
      `2.  Say your Life Path number out loud: "I am a ${profile.lifePath}." Notice what rises.`,
      "3.  Set one intention for the day that honors that energy. Write it on paper.",
    ];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...softInk);
    ritual.forEach((line) => {
      const ls = doc.splitTextToSize(line, contentW);
      doc.text(ls, margin, y);
      y += ls.length * 5 + 2;
    });
    y += 6;

    // Journal prompts
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...gold);
    doc.text("JOURNAL PROMPTS FOR THIS SEASON", margin, y);
    y += 6;
    const prompts = journalPromptsFor(profile.personalYear);
    doc.setFont("times", "italic");
    doc.setFontSize(10.5);
    doc.setTextColor(...ink);
    prompts.forEach((p) => {
      const ps = doc.splitTextToSize(`—  ${p}`, contentW);
      ensureSpace(ps.length * 5.2 + 3, "parchment", "Practice");
      doc.text(ps, margin, y);
      y += ps.length * 5.2 + 4;
    });

    footer("parchment", "Practice");

    // ============================================================
    // FINAL PAGE — CTA
    // ============================================================
    newPage("dark");

    drawSigil(pageW / 2, 60, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...goldSoft);
    doc.text("THE FULL READING", pageW / 2, 88, { align: "center" });

    doc.setFont("times", "normal");
    doc.setFontSize(30);
    doc.setTextColor(...cream);
    doc.text("Unlock the Complete", pageW / 2, 106, { align: "center" });
    doc.setFont("times", "italic");
    doc.text("Mystical Blueprint.", pageW / 2, 121, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(215, 215, 230);
    const ctaIntro = doc.splitTextToSize(
      "This free edition covered your six core numbers. The complete blueprint goes far deeper — the full life-phase map, relationship compatibility, lucky codes, and a 40-page printable companion.",
      contentW - 20,
    );
    doc.text(ctaIntro, pageW / 2, 138, { align: "center" });

    const premiumFeatures = [
      "Full Life-Phase Map — 4 Pinnacles & 4 Challenges",
      "Year-by-year forecast through the next 9-year cycle",
      "Relationship & compatibility profile",
      "Personalized lucky codes — colors, crystals, days, numbers",
      "40-page premium printable blueprint",
      "Lifetime access with annual forecast updates",
    ];
    let fy = 162;
    premiumFeatures.forEach((f) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...gold);
      doc.text("✦", margin + 18, fy);
      doc.setTextColor(220, 220, 235);
      doc.text(f, margin + 26, fy);
      fy += 8;
    });

    // Price callout
    const py0 = fy + 6;
    doc.setFillColor(...gold);
    doc.roundedRect(pageW / 2 - 55, py0, 110, 28, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...inkDeep);
    doc.text("ONE-TIME  ·  YOURS FOREVER", pageW / 2, py0 + 8, { align: "center" });
    doc.setFont("times", "normal");
    doc.setFontSize(26);
    doc.text("$7.99", pageW / 2, py0 + 21, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...goldSoft);
    doc.text("MYSTICALDIGITS.COM", pageW / 2, py0 + 40, { align: "center" });

    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    doc.text(
      "Instant access  ·  No subscription  ·  100% private",
      pageW / 2,
      py0 + 47,
      { align: "center" },
    );

    footer("dark", "Continue your journey");

    // Save
    const firstName = name.split(" ")[0] || "Your";
    doc.save(`${firstName}-Numerology-Blueprint.pdf`);

    setGenerating(false);
    setDone(true);
    setTimeout(() => setDone(false), 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className="text-center"
    >
      <div className="relative inline-block">
        <motion.div
          className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 blur-lg"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <Button
          onClick={generatePdf}
          disabled={generating}
          variant="outline"
          className="relative h-14 px-8 font-display text-sm tracking-[0.12em] uppercase border-primary/30 bg-card/80 hover:bg-card hover:border-primary/60 text-foreground transition-all duration-300 gap-2.5"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Crafting your blueprint…
            </>
          ) : done ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Downloaded!
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 text-primary" />
              Download Your Premium Blueprint
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
            </>
          )}
        </Button>
      </div>
      <p className="font-ui text-[10px] text-muted-foreground mt-2.5 tracking-wider">
        {done
          ? "Check your downloads folder ✦"
          : "Editorial 12-page PDF · Designed like a private edition"}
      </p>
    </motion.div>
  );
};

// ===== Helper copy =====
function practiceFor(type: string, n: number): string {
  const lp: Record<number, string> = {
    1: "Make one decision without consulting anyone. Trust the instinct, then act within 24 hours.",
    2: "Schedule a real conversation with someone you've been meaning to reconnect with. Listen more than you speak.",
    3: "Create something tiny every day this week — a sketch, a sentence, a song lyric. Don't show anyone.",
    4: "Pick one foundational habit and do it the same time every day for seven straight days.",
    5: "Break one routine on purpose. New route, new café, new playlist. Notice what your nervous system does.",
    6: "Tend to your home like it's an altar. Light a candle. Cook something with care. Soften toward someone.",
    7: "Take one phone-free walk in nature. No music, no podcast. Let the questions surface.",
    8: "Look at your money this week without flinching. Then ask, in writing, for something you actually want.",
    9: "Identify one thing — a belief, possession, or relationship — that is complete. Release it with gratitude.",
    11: "Sit in silence for ten minutes daily. Write down the first intuition that arrives. Act on one of them.",
    22: "Sketch your most audacious vision on one page — then list the first three concrete steps under it.",
    33: "Offer one act of genuine service this week with no expectation of return. Notice how it lands in your body.",
  };
  return lp[n] || "Sit with the number above. Ask: where is this energy already alive in my life?";
}

function affirmationFor(lp: number): string {
  const m: Record<number, string> = {
    1: "I am the first cause of my own life. I lead with courage and create with conviction.",
    2: "I am loved, I belong, and my sensitivity is my strength.",
    3: "I am a vessel for joy. My voice is wanted, and my creativity heals.",
    4: "I build my life with patience and integrity. What I create endures.",
    5: "I am free, I am curious, and life meets me with adventure.",
    6: "I am love in motion. I create beauty and tend to what matters.",
    7: "I trust the wisdom that rises in my stillness.",
    8: "I am a magnet for abundance. I use power with wisdom.",
    9: "I am here to serve, to release, and to love widely.",
    11: "I am a clear channel. My intuition is trustworthy and on time.",
    22: "I am a master builder. I turn visions into living, lasting things.",
    33: "I am healing through love. My presence is enough.",
  };
  return m[lp] || "I am exactly where I'm meant to be, and the next step is being shown.";
}

function journalPromptsFor(py: number): string[] {
  const generic = [
    "What pattern in my life is asking to be seen, named, and honored?",
    "Where am I being invited to grow, even though it feels uncomfortable?",
    "What would I attempt this year if I trusted myself completely?",
  ];
  const map: Record<number, string[]> = {
    1: ["What new beginning am I being called to initiate?", "Where do I need to lead myself first?", "What would I do this year if I were the only voice that mattered?"],
    2: ["Which relationships deserve more of my attention?", "Where am I being asked to be patient?", "What does true partnership look like for me now?"],
    3: ["What wants to be expressed through me?", "Where have I dimmed my light to fit in?", "What brings me alive — and how can I do more of it?"],
    4: ["What am I being asked to build?", "Where do I need more structure and discipline?", "What foundation am I laying for the next decade?"],
    5: ["What change have I been resisting?", "Where do I need more freedom and adventure?", "What would I do this year if I knew it was time to leap?"],
    6: ["Who or what is asking for my care?", "Where am I over-giving — or not giving enough?", "What does a beautiful, nourishing life look like for me?"],
    7: ["What truth am I being invited to uncover?", "Where do I need more solitude?", "What deeper question is shaping this season of my life?"],
    8: ["What does success on my own terms actually look like?", "Where am I underplaying my power?", "What am I willing to ask for this year — and from whom?"],
    9: ["What is complete and ready to be released?", "What chapter am I closing?", "Who am I becoming on the other side of this ending?"],
  };
  return map[py] || generic;
}

export default FreePdfButton;
