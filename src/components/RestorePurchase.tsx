import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, MailQuestion, CheckCircle, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PremiumDelivery from "@/components/PremiumDelivery";
import { markPremiumUnlocked, saveBuyerEmail } from "@/lib/entitlement";
import { requestRestoreLink } from "@/lib/premiumApi";

/**
 * "I already paid — where is my file?"
 *
 * Without this, a buyer who cleared their browser, switched device, or opened
 * the link in a different browser had no way back to a product they own. That
 * is a support ticket and a refund request every single time, and it is a
 * worse outcome for the customer than any amount of casual over-delivery.
 *
 * The buyer types the address they paid with and the server emails a one-time
 * unlock link to it. Unlocking on the typed address alone (the old behaviour)
 * let anyone who knew a buyer's email get the paid file, and told them that
 * person had bought it. The reply is the same whether or not a purchase exists.
 *
 * Against an older backend without the request-restore route, this falls back
 * to the direct lookup so restore keeps working during the rollout.
 */
interface RestorePurchaseProps {
  /** Prefilled from the email gate when we have it. */
  defaultEmail?: string;
  /** Called once access is granted, so the parent can swap the paywall out. */
  onRestored?: () => void;
  /** Show the email field straight away instead of the "Restore it" link. */
  startOpen?: boolean;
}

const RestorePurchase = ({ defaultEmail, onRestored, startOpen = false }: RestorePurchaseProps) => {
  const [open, setOpen] = useState(startOpen);
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [checking, setChecking] = useState(false);
  const [restored, setRestored] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");

  const handleRestore = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter the email address you used at checkout.");
      return;
    }
    setError("");
    setChecking(true);
    try {
      const outcome = await requestRestoreLink(trimmed);
      if (outcome.kind === "link_sent") {
        setSentTo(trimmed);
      } else if (outcome.kind === "legacy" && outcome.result.entitled) {
        markPremiumUnlocked();
        saveBuyerEmail(trimmed);
        setRestored(true);
        onRestored?.();
      } else if (outcome.kind === "legacy" && !outcome.result.inconclusive) {
        setError(
          "We couldn't find a purchase for that address. Try the one from your Stripe receipt, or reply to that receipt and we'll fix it.",
        );
      } else {
        setError("We couldn't reach our records just now. Please try again in a moment.");
      }
    } catch {
      setError("We couldn't reach our records just now. Please try again in a moment.");
    } finally {
      setChecking(false);
    }
  };

  if (sentTo) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        role="status"
        className="max-w-md mx-auto mt-8 text-left rounded-2xl border border-border/50 bg-card/60 p-5"
      >
        <div className="flex items-start gap-3">
          <MailCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="font-body text-sm text-muted-foreground">
            If <span className="text-foreground">{sentTo}</span> has a Premium Edition purchase, we've emailed it a
            one-time link that unlocks it in this browser. It can take a few minutes; check your spam folder too.
          </p>
        </div>
      </motion.div>
    );
  }

  if (restored) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
        <div className="flex items-center justify-center gap-2 mb-4 text-primary">
          <CheckCircle className="w-4 h-4" />
          <span className="font-ui text-[10px] tracking-[0.22em] uppercase">Purchase restored</span>
        </div>
        <PremiumDelivery autoDownload={false} />
      </motion.div>
    );
  }

  if (!open) {
    return (
      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="font-ui text-[11px] text-muted-foreground hover:text-foreground tracking-wider underline underline-offset-4 decoration-muted-foreground/30 transition-colors"
        >
          Already purchased? Restore it
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-8 text-left rounded-2xl border border-border/50 bg-card/60 p-5"
    >
      <div className="flex items-start gap-3 mb-4">
        <MailQuestion className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="font-body text-sm text-muted-foreground">
          Enter the email address you paid with. We'll email you a one-time link that unlocks your Premium Edition
          in this browser.
        </p>
      </div>

      <Input
        type="email"
        autoComplete="email"
        aria-label="Email address you paid with"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleRestore();
        }}
        placeholder="you@example.com"
        className="bg-card/60 border-border/60 text-foreground font-body mb-3 h-12"
      />

      {error && <p className="text-destructive text-xs font-ui mb-3 leading-relaxed">{error}</p>}

      <div className="flex gap-2">
        <Button
          onClick={handleRestore}
          disabled={checking}
          className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-gold-light shadow-gold font-display tracking-[0.13em] uppercase text-xs"
        >
          {checking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking…
            </>
          ) : (
            <>
              Email me a link <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setError("");
          }}
          className="font-ui text-xs text-muted-foreground"
        >
          Cancel
        </Button>
      </div>
    </motion.div>
  );
};

export default RestorePurchase;
