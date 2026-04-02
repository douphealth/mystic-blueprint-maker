import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, Heart, TrendingUp, Compass, Lightbulb, Download, Star, Loader2, Zap, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const premiumModules = [
  { icon: Compass, title: "Deep Shadow Pattern Analysis", desc: "Uncover hidden sabotage patterns, blind spots, and karmic wounds blocking your growth" },
  { icon: Heart, title: "Relationship Compatibility Map", desc: "Love patterns, ideal partner vibrations, red flags, and how to attract your soul match" },
  { icon: Layers, title: "Life Phase Map (Pinnacles & Challenges)", desc: "4 Pinnacles + 4 Challenges with exact age ranges and guidance for each phase" },
  { icon: Star, title: "Personalized Lucky Codes", desc: "Your power colors, crystals, affirmations, and optimal days calibrated to your numbers" },
  { icon: Lightbulb, title: "Career & Purpose Alignment", desc: "Specific career paths, business ideas, and purpose work aligned with your vibration" },
  { icon: TrendingUp, title: "Growth Acceleration Prompts", desc: "Actionable exercises, journal prompts, and rituals personalized for your exact blueprint" },
  { icon: Zap, title: "Annual Forecast Deep Dive", desc: "Month-by-month strategic guidance with peak timing for major life decisions" },
  { icon: Download, title: "Premium 25-Page Blueprint PDF", desc: "Museum-quality printable report — a keepsake you'll reference for years" },
];

const PremiumPaywall = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUnlock = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({
        title: "Payment error",
        description: err.message || "Something went wrong. Please try again.",
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
          Go Deeper — Complete Mystical Blueprint
        </h2>
        <p className="font-body text-base text-foreground/60 max-w-md mx-auto leading-relaxed">
          You've seen all 6 core numbers. The Complete Blueprint takes you 10× deeper —
          with shadow analysis, relationship mapping, life phase guidance, lucky codes, and a premium PDF.
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
              "Unlock Complete Blueprint — $7.99"
            )}
          </Button>
          <p className="font-ui text-[10px] text-muted-foreground mt-3 tracking-wider">
            One-time payment · Instant access · Lifetime updates
          </p>
          <p className="font-ui text-[10px] text-muted-foreground/50 mt-1">
            Built from your exact name and birth date — not generic
          </p>
        </motion.div>
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
