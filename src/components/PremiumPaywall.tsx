import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, FileText, Heart, TrendingUp, Compass, Lightbulb, Download, Star } from "lucide-react";

const premiumModules = [
  { icon: Compass, title: "Full Blueprint Reading", desc: "All 6 core numbers with deep interpretations and life guidance" },
  { icon: Star, title: "Core Energies & Strengths", desc: "Your dominant vibrations and how to harness them" },
  { icon: TrendingUp, title: "Shadow Patterns", desc: "Hidden challenges and karmic lessons to resolve" },
  { icon: Lightbulb, title: "Growth Themes", desc: "Your soul's evolution path and next breakthrough" },
  { icon: Heart, title: "Relationship Tendencies", desc: "Love patterns, ideal partners, and red flags" },
  { icon: FileText, title: "Practical Prompts", desc: "Actionable exercises and reflections for your numbers" },
  { icon: Download, title: "Printable Blueprint PDF", desc: "Beautiful 25-page report — yours forever" },
];

const PremiumPaywall = () => {
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
          className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20 mb-4"
        >
          <Lock className="w-6 h-6 text-primary" />
        </motion.div>
        <h2 className="font-display text-2xl md:text-3xl text-gradient-gold mb-3">
          Complete Mystical Blueprint
        </h2>
        <p className="font-body text-base text-foreground/60 max-w-md mx-auto leading-relaxed">
          Your free reading covered 3 core numbers. The Complete Blueprint goes deeper — 
          with shadow patterns, growth themes, relationship insights, and a printable PDF.
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
            <div className="w-9 h-9 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center flex-shrink-0">
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
            className="h-13 px-12 text-sm font-display tracking-[0.15em] uppercase bg-primary text-primary-foreground hover:bg-gold-light border-0 shadow-gold transition-all duration-300"
            onClick={() => alert("Stripe integration coming soon! $7.99 one-time payment.")}
          >
            Unlock for $7.99
          </Button>
          <p className="font-ui text-[10px] text-muted-foreground mt-3 tracking-wider">
            One-time payment · Instant access · Lifetime updates
          </p>
          <p className="font-ui text-[10px] text-muted-foreground/50 mt-1">
            Personalized blueprint built from your exact name and birth date
          </p>
        </motion.div>
      </div>

      {/* Blurred teaser */}
      <div className="mt-10 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-10" />
        <div className="filter blur-sm opacity-30 pointer-events-none space-y-3">
          <div className="bg-card-gradient rounded-xl p-6 border border-border/20">
            <h3 className="font-display text-base text-foreground">Shadow Patterns & Karmic Lessons</h3>
            <p className="font-body text-sm text-foreground/40 mt-2">Your karmic numbers reveal deep patterns that continue to influence your current journey. The presence of karmic debt suggests unresolved lessons from previous cycles…</p>
          </div>
          <div className="bg-card-gradient rounded-xl p-6 border border-border/20">
            <h3 className="font-display text-base text-foreground">Relationship Tendencies</h3>
            <p className="font-body text-sm text-foreground/40 mt-2">Based on your complete numerological profile, your ideal romantic partner carries specific vibrational frequencies that complement and balance your energy…</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PremiumPaywall;
