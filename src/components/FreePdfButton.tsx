import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type NumerologyProfile, getNumberCategory } from "@/lib/numerology";
import { getInterpretation, birthdayInterpretations } from "@/lib/interpretations";
import jsPDF from "jspdf";

interface FreePdfButtonProps {
  profile: NumerologyProfile;
  name: string;
}

const monthThemes: Record<number, string> = {
  1: "New beginnings & initiative",
  2: "Partnerships & patience",
  3: "Creative expression & joy",
  4: "Building foundations",
  5: "Change & freedom",
  6: "Home, family & love",
  7: "Reflection & inner wisdom",
  8: "Power & abundance",
  9: "Completion & release",
  11: "Spiritual awakening",
  22: "Manifesting grand vision",
  33: "Master healing",
};

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const passionDescriptions: Record<number, string> = {
  1: "Independence and originality fuel your fire — you're a natural pioneer.",
  2: "Connection and harmony motivate you — you thrive through meaningful partnerships.",
  3: "Creative expression is your lifeblood — art and communication drive you.",
  4: "Building something lasting gives you purpose — structure is your superpower.",
  5: "Adventure and transformation keep your spirit alive.",
  6: "Nurturing and creating beauty is your calling.",
  7: "The pursuit of deep truth captivates you.",
  8: "Achievement and mastery call to you — abundance is your birthright.",
  9: "Universal compassion and serving the greater good fulfills your soul.",
};

