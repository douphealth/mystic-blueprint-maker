import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PremiumPdfButton from "@/components/PremiumPdfButton";
import { calculateFullProfile, type NumerologyProfile } from "@/lib/numerology";
import { loadProfileAsDate } from "@/lib/entitlement";

/**
 * Hands over the paid artifact.
 *
 * Extracted from PaymentSuccess because there are now two ways to arrive at
 * "this person is entitled": the Stripe redirect, and restoring a purchase by
 * email on a new device. Both need the same thing — a name and a birth date to
 * generate from — so both use this component.
 *
 * The profile normally comes from localStorage, written when the visitor first
 * completed the intake. When it is missing (different browser, cleared storage,
 * private mode) we ask for the two inputs rather than leaving a paying customer
 * with nothing. Those two fields are all the generator needs; nothing about the
 * purchase depends on them.
 */
interface PremiumDeliveryProps {
  /** Start the download on mount instead of waiting for a click. */
  autoDownload?: boolean;
}

const PremiumDelivery = ({ autoDownload = true }: PremiumDeliveryProps) => {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [manual, setManual] = useState<{ profile: NumerologyProfile; name: string } | null>(null);

  const stored = useMemo(() => loadProfileAsDate(), []);
  // Start on the form when storage has no profile, so the download button never
  // flashes before it is replaced.
  const [needsDetails, setNeedsDetails] = useState(() => stored === null);

  const ready = stored
    ? { profile: calculateFullProfile(stored.name, stored.dob), name: stored.name }
    : manual;

  const handleSubmit = () => {
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
    setManual({ profile: calculateFullProfile(trimmed, parsed), name: trimmed });
    setNeedsDetails(false);
  };

  if (ready) {
    return <PremiumPdfButton profile={ready.profile} name={ready.name} autoDownload={autoDownload} />;
  }

  if (!needsDetails) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto text-left rounded-2xl border border-border/50 bg-card/60 p-6 mb-8"
    >
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="font-body text-sm text-muted-foreground">
          We need the name and birth date your reading was built from — this browser doesn't have them saved. Enter
          them exactly as before and your Premium Edition will be generated immediately.
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
        onClick={handleSubmit}
        className="w-full h-12 bg-primary text-primary-foreground hover:bg-gold-light shadow-gold font-display tracking-[0.13em] uppercase"
      >
        Generate My Premium Edition <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
};

export default PremiumDelivery;
