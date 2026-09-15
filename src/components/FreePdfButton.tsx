import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type NumerologyProfile } from "@/lib/numerology";
import { FREE_PAGE_COUNT, blueprintSlug } from "@/lib/editions";
import { useToast } from "@/hooks/use-toast";

interface FreePdfButtonProps {
  profile: NumerologyProfile;
  name: string;
  autoDownload?: boolean;
}

export const blueprintFileName = (name: string) =>
  `${blueprintSlug(name)}-complete-life-path-blueprint.pdf`;

const FreePdfButton = ({ profile, name, autoDownload }: FreePdfButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();
  const [downloadedOnce, setDownloadedOnce] = useState(false);

  const generatePdf = async () => {
    setGenerating(true);
    // let the button repaint into its loading state before we block the thread
    await new Promise((r) => setTimeout(r, 350));

    try {
      // Loaded on demand: the embedded brand fonts are ~330 kB of base64, and
      // there is no reason for a visitor who never downloads the PDF to pay
      // for them on first paint.
      const { generateBlueprintPdf } = await import("@/lib/blueprintPdf");
      const doc = generateBlueprintPdf(profile, name);
      doc.save(blueprintFileName(name));
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } catch (err: unknown) {
      console.error("Failed to generate PDF:", err);
      toast({
        title: "PDF Generation Failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (autoDownload && !downloadedOnce && !generating) {
      setDownloadedOnce(true);
      generatePdf();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownload, downloadedOnce, generating]);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-3xl border border-primary/25 bg-card/70 p-5 shadow-gold/20 mb-8 text-center">
      <div className="flex items-center justify-center gap-2 mb-2 text-primary">
        <Sparkles className="w-4 h-4" />
        <span className="font-ui text-[10px] tracking-[0.22em] uppercase">Unlocked after email capture</span>
      </div>
      <h3 className="font-display text-xl text-gradient-gold mb-2">Download your complete blueprint PDF</h3>
      <p className="font-body text-sm text-muted-foreground mb-4 max-w-xl mx-auto">
        A {FREE_PAGE_COUNT}-page workbook built from your own six numbers — full interpretations, your timing cycle,
        the decision filter, the shadow-to-strategy map, a 30-day activation plan, and printable reflection pages.
      </p>
      <Button onClick={generatePdf} disabled={generating} className="h-13 px-6 bg-primary text-primary-foreground hover:bg-gold-light shadow-gold font-display tracking-[0.13em] uppercase">
        {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Your Workbook…</> : done ? <><CheckCircle className="w-4 h-4 mr-2" />Downloaded</> : <><Download className="w-4 h-4 mr-2" />Download Free Blueprint PDF</>}
      </Button>
      <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/60 font-ui tracking-wide">
        <FileText className="w-3 h-3" /> Generated privately in your browser — your details never leave this page.
      </div>
    </motion.div>
  );
};

export default FreePdfButton;
