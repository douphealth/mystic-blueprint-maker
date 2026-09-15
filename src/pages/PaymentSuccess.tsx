import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import PremiumPdfButton from "@/components/PremiumPdfButton";
import { calculateFullProfile, type NumerologyProfile } from "@/lib/numerology";
import { loadProfileAsDate, markPremiumUnlocked } from "@/lib/entitlement";
import { PREMIUM_PAGE_COUNT } from "@/lib/editions";

/**
 * Stripe's success_url lands here.
 *
 * This page has one job: hand over the thing that was paid for. It previously
 * did not — it congratulated the buyer and sent them back to a homepage that
 * still showed the paywall.
 *
 * The profile comes from localStorage, written when the visitor completed the
 * intake. If storage is unavailable or the purchase happened in a different
 * browser, we ask for the name and birth date again rather than leaving the
 * customer with nothing.
 */
const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [needsDetails, setNeedsDetails] = useState(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [manualProfile, setManualProfile] = useState<{ profile: NumerologyProfile; name: string } | null>(null);

  const stored = useMemo(() => loadProfileAsDate(), []);

  useEffect(() => {
    // only mark the entitlement once the buyer has actually arrived here,
    // which only happens via Stripe's success redirect
    markPremiumUnlocked();
    if (!stored) setNeedsDetails(true);
  }, [stored]);

  const ready = stored
    ? { profile: calculateFullProfile(stored.name, stored.dob), name: stored.name }
    : manualProfile;

  const handleManualSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter the full name used for the reading.");
      return;
    }
    const parsed = new Date(dob);
    if (!dob || Number.isNaN(parsed.getTime())) {
      setError("Please enter a valid birth date.");
      return;
    }
    setError("");
    setManualProfile({ profile: calculateFullProfile(trimmed, parsed), name: trimmed });
    setNeedsDetails(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-6"
        >
          <CheckCircle className="w-10 h-10 text-primary" />
        </motion.div>

        <h1 className="font-display text-3xl text-gradient-gold mb-3">Payment received</h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="font-body text-foreground/60">Thank you — your Premium Edition is unlocked</p>
          <Sparkles className="w-4 h-4 text-primary" />
        </div>

        {ready ? (
          <>
            <p className="font-ui text-sm text-muted-foreground mb-8 max-w-lg mx-auto">
              Your {PREMIUM_PAGE_COUNT}-page Premium Edition starts downloading automatically. Keep this page bookmarked
              — you can download it again as many times as you like.
            </p>
            <PremiumPdfButton profile={ready.profile} name={ready.name} autoDownload />
          </>
        ) : needsDetails ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-left rounded-2xl border border-border/50 bg-card/60 p-6 mb-8"
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="font-body text-sm text-muted-foreground">
                We need the name and birth date your reading was built from — this browser doesn't have them saved.
                Enter them exactly as before and your Premium Edition will be generated immediately.
              </p>
            </div>

            <label className="font-ui text-[10px] tracking-wider text-muted-foreground uppercase">Full birth name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="As it appears on your birth certificate"
              className="bg-card/60 border-border/60 text-foreground font-body mt-1.5 mb-4 h-12"
            />

            <label className="font-ui text-[10px] tracking-wider text-muted-foreground uppercase">Date of birth</label>
            <Input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="bg-card/60 border-border/60 text-foreground font-body mt-1.5 mb-4 h-12"
            />

            {error && <p className="text-destructive text-xs font-ui mb-3">{error}</p>}

            <Button
              onClick={handleManualSubmit}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-gold-light shadow-gold font-display tracking-[0.13em] uppercase"
            >
              Generate My Premium Edition <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        ) : null}

        <div className="mt-2">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="font-ui text-xs text-muted-foreground hover:text-foreground tracking-wider"
          >
            Back to my blueprint
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
