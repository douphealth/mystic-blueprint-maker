import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type NumerologyProfile, getNumberCategory } from "@/lib/numerology";
import { getInterpretation, birthdayInterpretations } from "@/lib/interpretations";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";

interface FreePdfButtonProps {
  profile: NumerologyProfile;
  name: string;
  autoDownload?: boolean;
}

type RGB = [number, number, number];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const monthlyFocus: Record<number, { theme: string; do: string; avoid: string; ritual: string }> = {
  1: { theme: "Initiation", do: "Choose one bold beginning and make the first visible move.", avoid: "Waiting for universal permission.", ritual: "Write one sentence that starts with: I am ready to lead by…" },
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

const FreePdfButton = ({ profile, name, autoDownload }: FreePdfButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();
  const [downloadedOnce, setDownloadedOnce] = useState(false);

  const generatePdf = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 350));

    try {
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

        // Decorative Corner Accents (Enterprise Mystic Design)
        const drawCorner = (cx: number, cy: number, isRight: boolean, isBottom: boolean) => {
          const len = 7;
          const dx = isRight ? -len : len;
          const dy = isBottom ? -len : len;
          doc.setDrawColor(...gold); doc.setLineWidth(0.5);
          doc.line(cx, cy, cx + dx, cy);
          doc.line(cx, cy, cx, cy + dy);
        };
        drawCorner(14, 14, false, false);
        drawCorner(pageW - 14, 14, true, false);
        drawCorner(14, pageH - 14, false, true);
        drawCorner(pageW - 14, pageH - 14, true, true);
      };

      const footer = (label = "✦ MysticalDigits Premium Blueprint • mysticaldigits.com ✦") => {
        doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...muted);
        doc.text(label, pageW / 2, pageH - 11, { align: "center" });
        doc.link(pageW / 2 - 25, pageH - 13, 50, 4, { url: "https://mysticaldigits.com" });
      };

      const drawSacredGeometry = (cx: number, cy: number, r: number) => {
        doc.setDrawColor(...gold); doc.setLineWidth(0.15);
        doc.circle(cx, cy, r);
        doc.circle(cx, cy, r - 3);
        doc.circle(cx, cy, r - 8);
        doc.circle(cx, cy, r / 2);
        for (let i = 0; i < 12; i++) {
          const angle = (i * Math.PI) / 6;
          const x1 = cx + Math.cos(angle) * (r - 8);
          const y1 = cy + Math.sin(angle) * (r - 8);
          const x2 = cx + Math.cos(angle) * r;
          const y2 = cy + Math.sin(angle) * r;
          doc.line(x1, y1, x2, y2);
        }
        for (let i = 0; i < 8; i++) {
          const a1 = (i * Math.PI) / 4;
          const a2 = ((i + 2) * Math.PI) / 4;
          doc.line(cx + Math.cos(a1) * (r - 3), cy + Math.sin(a1) * (r - 3), cx + Math.cos(a2) * (r - 3), cy + Math.sin(a2) * (r - 3));
        }
      };

      const textLink = (body: string, url: string, label = "Explore in-depth guide ↗") => {
        ensure(10);
        doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...gold);
        doc.text(`${body} [${label}]`, margin, y);
        const textW = doc.getTextWidth(`${body} [${label}]`);
        doc.link(margin, y - 3, textW, 4, { url });
        y += 6;
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

      const premiumCard = (title: string, body: string, color: RGB = gold) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const titleLines = doc.splitTextToSize(title, contentW - 10);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const bodyLines = doc.splitTextToSize(body, contentW - 10);

        const titleHeight = titleLines.length * 4.4;
        const bodyHeight = bodyLines.length * 4.0;
        const padding = 10;
        const cardHeight = titleHeight + bodyHeight + padding;

        ensure(cardHeight);
        const start = y;
        doc.setFillColor(...ink); doc.roundedRect(margin, start, contentW, cardHeight, 3, 3, "F");
        doc.setDrawColor(...color); doc.setLineWidth(0.25); doc.roundedRect(margin, start, contentW, cardHeight, 3, 3, "S");

        doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...color);
        doc.text(titleLines, margin + 5, start + 6);

        doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...pearl);
        doc.text(bodyLines, margin + 5, start + 6 + titleHeight + 1);

        y = start + cardHeight + 5;
      };

      const numbers = [
        { label: "Life Path", value: profile.lifePath, type: "lifePath" as const },
        { label: "Expression / Destiny", value: profile.expression, type: "expression" as const },
        { label: "Soul Urge", value: profile.soulUrge, type: "soulUrge" as const },
        { label: "Personality", value: profile.personality, type: "personality" as const },
        { label: "Birthday", value: profile.birthday, type: "birthday" as const },
        { label: "Personal Year", value: profile.personalYear, type: "personalYear" as const },
      ];

      // Cover
      addBg();
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...gold); doc.text("✦ MYSTICALDIGITS ✦", pageW/2, 30, { align: "center" });
      doc.setFont("helvetica", "bold"); doc.setFontSize(30); doc.setTextColor(...softGold); doc.text("LIFE PATH", pageW/2, 62, { align: "center" });
      doc.setFontSize(25); doc.text("BLUEPRINT", pageW/2, 75, { align: "center" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(...pearl); doc.text("A premium self-discovery workbook for clarity, timing, and aligned action", pageW/2, 89, { align: "center", maxWidth: 150 });
      doc.setDrawColor(...gold); doc.line(55, 102, pageW - 55, 102);
      doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(255,255,255); doc.text(name.toUpperCase(), pageW/2, 118, { align: "center", maxWidth: 160 });

      // Draw gorgeous sacred geometry chart on cover
      const cx = pageW/2, cy = 153;
      drawSacredGeometry(cx, cy, 29);
      doc.setFont("helvetica", "bold"); doc.setFontSize(32); doc.setTextColor(...gold); doc.text(String(profile.lifePath), cx, cy + 4.5, { align: "center" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...pearl); doc.text("YOUR LIFE PATH NUMBER", cx, cy + 40, { align: "center" });
      doc.setFontSize(8); doc.setTextColor(...muted); doc.text("Disclaimer: Numerology is a symbolic reflection tool, not medical, legal, financial, or psychological advice.", pageW/2, pageH - 18, { align: "center", maxWidth: 150 });
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
      for (const n of numbers) {
        let interp: any;
        if (n.type === "birthday") {
          const bdText = birthdayInterpretations[n.value] || birthdayInterpretations[1];
          interp = {
            title: `Birthday Energy: Day ${n.value}`,
            keywords: ["Birthday Energy", "Natural Gift", "Special Talent"],
            shortDesc: bdText.split('.')[0] + '.',
            fullText: bdText
          };
        } else {
          interp = getInterpretation(n.type, n.value)!;
        }

        newPage(`${n.label}: Number ${n.value}`);
        eyebrow(interp.keywords.join(" • "));
        text(interp.title, 14, softGold, "bold");
        text(interp.shortDesc, 9.5, [226, 206, 163], "italic");
        rule();

        text("What this number means:", 9, gold, "bold");
        text(interp.fullText.replace(/\n\n/g, "\n"), 8.5, pearl);

        const val = n.value;
        const details = numberDetails[val] || numberDetails[1];

        premiumCard("Strengths & Shadow Patterns", `• Strengths: ${details.strengths}\n• Shadow Patterns: ${details.shadows}`, teal);
        premiumCard("Decision-making & Relationships", `• Decision Advice: ${details.decision}\n• Relationship Pattern: ${details.relationship}`, lavender);
        premiumCard("Career & Work", `• Career/Work Pattern: ${details.career}`, gold);

        ensure(22);
        text("3 Practical Actions:", 9, teal, "bold");
        details.actions.forEach((act, idx) => {
          text(`${idx + 1}. ${act}`, 8, pearl, "normal", 4);
        });
        y += 2;

        ensure(22);
        text("3 Reflection Prompts:", 9, lavender, "bold");
        details.prompts.forEach((pr, idx) => {
          text(`${idx + 1}. ${pr}`, 8, pearl, "normal", 4);
        });

        y += 3;
        ensure(8);
        if (n.type === "lifePath") {
          textLink("Explore in-depth alignment tactics for Life Path " + n.value, "https://mysticaldigits.com/blog/life-path-guide");
        } else if (n.type === "expression") {
          textLink("How to leverage Expression " + n.value + " in your business & career", "https://mysticaldigits.com/blog/expression-career-guide");
        } else if (n.type === "personalYear") {
          textLink("Align your decision cycles with Personal Year " + n.value + " energy", "https://mysticaldigits.com/blog/numerology-cycles");
        } else if (n.type === "birthday") {
          textLink("Read the deep cosmic meaning behind birthday number " + n.value, "https://mysticaldigits.com/blog/birthday-numbers-meaning");
        } else {
          textLink("Explore more about number " + n.value + " on MysticalDigits", "https://mysticaldigits.com/blog");
        }

        footer();
      }

      // Timing plan
      const currentMonthIdx = new Date().getMonth();
      const month = profile.personalMonths?.[currentMonthIdx] || (((profile.personalYear + currentMonthIdx + 1 - 1) % 9) + 1);
      const focus = monthlyFocus[month] || monthlyFocus[((month - 1) % 9) + 1];
      newPage(`${MONTH_NAMES[new Date().getMonth()]} Focus: ${focus.theme}`);
      text(`Your Personal Month number is ${month}. Treat this as your practical focus filter for the next 30 days.`, 11, pearl, "bold");

      textLink("Read the full Personal Month forecasting guide for Month " + month, `https://mysticaldigits.com/blog/personal-month-${month}`);
      y += 2;

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
        ["Day 1 — Alignment Diagnosis", "Circle the one number that feels most accurate in your reading and write why it resonates."],
        ["Day 2 — Shadow Identification", "Circle the number that feels uncomfortable; this is often your current developmental growth edge."],
        ["Day 3 — Relationship Assessment", "Choose one close relationship and evaluate it through the lens of your Soul Urge motivation."],
        ["Day 4 — Strategic Timing", "Choose one immediate career or financial decision and review it against your Personal Year cycle."],
        ["Day 5 — Environmental Design", "Make one physical or digital environment upgrade that supports your primary numbers."],
        ["Day 6 — Visible Action", "Take one small, visible action: write, publish, ask, clean up, decide, or complete a loop."],
        ["Day 7 — Feedback Loops", "Review the week: what felt aligned, what felt performative, and what evidence did you collect?"],
      ];
      days.forEach(([d, b]) => premiumCard(d, b, d.includes("7") ? gold : teal));
      text("Credibility note: numerology is a symbolic reflection system. Use it to ask better questions, notice patterns, and take grounded action. It is not medical, legal, financial, or psychological advice.", 7.5, muted, "italic");
      footer();

      // Premium Operating System page
      newPage("Your Personal Operating System");
      text("Use this page when you need a fast, grounded answer. Your numbers are not separate facts; together they form a practical operating system for decisions, relationships, work, energy, and timing.", 10, pearl);
      premiumCard("Core drive", `Life Path ${profile.lifePath}: the recurring developmental growth pattern that demands maturity and self-reflection.`, gold);
      premiumCard("Natural gift", `Expression ${profile.expression}: the talent vector that grows stronger when it is actively practiced, packaged, and shared.`, teal);
      premiumCard("Inner fuel", `Soul Urge ${profile.soulUrge}: the private motivation that must be satisfied for decisions to feel emotionally clean.`, lavender);
      premiumCard("Social signal", `Personality ${profile.personality}: the initial impression and energetic style you project to the outer world.`, gold);
      premiumCard("Timing Season", `Personal Year ${profile.personalYear} + Personal Month ${month}: your current seasonal cycle; use it to regulate your work pace.`, teal);
      footer();

      // Decision filter
      newPage("Premium Decision Filter");
      text("Before saying yes, investing, launching, replying, committing, or delaying, run the decision through these five diagnostic filters.", 10, pearl);
      [
        ["1. Alignment Filter", "Does this decision support my Life Path growth, or does it repeat an old shadow pattern?"],
        ["2. Integrity Filter", "Does my Soul Urge feel genuinely satisfied, or am I performing for approval/guilt?"],
        ["3. Capability Filter", "Will this allow my core Destiny / Expression talents to be utilized, refined, and visible?"],
        ["4. Seasonal Filter", "Does this match the timing of my Personal Year, or am I forcing the wrong action for this season?"],
        ["5. Leverage Filter", "What is the smallest test/proof step I can run within 24-72 hours before overcommitting?"],
      ].forEach(([title, body]) => premiumCard(title, body, title.startsWith("5") ? gold : teal));

      text("Decision I am currently evaluating:", 9.5, softGold, "bold");
      for (let i = 0; i < 2; i++) { ensure(8); doc.setDrawColor(85, 77, 106); doc.line(margin, y, pageW - margin, y); y += 8; }
      y += 2;
      text("My smallest next proof step (24-hour test):", 9.5, softGold, "bold");
      for (let i = 0; i < 2; i++) { ensure(8); doc.setDrawColor(85, 77, 106); doc.line(margin, y, pageW - margin, y); y += 8; }
      footer();

      // Shadow to strategy
      newPage("Shadow → Strategy Map");
      text("Every number has a mature expression and a distorted expression. Use this page to convert friction into a cleaner behavior.", 10, pearl);
      const shadowRows = [
        ["When I feel stuck or triggered:", "Identify the repeated emotion or trigger without judging it. (e.g. control, anxiety, collapse)"],
        ["My default coping strategy:", "What do I usually do — avoid, chase, overgive, overthink, rebel, or isolate?"],
        ["The mature response:", "What would my Life Path look like if it were calm, resourced, and completely honest?"],
        ["The 10-minute shift action:", "What micro-action is small enough to do now and meaningful enough to shift the pattern?"],
      ];
      shadowRows.forEach(([title, body]) => {
        ensure(28);
        doc.setFillColor(...gold); doc.rect(margin, y - 2.5, 1.5, 1.5, "F");
        text(title, 9.5, softGold, "bold", 5);
        text(body, 8, muted, "normal", 5);

        doc.setDrawColor(85, 77, 106); doc.setLineWidth(0.15);
        for (let i = 0; i < 2; i++) {
          ensure(8);
          doc.line(margin + 5, y, pageW - margin, y);
          y += 8;
        }
        y += 2;
      });
      footer();

      // 30-day activation plan
      newPage("30-Day Activation Plan");
      text("Choose one central theme for the next 30 days. The goal is to make your existing patterns more conscious, useful, and grounded.", 10, pearl);
      const weeks = [
        ["Week 1 — Observational Tracking", "Notice where your number shows up naturally in your decisions, conflicts, boundaries, and avoidance."],
        ["Week 2 — Calibration & Boundaries", "Choose one specific behavior to upgrade: set a clearer boundary, align a routine, or seek rest."],
        ["Week 3 — Bold Alignment", "Take a visible step: publish your work, ask for what you need, resolve a dispute, or finish an open loop."],
        ["Week 4 — Integration & Audit", "Audit your progress. Preserve what worked, release what was performative, and set the next monthly focus."],
      ];
      weeks.forEach(([w, b]) => premiumCard(w, b, w.includes("4") ? gold : teal));

      text("My 30-day activation theme:", 9.5, softGold, "bold");
      for (let i = 0; i < 2; i++) { ensure(8); doc.setDrawColor(85, 77, 106); doc.line(margin, y, pageW - margin, y); y += 8; }
      footer();

      // Relationship/work prompts
      newPage("High-Value Reflection Prompts");
      text("Answer these prompts during your weekly review to align your schedule, career, and boundaries.", 10, pearl);
      y += 2;
      const prompts = [
        "Where am I making life harder by ignoring my natural cosmic design?",
        "What do people consistently receive from me — clarity, care, ideas, beauty, structure, courage, or leadership?",
        "What specific boundary would make my core gift easier for others to trust?",
        "What opportunity am I calling 'not the right time' because it asks me to step into leadership?",
        "What would premium self-respect look like this week in my calendar, body, home, inbox, and budget?",
        "What project is complete, and what wisdom can I keep without carrying the obligation forward?",
      ];
      prompts.forEach((prompt, idx) => {
        ensure(26);
        doc.setDrawColor(...gold); doc.setLineWidth(0.3);
        doc.rect(margin, y - 2.5, 3, 3, "S");

        text(prompt, 9.5, softGold, "bold", 5);

        doc.setDrawColor(85, 77, 106); doc.setLineWidth(0.15);
        for (let i = 0; i < 2; i++) {
          ensure(8);
          doc.line(margin + 5, y, pageW - margin, y);
          y += 8;
        }
        y += 2;
      });
      footer();

      doc.save(`${name.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "mysticaldigits"}-premium-life-path-blueprint.pdf`);
      setDone(true);
      setGenerating(false);
      setTimeout(() => setDone(false), 2500);
    } catch (err: any) {
      console.error("Failed to generate PDF:", err);
      toast({
        title: "PDF Generation Failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (autoDownload && !downloadedOnce && !generating) {
      setDownloadedOnce(true);
      generatePdf();
    }
  }, [autoDownload, downloadedOnce, generating]);

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
