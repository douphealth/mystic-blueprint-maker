import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

const premiumFeatures = [
  { icon: "🔑", title: "Karmic Debt Analysis", desc: "Discover past-life lessons you're here to resolve" },
  { icon: "🔥", title: "Hidden Passion Numbers", desc: "Reveal talents and obsessions you may not recognize" },
  { icon: "🏔️", title: "4 Pinnacles & 4 Challenges", desc: "Your complete life phase map with age ranges" },
  { icon: "📆", title: "12-Month Personal Forecast", desc: "Detailed guidance for every month of the year" },
  { icon: "💕", title: "Love & Compatibility Deep Dive", desc: "Ideal partners, red flags, and a compatibility tool" },
  { icon: "💼", title: "Career & Purpose Alignment", desc: "Best careers, work styles, and abundance tendencies" },
  { icon: "🍀", title: "Your Lucky Codes", desc: "Lucky numbers, colors, crystals, and affirmations" },
  { icon: "📄", title: "25-Page PDF Report", desc: "Beautifully designed downloadable report" },
];

const PremiumPaywall = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      {/* Gradient separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-12" />

      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 border border-gold/30 mb-4"
        >
          <Lock className="w-7 h-7 text-gold" />
        </motion.div>
        <h2 className="font-display text-3xl md:text-4xl text-gradient-gold mb-4">
          Unlock Your Complete Blueprint
        </h2>
        <p className="font-body text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
          You've seen the surface of your numerology profile. But your numbers go <em>much</em> deeper.
          Unlock your Complete Blueprint to discover your karmic lessons, hidden talents, life phases,
          love compatibility, and a full year forecast — <strong>yours forever</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-10">
        {premiumFeatures.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-3 bg-muted/20 rounded-lg p-4 border border-border/30"
          >
            <span className="text-2xl flex-shrink-0 mt-0.5">{feature.icon}</span>
            <div>
              <h3 className="font-display text-sm text-foreground">{feature.title}</h3>
              <p className="font-ui text-xs text-muted-foreground mt-0.5">{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <Button
          className="h-16 px-12 text-lg font-display tracking-wider uppercase bg-gradient-to-r from-gold-dim via-gold to-gold-dim text-primary-foreground hover:from-gold hover:via-gold-light hover:to-gold border-0 shadow-gold transition-all duration-500"
          onClick={() => alert("Stripe integration coming soon! This will be a $7.99 one-time payment.")}
        >
          Unlock for $7.99 — One Time
        </Button>
        <p className="font-ui text-xs text-muted-foreground mt-3">
          Instant access · Lifetime updates · 25-page PDF included
        </p>
      </div>

      {/* Blurred teaser */}
      <div className="mt-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
        <div className="filter blur-sm opacity-40 pointer-events-none space-y-4">
          <div className="bg-card-gradient rounded-xl p-8 border border-border/30">
            <h3 className="font-display text-xl text-foreground">🔑 Karmic Debt Analysis</h3>
            <p className="font-body text-foreground/50 mt-3">Your karmic numbers reveal deep past-life patterns that continue to influence your current journey. The presence of karmic debt in your chart suggests unresolved lessons from previous incarnations that your soul has chosen to address in this lifetime...</p>
          </div>
          <div className="bg-card-gradient rounded-xl p-8 border border-border/30">
            <h3 className="font-display text-xl text-foreground">💕 Love & Compatibility</h3>
            <p className="font-body text-foreground/50 mt-3">Based on your complete numerological profile, your ideal romantic partner carries specific vibrational frequencies that complement and balance your own energy. Your relationship style reveals deep patterns...</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PremiumPaywall;