const FreePdfButton = ({ profile, name }: FreePdfButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const generatePdf = async () => {
    setGenerating(true);

    // Small delay for UX
    await new Promise((r) => setTimeout(r, 400));

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = 0;

    const gold = [191, 155, 48] as [number, number, number];
    const dark = [15, 17, 23] as [number, number, number];
    const midGray = [120, 120, 140] as [number, number, number];
    const lightGray = [180, 180, 195] as [number, number, number];
    const accentPurple = [120, 80, 160] as [number, number, number];

    const addBackground = () => {
      doc.setFillColor(...dark);
      doc.rect(0, 0, pageW, pageH, "F");
    };

    const ensureSpace = (needed: number) => {
      if (y + needed > pageH - 20) {
        doc.addPage();
        addBackground();
        y = margin;
      }
    };

    const drawDivider = () => {
      ensureSpace(8);
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.3);
      const center = pageW / 2;
      doc.line(center - 30, y, center + 30, y);
      y += 8;
    };

    // ========== PAGE 1: COVER ==========
    addBackground();

    // Decorative top line
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(margin, 30, pageW - margin, 30);

    // Brand
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...lightGray);
    doc.text("MYSTICALDIGITS.COM", pageW / 2, 40, { align: "center" });

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(...gold);
    doc.text("NUMEROLOGY", pageW / 2, 75, { align: "center" });
    doc.setFontSize(22);
    doc.text("BLUEPRINT", pageW / 2, 87, { align: "center" });

    // Name
    doc.setFontSize(10);
    doc.setTextColor(...lightGray);
    doc.text("PERSONAL READING FOR", pageW / 2, 108, { align: "center" });

    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text(name.toUpperCase(), pageW / 2, 120, { align: "center" });

    // Decorative line
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.3);
    doc.line(pageW / 2 - 25, 126, pageW / 2 + 25, 126);

    // Number grid
    const numbers = [
      { label: "LIFE PATH", value: profile.lifePath },
      { label: "DESTINY", value: profile.expression },
      { label: "SOUL URGE", value: profile.soulUrge },
      { label: "PERSONALITY", value: profile.personality },
      { label: "BIRTHDAY", value: profile.birthday },
      { label: "PERSONAL YEAR", value: profile.personalYear },
    ];

    const gridStartY = 140;
    const colW = contentW / 3;
    numbers.forEach((n, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const cx = margin + col * colW + colW / 2;
      const cy = gridStartY + row * 38;

      // Circle
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.5);
      doc.circle(cx, cy, 12);

      // Number
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...gold);
      doc.text(String(n.value), cx, cy + 1.5, { align: "center" });

      // Label
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(...lightGray);
      doc.text(n.label, cx, cy + 18, { align: "center" });
    });

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...midGray);
    doc.text("Free Numerology Blueprint — MysticalDigits.com", pageW / 2, pageH - 15, { align: "center" });
    doc.text(`Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, pageW / 2, pageH - 10, { align: "center" });

    // ========== PAGE 2+: CORE NUMBERS ==========
    const coreNumbers = [
      { key: "lifePath", label: "Life Path", value: profile.lifePath, type: "lifePath" as const },
      { key: "expression", label: "Expression / Destiny", value: profile.expression, type: "expression" as const },
      { key: "soulUrge", label: "Soul Urge", value: profile.soulUrge, type: "soulUrge" as const },
      { key: "personality", label: "Personality", value: profile.personality, type: "personality" as const },
      { key: "personalYear", label: `${new Date().getFullYear()} Personal Year`, value: profile.personalYear, type: "personalYear" as const },
    ];

    for (const num of coreNumbers) {
      doc.addPage();
      addBackground();
      y = margin;

      const interp = getInterpretation(num.type, num.value);
      if (!interp) continue;

      // Section header
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...lightGray);
      doc.text(num.label.toUpperCase(), margin, y + 5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(36);
      doc.setTextColor(...gold);
      doc.text(String(num.value), pageW - margin, y + 5, { align: "right" });

      y += 14;

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      const titleLines = doc.splitTextToSize(interp.title, contentW);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 8 + 4;

      // Keywords
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...accentPurple);
      doc.text(interp.keywords.join("  ·  "), margin, y);
      y += 8;

      // Divider
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.3);
      doc.line(margin, y, margin + 40, y);
      y += 6;

      // Short description (quote style)
      doc.setFont("helvetica", "italic");
      doc.setFontSize(11);
      doc.setTextColor(220, 200, 160);
      const quoteLines = doc.splitTextToSize(`"${interp.shortDesc}"`, contentW - 10);
      doc.text(quoteLines, margin + 5, y);
      y += quoteLines.length * 5.5 + 8;

      // Full text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 210);
      const paragraphs = interp.fullText.split("\n\n");
      for (const para of paragraphs) {
        const lines = doc.splitTextToSize(para, contentW);
        ensureSpace(lines.length * 5 + 6);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 6;
      }

      // Famous people
      if (interp.famousPeople && interp.famousPeople.length > 0) {
        ensureSpace(15);
        y += 4;
        doc.setDrawColor(60, 60, 80);
        doc.setLineWidth(0.2);
        doc.line(margin, y, pageW - margin, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...midGray);
        doc.text(`NOTABLE ${num.value}s: ${interp.famousPeople.join("  ·  ")}`, margin, y);
        y += 6;
      }

      // Page footer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...midGray);
      doc.text("MysticalDigits.com — Free Blueprint", pageW / 2, pageH - 10, { align: "center" });
    }

    // ========== MONTHLY FORECAST PAGE ==========
    doc.addPage();
    addBackground();
    y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...gold);
    doc.text(`${new Date().getFullYear()} MONTHLY ENERGY MAP`, pageW / 2, y + 5, { align: "center" });
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...lightGray);
    doc.text("Your personal vibration for each month of the year", pageW / 2, y, { align: "center" });
    y += 12;

    const monthColW = contentW / 3;
    profile.personalMonths.forEach((num, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const cx = margin + col * monthColW;
      const cy = y + row * 28;
      const currentMonth = new Date().getMonth();

      ensureSpace(30);

      // Month box
      if (i === currentMonth) {
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.5);
        doc.roundedRect(cx, cy, monthColW - 4, 24, 2, 2, "S");
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...lightGray);
      doc.text(MONTH_NAMES[i].toUpperCase(), cx + 3, cy + 6);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...gold);
      doc.text(String(num), cx + 3, cy + 16);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...midGray);
      doc.text(monthThemes[num] || "Transformation", cx + 18, cy + 16);
    });

    y += Math.ceil(12 / 3) * 28 + 8;

    // Hidden Passion
    ensureSpace(30);
    drawDivider();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...gold);
    doc.text("HIDDEN PASSION", margin, y);
    y += 8;

    profile.hiddenPassion.forEach((hp) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text(String(hp), margin, y + 2);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(200, 200, 210);
      const desc = passionDescriptions[hp] || passionDescriptions[1];
      const lines = doc.splitTextToSize(desc, contentW - 20);
      doc.text(lines, margin + 18, y);
      y += lines.length * 5 + 8;
    });

    // Karmic Debt
    if (profile.karmicDebt.length > 0) {
      ensureSpace(25);
      drawDivider();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...accentPurple);
      doc.text("KARMIC LESSONS", margin, y);
      y += 8;

      const karmicLessons: Record<number, string> = {
        13: "Karmic Debt 13 — Past-life shortcuts now demand focused, honest discipline.",
        14: "Karmic Debt 14 — Past-life excess requires learning healthy moderation and self-control.",
        16: "Karmic Debt 16 — Ego dissolution teaches that your true self is indestructible.",
        19: "Karmic Debt 19 — Learn to lead with compassion rather than domination.",
      };

      profile.karmicDebt.forEach((debt) => {
        const desc = karmicLessons[debt] || `Karmic Debt ${debt}`;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(200, 200, 210);
        const lines = doc.splitTextToSize(desc, contentW);
        ensureSpace(lines.length * 5 + 5);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 5;
      });
    }

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...midGray);
    doc.text("MysticalDigits.com — Free Blueprint", pageW / 2, pageH - 10, { align: "center" });

    // ========== LAST PAGE: CTA ==========
    doc.addPage();
    addBackground();

    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(margin, 50, pageW - margin, 50);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...gold);
    doc.text("UNLOCK YOUR", pageW / 2, 75, { align: "center" });
    doc.text("COMPLETE BLUEPRINT", pageW / 2, 87, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 210);
    const ctaLines = doc.splitTextToSize(
      "This free reading covered your 6 core numbers. The Complete Mystical Blueprint goes much deeper — with shadow pattern analysis, relationship compatibility insights, life phase mapping (Pinnacles & Challenges), lucky codes, and a premium 25-page PDF report.",
      contentW - 10
    );
    doc.text(ctaLines, margin + 5, 105);

    const premiumFeatures = [
      "Deep shadow pattern analysis & karmic resolution",
      "Relationship compatibility & love patterns",
      "Life Phase Map (4 Pinnacles + 4 Challenges)",
      "Personalized Lucky Codes (colors, crystals, affirmations)",
      "Premium 25-page printable blueprint",
      "Lifetime access with annual forecast updates",
    ];

    let featureY = 145;
    premiumFeatures.forEach((feat) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...gold);
      doc.text("✦", margin + 5, featureY);
      doc.setTextColor(200, 200, 210);
      doc.text(feat, margin + 14, featureY);
      featureY += 8;
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...gold);
    doc.text("blueprint.mysticaldigits.com", pageW / 2, featureY + 20, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...lightGray);
    doc.text("One-time $7.99 — Instant access — Yours forever", pageW / 2, featureY + 30, { align: "center" });

    // Save
    const firstName = name.split(" ")[0];
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
              Generating your blueprint…
            </>
          ) : done ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Downloaded!
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 text-primary" />
              Download Free Blueprint PDF
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
            </>
          )}
        </Button>
      </div>
      <p className="font-ui text-[10px] text-muted-foreground mt-2.5 tracking-wider">
        {done
          ? "Check your downloads folder ✦"
          : "Beautiful PDF with all 6 numbers · Free forever"}
      </p>
    </motion.div>
  );
};

export default FreePdfButton;
