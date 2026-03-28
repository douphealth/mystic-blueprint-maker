import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

const premiumFeatures = [
  { title: "Karmic Debt Analysis", desc: "Past-life lessons to resolve" },
  { title: "Hidden Passion Numbers", desc: "Unrecognized talents & drives" },
  { title: "Life Phase Map", desc: "4 Pinnacles & Challenges with ages" },
  { title: "12-Month Forecast", desc: "Personalized monthly guidance" },
  { title: "Love Compatibility", desc: "Ideal partners & red flags" },
  { title: "Career Alignment", desc: "Best paths & abundance patterns" },
  { title: "Lucky Codes", desc: "Numbers, colors, crystals & days" },
  { title: "25-Page PDF Report", desc: "Beautiful downloadable keepsake" },
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
          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 mb-4"
        >
          <Lock className="w-5 h-5 text-primary" />
        </motion.div>
        <h2 className="font-display text-2xl md:text-3xl text-gradient-gold mb-3">
          Your Complete Blueprint
        </h2>
        <p className="font-body text-base text-foreground/60 max-w-md mx-auto leading-relaxed">
          Go deeper — karmic lessons, hidden talents, life phases,
          compatibility, and a full year forecast. <strong className="text-foreground/80">Yours forever.</strong>
        </p>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-2 gap-2.5 max-w-lg mx-auto mb-8">
        {premiumFeatures.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg p-3 border border-border/20 bg-muted/10"
          >
            <h3 className="font-display text-xs text-foreground leading-tight">{feature.title}</h3>
            <p className="font-ui text-[10px] text-muted-foreground mt-0.5">{feature.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button
          className="h-12 px-10 text-sm font-display tracking-[0.15em] uppercase bg-primary text-primary-foreground hover:bg-gold-light border-0 shadow-gold transition-all duration-300"
          onClick={() => alert("Stripe integration coming soon! $7.99 one-time payment.")}
        >
          Unlock for $7.99
        </Button>
        <p className="font-ui text-[10px] text-muted-foreground mt-2.5 tracking-wider">
          Instant access · Lifetime updates · PDF included
        </p>
      </div>

      {/* Blurred teaser */}
      <div className="mt-10 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-10" />
        <div className="filter blur-sm opacity-30 pointer-events-none space-y-3">
          <div className="bg-card-gradient rounded-xl p-6 border border-border/20">
            <h3 className="font-display text-base text-foreground">Karmic Debt Analysis</h3>
            <p className="font-body text-sm text-foreground/40 mt-2">Your karmic numbers reveal deep past-life patterns that continue to influence your current journey. The presence of karmic debt suggests unresolved lessons from previous incarnations…</p>
          </div>
          <div className="bg-card-gradient rounded-xl p-6 border border-border/20">
            <h3 className="font-display text-base text-foreground">Love & Compatibility</h3>
            <p className="font-body text-sm text-foreground/40 mt-2">Based on your complete numerological profile, your ideal romantic partner carries specific vibrational frequencies that complement and balance your energy…</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PremiumPaywall;
