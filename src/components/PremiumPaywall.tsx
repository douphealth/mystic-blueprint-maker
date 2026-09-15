import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, Heart, TrendingUp, Compass, Lightbulb, Download, Star, Loader2, Zap, Layers } from "lucide-react";
import RestorePurchase from "@/components/RestorePurchase";
import { startCheckout } from "@/lib/premiumApi";
import { FREE_PAGE_COUNT, PREMIUM_PAGE_LABEL, PREMIUM_PAGE_COUNT } from "@/lib/editions";
import { useToast } from "@/hooks/use-toast";

const premiumModules = [
  { icon: Compass, title: "Deep Shadow Pattern Analysis", desc: "The trigger, the coping move, the cost, and the mature response — for every number in your chart" },
  { icon: Heart, title: "Relationship Compatibility Map", desc: "Your signature read against all 12 Life Paths, plus red flags and green lights you can actually use" },
  { icon: Layers, title: "Life Phase Map (Pinnacles & Challenges)", desc: "All 4 Pinnacles with exact age ranges, and all 4 Challenges worked through one at a time" },
  { icon: Star, title: "Personalised Lucky Codes", desc: "Power colours, crystal, element, direction, favourable days and numbers, plus an affirmation per number" },
  { icon: Lightbulb, title: "Career & Purpose Alignment", desc: "Environments, roles and industries for your Expression — plus a 7-line fit grid for any opportunity" },
  { icon: TrendingUp, title: "Wealth & Legacy Settings", desc: "Your money archetype, where it leaks, the one rule that fixes it, and a legacy builder worksheet" },
  { icon: Zap, title: "Annual Forecast Deep Dive", desc: "Your Personal Year in depth, your position in the nine-year wave, and four months at a time with full detail" },
  { icon: Compass, title: "Personal Operating System", desc: "Five principles, a four-line decision filter, a 90-day execution board and a quarterly review protocol" },
  { icon: TrendingUp, title: "Growth Acceleration Prompts", desc: "35 uncomfortable questions across 7 domains, with space to actually write the answers" },
  { icon: Download, title: `${PREMIUM_PAGE_LABEL} Premium Edition PDF`, desc: "Museum-quality printable report — a keepsake you'll reference for years" },
];

interface PremiumPaywallProps {
  /** Captured by the email gate; prefills checkout so the buyer doesn't retype it. */
  email?: string;
  /** Fired when a restore succeeds, so the parent can swap in the download. */
  onUnlocked?: () => void;
}

const PremiumPaywall = ({ email, onUnlocked }: PremiumPaywallProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUnlock = async () => {
    setLoading(true);
    try {
      // startCheckout tries the backend first and falls back to the static
      // Stripe payment link, so this no longer surfaces a raw network error
      // when the edge function is unreachable.
      const { url } = await startCheckout(email);
      window.open(url, "_blank");
    } catch (err: unknown) {
      toast({
        title: "Payment error",
        description: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-10" />

      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4"
        >
          <Lock className="w-7 h-7 text-primary" />
        </motion.div>
        <h2 className="font-display text-2xl md:text-3xl text-gradient-gold mb-3">
          Go Deeper — The Premium Edition
        </h2>
        <p className="font-body text-base text-foreground/60 max-w-md mx-auto leading-relaxed">
          You've read your six core numbers in a {FREE_PAGE_COUNT}-page workbook. The Premium Edition
          is {PREMIUM_PAGE_COUNT} pages — nine further sections that turn the reading into a working system.
        </p>
      </div>

      {/* What you get — locked modules */}
      <div className="space-y-2.5 max-w-lg mx-auto mb-8">
        {premiumModules.map((mod, i) => (
          <motion.div
            key={mod.title}
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-3.5 rounded-lg p-3.5 border border-border/30 bg-muted/10 group hover:border-primary/20 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center flex-shrink-0">
              <mod.icon className="w-4 h-4 text-primary/70" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm text-foreground leading-tight">{mod.title}</h3>
              <p className="font-ui text-[10px] text-muted-foreground mt-0.5 leading-snug">{mod.desc}</p>
            </div>
            <Lock className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Button
            className="h-14 px-14 text-sm font-display tracking-[0.15em] uppercase bg-primary text-primary-foreground hover:bg-gold-light border-0 shadow-gold transition-all duration-300"
            onClick={handleUnlock}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…</>
            ) : (
              "Unlock The Premium Edition — $7.99"
            )}
          </Button>
          <p className="font-ui text-[10px] text-muted-foreground mt-3 tracking-wider">
            One-time payment · Instant access · Lifetime updates
          </p>
          <p className="font-ui text-[10px] text-muted-foreground/50 mt-1">
            Built from your exact name and birth date — not generic
          </p>
        </motion.div>

        {/* The way back in for anyone who already paid. */}
        <RestorePurchase defaultEmail={email} onRestored={onUnlocked} />
      </div>

      {/* Blurred teaser */}
      <div className="mt-10 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-10" />
        <div className="filter blur-sm opacity-30 pointer-events-none space-y-3">
          <div className="bg-card-gradient rounded-xl p-6 border border-border/20">
            <h3 className="font-display text-base text-foreground">Shadow Patterns & Karmic Wounds</h3>
            <p className="font-body text-sm text-foreground/40 mt-2">Your shadow analysis reveals deep subconscious patterns that have been silently sabotaging your relationships, career, and personal growth. The specific interplay between your Life Path and Personality creates…</p>
          </div>
          <div className="bg-card-gradient rounded-xl p-6 border border-border/20">
            <h3 className="font-display text-base text-foreground">Relationship Compatibility Blueprint</h3>
            <p className="font-body text-sm text-foreground/40 mt-2">Based on your complete numerological profile, your ideal romantic partner carries vibrational frequencies that complement your specific energy pattern. Your Soul Urge combined with your Personality reveals…</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PremiumPaywall;
