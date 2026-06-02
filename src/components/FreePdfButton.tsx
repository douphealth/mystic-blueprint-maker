import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type NumerologyProfile, getNumberCategory } from "@/lib/numerology";
import { getInterpretation, birthdayInterpretations } from "@/lib/interpretations";
import jsPDF from "jspdf";

interface FreePdfButtonProps {
  profile: NumerologyProfile;
  name: string;
}

type RGB = [number, number, number];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const monthlyFocus: Record<number, { theme: string; do: string; avoid: string; ritual: string }> = {
  1: { theme: "Initiation", do: "Choose one bold beginning and make the first visible move.", avoid: "Waiting for universal permission.", ritual: "Write one sentence that starts with: I am ready to lead by…" },
  2: { theme: "Partnership", do: "Strengthen one relationship through listening, patience, or repair.", avoid: "Absorbing everyone else’s emotions.", ritual: "Ask: what needs gentleness instead of force this week?" },
  3: { theme: "Expression", do: "Publish, pitch, write, record, design, or share something alive.", avoid: "Hiding your voice behind perfectionism.", ritual: "Create for 20 minutes before consuming anything." },
  4: { theme: "Foundation", do: "Turn an idea into a system: calendar, checklist, budget, or routine.", avoid: "Mistaking busyness for stability.", ritual: "Clear one friction point from your daily environment." },
  5: { theme: "Liberation", do: "Experiment intelligently; change the pattern, not your whole life at once.", avoid: "Impulsive escapes disguised as intuition.", ritual: "Name the habit you are outgrowing and the behavior replacing it." },
  6: { theme: "Devotion", do: "Care for home, body, beauty, family, and emotional responsibility.", avoid: "Rescuing people who have not asked to be saved.", ritual: "Make one space feel peaceful, premium, and cared for." },
  7: { theme: "Wisdom", do: "Go deeper: research, reflect, pray, study, investigate, restore.", avoid: "Withdrawing so far that nobody can reach you.", ritual: "Spend 12 quiet minutes with one question and no phone." },
  8: { theme: "Power", do: "Make the adult decision around money, leadership, pricing, or boundaries.", avoid: "Playing small to stay likable.", ritual: "Write the number, boundary, or ask you have been avoiding." },
  9: { theme: "Completion", do: "Release what is complete; preserve only the wisdom.", avoid: "Keeping expired obligations alive out of guilt.", ritual: "Close one loop: delete, donate, forgive, archive, or finish." },
  11: { theme: "Illumination", do: "Trust the signal, then ground it into one practical action.", avoid: "Living only in signs without execution.", ritual: "Capture three intuitive hits, then choose one to test." },
  22: { theme: "Master Builder", do: "Give your vision architecture: scope, timeline, people, proof.", avoid: "Carrying the whole mountain alone.", ritual: "Break the big dream into the next three concrete deliverables." },
  33: { theme: "Compassionate Leadership", do: "Serve from overflow, teach through example, and protect your energy.", avoid: "Martyrdom marketed as love.", ritual: "Choose one helpful act that does not require self-abandonment." },
};

