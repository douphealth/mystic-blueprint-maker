import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Loader2, CheckCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type NumerologyProfile } from "@/lib/numerology";
import { PREMIUM_PAGE_COUNT, blueprintSlug } from "@/lib/editions";
import { useToast } from "@/hooks/use-toast";

export const premiumFileName = (name: string) =>
  `${blueprintSlug(name)}-premium-edition-blueprint.pdf`;

interface PremiumPdfButtonProps {
  profile: NumerologyProfile;
  name: string;
  /** start the download as soon as the component mounts */
  autoDownload?: boolean;
}

/**
 * Delivers the paid artifact.
 *
 * This is the component that closes the loop on the checkout: before it
 * existed, a paying customer landed on /payment-success and had nothing to
 * download.
 */
const PremiumPdfButton = ({ profile, name, autoDownload }: PremiumPdfButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();
  const startedRef = useRef(false);

  const generatePdf = async () => {
    setGenerating(true);
    // let the button repaint into its loading state before blocking the thread
    await new Promise((r) => setTimeout(r, 300));

    try {
      // ~60 pages of vector content, so the generator is loaded on demand
      const { generateBlueprintPdf } = await import("@/lib/blueprintPdf");
      const doc = generateBlueprintPdf(profile, name, { tier: "premium" });
      doc.save(premiumFileName(name));
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err: unknown) {
      console.error("Failed to generate premium PDF:", err);
      toast({
        title: "Premium PDF generation failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (autoDownload && !startedRef.current) {
      startedRef.current = true;
      generatePdf();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownload]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-3xl border border-primary/40 bg-card/70 p-5 shadow-gold/30 mb-8 text-center"
    >
      <div className="flex items-center justify-center gap-2 mb-2 text-primary">
        <Crown className="w-4 h-4" />
        <span className="font-ui text-[10px] tracking-[0.22em] uppercase">Premium Edition · Unlocked</span>
      </div>
      <h3 className="font-display text-xl text-gradient-gold mb-2">
        Your {PREMIUM_PAGE_COUNT}-page Premium Edition
      </h3>
      <p className="font-body text-sm text-muted-foreground mb-4 max-w-xl mx-auto">
        Nine deep sections built from your exact numbers — shadow pattern analysis, the relationship map, career and
        purpose alignment, wealth and legacy settings, personal codes, the full life phase map, growth prompts, a
        month-by-month forecast, an operating system and printable journals.
      </p>
      <Button
        onClick={generatePdf}
        disabled={generating}
        className="h-13 px-6 bg-primary text-primary-foreground hover:bg-gold-light shadow-gold font-display tracking-[0.13em] uppercase"
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Building Your Premium Edition…
          </>
        ) : done ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Downloaded
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Download Premium Edition PDF
          </>
        )}
      </Button>
      <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/60 font-ui tracking-wide">
        <FileText className="w-3 h-3" /> Generated in your browser — download it again any time from this page.
      </div>
    </motion.div>
  );
};

export default PremiumPdfButton;