const numberPrinciples: Record<number, string[]> = {
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

const FreePdfButton = ({ profile, name }: FreePdfButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const generatePdf = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 350));

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentW = pageW - margin * 2;
    let y = margin;

    const ink: RGB = [18, 16, 28];
    const midnight: RGB = [8, 8, 18];
    const gold: RGB = [221, 177, 70];
    const softGold: RGB = [245, 224, 171];
    const pearl: RGB = [252, 246, 229];
    const muted: RGB = [157, 147, 128];
    const lavender: RGB = [155, 124, 217];
    const teal: RGB = [88, 194, 184];

    const addBg = () => {
      doc.setFillColor(...midnight); doc.rect(0, 0, pageW, pageH, "F");
      doc.setFillColor(18, 14, 34); doc.roundedRect(8, 8, pageW - 16, pageH - 16, 4, 4, "F");
      doc.setDrawColor(...gold); doc.setLineWidth(0.25); doc.roundedRect(11, 11, pageW - 22, pageH - 22, 3, 3, "S");
      doc.setDrawColor(70, 58, 110); doc.setLineWidth(0.15); doc.roundedRect(14, 14, pageW - 28, pageH - 28, 3, 3, "S");
    };
    const footer = (label = "MysticalDigits • Free Life Path Blueprint") => {
      doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...muted);
      doc.text(label, pageW / 2, pageH - 11, { align: "center" });
    };
    const newPage = (title?: string) => {
      doc.addPage(); addBg(); y = margin + 4;
      if (title) { sectionTitle(title); y += 2; }
    };
    const ensure = (needed: number) => { if (y + needed > pageH - 24) newPage(); };
    const text = (body: string, size = 10, color: RGB = pearl, style: "normal" | "bold" | "italic" = "normal", indent = 0) => {
      doc.setFont("helvetica", style); doc.setFontSize(size); doc.setTextColor(...color);
      const lines = doc.splitTextToSize(body, contentW - indent);
      ensure(lines.length * (size * 0.44) + 4);
      doc.text(lines, margin + indent, y); y += lines.length * (size * 0.44) + 4;
    };
    const eyebrow = (body: string) => { doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...gold); doc.text(body.toUpperCase(), margin, y); y += 5; };
    const sectionTitle = (body: string) => { doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(...softGold); const lines = doc.splitTextToSize(body, contentW); doc.text(lines, margin, y); y += lines.length * 8 + 4; };
    const rule = () => { doc.setDrawColor(...gold); doc.setLineWidth(0.25); doc.line(margin, y, pageW - margin, y); y += 7; };
    const card = (title: string, body: string, color: RGB = gold) => {
      ensure(36);
      const start = y;
      doc.setFillColor(...ink); doc.roundedRect(margin, start, contentW, 32, 3, 3, "F");
      doc.setDrawColor(...color); doc.setLineWidth(0.25); doc.roundedRect(margin, start, contentW, 32, 3, 3, "S");
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...color); doc.text(title, margin + 5, start + 8);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...pearl); doc.text(doc.splitTextToSize(body, contentW - 10), margin + 5, start + 15);
      y = start + 39;
    };

    const numbers = [
      { label: "Life Path", value: profile.lifePath, type: "lifePath" as const },
      { label: "Expression / Destiny", value: profile.expression, type: "expression" as const },
      { label: "Soul Urge", value: profile.soulUrge, type: "soulUrge" as const },
      { label: "Personality", value: profile.personality, type: "personality" as const },
      { label: "Birthday", value: profile.birthday, type: null },
      { label: "Personal Year", value: profile.personalYear, type: "personalYear" as const },
    ];

    // Cover
    addBg();
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...gold); doc.text("MYSTICALDIGITS", pageW/2, 30, { align: "center" });
    doc.setFont("helvetica", "bold"); doc.setFontSize(30); doc.setTextColor(...softGold); doc.text("LIFE PATH", pageW/2, 62, { align: "center" });
    doc.setFontSize(25); doc.text("BLUEPRINT", pageW/2, 75, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(...pearl); doc.text("A premium self-discovery workbook for clarity, timing, and aligned action", pageW/2, 89, { align: "center", maxWidth: 150 });
    doc.setDrawColor(...gold); doc.line(55, 102, pageW - 55, 102);
    doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(255,255,255); doc.text(name.toUpperCase(), pageW/2, 118, { align: "center", maxWidth: 160 });
    const cx = pageW/2, cy = 151;
    doc.setDrawColor(...gold); doc.setLineWidth(0.6); doc.circle(cx, cy, 27);
    doc.setFontSize(34); doc.setTextColor(...gold); doc.text(String(profile.lifePath), cx, cy + 5, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...pearl); doc.text("YOUR LIFE PATH NUMBER", cx, cy + 38, { align: "center" });
    doc.setFontSize(9); doc.setTextColor(...muted); doc.text("Use this as a reflective planning tool — not deterministic advice.", pageW/2, pageH - 24, { align: "center", maxWidth: 150 });
    footer(`Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`);

    // Quick map
    newPage("Your Blueprint at a Glance");
    text("This is designed to be useful immediately: understand your core pattern, choose your weekly focus, and convert insight into action.", 10, pearl);
    const colW = contentW / 3;
    numbers.forEach((n, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = margin + col * colW + 5, yy = y + row * 35;
      doc.setFillColor(...ink); doc.roundedRect(x, yy, colW - 10, 28, 3, 3, "F");
      doc.setDrawColor(...gold); doc.roundedRect(x, yy, colW - 10, 28, 3, 3, "S");
      doc.setFont("helvetica", "bold"); doc.setFontSize(17); doc.setTextColor(...gold); doc.text(String(n.value), x + (colW - 10)/2, yy + 12, { align: "center" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(...pearl); doc.text(n.label.toUpperCase(), x + (colW - 10)/2, yy + 22, { align: "center" });
    });
    y += 76; rule();
    card("How to read this", "Start with Life Path for your recurring growth pattern. Then read Soul Urge for inner motivation, Expression for gifts, Personality for social style, and Personal Year for timing.", teal);
    footer();

    // Core sections
    for (const n of numbers.filter(n => n.type)) {
      const interp = getInterpretation(n.type!, n.value)!;
      newPage(`${n.label}: ${n.value}`);
      eyebrow(interp.keywords.join(" • "));
      text(interp.title, 15, softGold, "bold");
      text(interp.shortDesc, 11, [226, 206, 163], "italic");
      rule();
      text(interp.fullText.replace(/\n\n/g, "\n"), 9.5, pearl);
      const principles = numberPrinciples[n.value] || ["Use the insight as a mirror, then choose one grounded behavior."];
      card("Three grounded practices", principles.map((p, i) => `${i + 1}. ${p}`).join("\n"), lavender);
      card("This week’s action", `Choose one situation where your ${n.label} energy can become more useful, practical, and visible. Make the action small enough to complete in 24 hours.`, teal);
      footer();
    }

    // Birthday energy
    newPage(`Birthday Energy: Day ${profile.birthday}`);
    text(birthdayInterpretations[profile.birthday] || birthdayInterpretations[1], 10, pearl);
    card("Reflection prompt", "What natural gift do people already come to you for — and how could you package it more intentionally?", gold);
    footer();

    // Timing plan
    const month = profile.personalMonth;
    const focus = monthlyFocus[month] || monthlyFocus[((month - 1) % 9) + 1];
    newPage(`${MONTH_NAMES[new Date().getMonth()]} Focus: ${focus.theme}`);
    text(`Your Personal Month number is ${month}. Treat this as your practical focus filter for the next 30 days.`, 11, pearl, "bold");
    card("Do", focus.do, teal);
    card("Avoid", focus.avoid, lavender);
    card("Ritual", focus.ritual, gold);
    text("Premium planning page", 12, softGold, "bold");
    ["The one decision I am ready to make:", "The pattern I am no longer feeding:", "The supportive action I will take within 24 hours:", "The evidence I will track this week:"].forEach(prompt => {
      text(prompt, 9, pearl, "bold");
      doc.setDrawColor(85, 77, 106); for (let i=0;i<3;i++){ ensure(8); doc.line(margin, y, pageW-margin, y); y += 8; }
    });
    footer();

    // Integration
    newPage("7-Day Integration Plan");
    const days = [
      ["Day 1", "Circle the one number that feels most accurate and write why."],
      ["Day 2", "Circle the number that feels uncomfortable; this is often your growth edge."],
      ["Day 3", "Choose one relationship where your blueprint can make you more honest or kind."],
      ["Day 4", "Choose one money/work decision and apply your Personal Year timing."],
      ["Day 5", "Create one environment upgrade that supports your numbers."],
      ["Day 6", "Take one visible action: publish, ask, clean up, decide, or complete."],
      ["Day 7", "Review: what felt energizing, what felt forced, and what repeats?"],
    ];
    days.forEach(([d, b]) => card(d, b, d === "Day 7" ? gold : teal));
    text("Credibility note: numerology is a symbolic reflection system. Use it to ask better questions, notice patterns, and take grounded action. It is not medical, legal, financial, or psychological advice.", 8, muted);
    footer();



    // Premium synthesis page
    newPage("Your Personal Operating System");
    text("Use this page when you need a fast, grounded answer. Your numbers are not separate facts; together they form a practical operating system for decisions, relationships, work, energy, and timing.", 10, pearl);
    card("Core drive", `Life Path ${profile.lifePath}: the recurring lesson and growth pattern that keeps asking for maturity.`, gold);
    card("Natural gift", `Expression ${profile.expression}: the talent channel that becomes stronger when it is practiced, packaged, and shared.`, teal);
    card("Inner fuel", `Soul Urge ${profile.soulUrge}: the private motivation that must be honored for decisions to feel emotionally clean.`, lavender);
    card("Social signal", `Personality ${profile.personality}: the first impression and energetic style people often meet before they know your deeper story.`, gold);
    card("Timing", `Personal Year ${profile.personalYear} + Personal Month ${profile.personalMonth}: the season you are in now; use it to choose the right pace and pressure level.`, teal);
    footer();

    // Decision filter
    newPage("Premium Decision Filter");
    text("Before saying yes, buying, quitting, launching, replying, committing, or delaying, run the decision through these five filters.", 10, pearl);
    [
      ["1. Alignment", "Does this strengthen my Life Path lesson or repeat an old shadow pattern?"],
      ["2. Energy", "Does my Soul Urge feel nourished, or am I performing for approval?"],
      ["3. Expression", "Will this let my gifts become more useful, visible, or refined?"],
      ["4. Timing", "Does this match the rhythm of my Personal Year/Month, or am I forcing the wrong season?"],
      ["5. Proof", "What small test can I run within 24–72 hours before overcommitting?"],
    ].forEach(([title, body]) => card(title, body, title.startsWith("5") ? gold : teal));
    text("Decision I am evaluating:", 9, pearl, "bold");
    for (let i=0;i<5;i++){ ensure(8); doc.setDrawColor(85,77,106); doc.line(margin, y, pageW-margin, y); y += 8; }
    text("My smallest next proof step:", 9, pearl, "bold");
    for (let i=0;i<4;i++){ ensure(8); doc.setDrawColor(85,77,106); doc.line(margin, y, pageW-margin, y); y += 8; }
    footer();

    // Shadow to strategy
    newPage("Shadow → Strategy Map");
    text("Every number has a high expression and a distorted expression. Use this page to convert friction into a cleaner behavior.", 10, pearl);
    const shadowRows = [
      ["When I feel stuck", "Name the repeated emotion or trigger without judging it."],
      ["The old strategy", "What do I usually do — avoid, chase, control, overgive, overthink, rebel, collapse?"],
      ["The mature expression", "What would my Life Path look like if it were calm, resourced, and honest?"],
      ["The 10-minute action", "What action is small enough to do now and meaningful enough to shift the pattern?"],
    ];
    shadowRows.forEach(([title, body]) => {
      text(title, 10, softGold, "bold");
      text(body, 8.5, muted);
      for (let i=0;i<3;i++){ ensure(8); doc.setDrawColor(85,77,106); doc.line(margin, y, pageW-margin, y); y += 8; }
      y += 2;
    });
    footer();

    // 30-day activation plan
    newPage("30-Day Activation Plan");
    text("Pick one theme for the month. The goal is not to become a different person; it is to make your existing pattern more conscious, useful, beautiful, and grounded.", 10, pearl);
    const weeks = [
      ["Week 1 — Notice", "Track where your number shows up naturally: decisions, conflicts, creativity, money, relationships, avoidance."],
      ["Week 2 — Refine", "Choose one behavior to upgrade: clearer boundary, better routine, braver expression, deeper rest, cleaner completion."],
      ["Week 3 — Express", "Make it visible: publish, ask, organize, repair, decide, pitch, schedule, create, or finish."],
      ["Week 4 — Integrate", "Review evidence. Keep what worked, release what was performative, and choose the next grounded practice."],
    ];
    weeks.forEach(([w,b]) => card(w,b, w.includes("4") ? gold : teal));
    text("My 30-day theme:", 9, pearl, "bold");
    for (let i=0;i<4;i++){ ensure(8); doc.setDrawColor(85,77,106); doc.line(margin, y, pageW-margin, y); y += 8; }
    footer();

    // Relationship/work prompts
    newPage("High-Value Reflection Prompts");
    const prompts = [
      "Where am I making life harder by ignoring my natural design?",
      "What do people consistently receive from me — clarity, care, ideas, beauty, structure, courage, insight, leadership?",
      "What boundary would make my gift easier to trust?",
      "What opportunity am I calling ‘not the right time’ because it asks me to grow?",
      "What would premium self-respect look like this week in my calendar, body, home, inbox, money, and relationships?",
      "What is complete, and what wisdom can I keep without keeping the obligation?",
    ];
    prompts.forEach((prompt, idx) => {
      text(`${idx + 1}. ${prompt}`, 9, softGold, "bold");
      for (let i=0;i<3;i++){ ensure(8); doc.setDrawColor(85,77,106); doc.line(margin, y, pageW-margin, y); y += 8; }
      y += 1;
    });
    footer();

    doc.save(`${name.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "mysticaldigits"}-premium-life-path-blueprint.pdf`);
    setDone(true);
    setGenerating(false);
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-3xl border border-primary/25 bg-card/70 p-5 shadow-gold/20 mb-8 text-center">
      <div className="flex items-center justify-center gap-2 mb-2 text-primary">
        <Sparkles className="w-4 h-4" />
        <span className="font-ui text-[10px] tracking-[0.22em] uppercase">Unlocked after email capture</span>
      </div>
      <h3 className="font-display text-xl text-gradient-gold mb-2">Download your free premium PDF blueprint</h3>
      <p className="font-body text-sm text-muted-foreground mb-4 max-w-xl mx-auto">
        A gorgeous premium workbook with your six-number map, interpretations, timing guide, decision filters, shadow-to-strategy map, 30-day activation plan, printable prompts, rituals, and 7-day integration plan.
      </p>
      <Button onClick={generatePdf} disabled={generating} className="h-13 px-6 bg-primary text-primary-foreground hover:bg-gold-light shadow-gold font-display tracking-[0.13em] uppercase">
        {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Premium Workbook…</> : done ? <><CheckCircle className="w-4 h-4 mr-2" />Downloaded</> : <><Download className="w-4 h-4 mr-2" />Download Free Blueprint PDF</>}
      </Button>
      <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/60 font-ui tracking-wide">
        <FileText className="w-3 h-3" /> PDF generated privately in your browser — no Lovable dependency.
      </div>
    </motion.div>
  );
};

export default FreePdfButton;
