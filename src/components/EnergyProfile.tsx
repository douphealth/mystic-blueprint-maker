import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { type NumerologyProfile, getNumberCategory, getCategoryColor, type NumberCategory } from "@/lib/numerology";

interface EnergyProfileProps {
  profile: NumerologyProfile;
  name: string;
}

const categoryDescriptions: Record<NumberCategory, string> = {
  spiritual: "Deep intuition, mystical awareness, connection to higher consciousness",
  creative: "Artistic vision, innovation, self-expression and imaginative power",
  leadership: "Authority, ambition, pioneering spirit and executive capability",
  healing: "Compassion, universal love, service to humanity and emotional depth",
  analytical: "Structure, discipline, methodical thinking and practical mastery",
  nurturing: "Empathy, partnership, harmony-building and emotional intelligence",
};

const EnergyProfile = ({ profile, name }: EnergyProfileProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  // Calculate energy distribution
  const allNumbers = [
    profile.lifePath,
    profile.expression,
    profile.soulUrge,
    profile.personality,
    profile.birthday,
    profile.personalYear,
  ];

  const energyCounts: Record<NumberCategory, number> = {
    spiritual: 0, creative: 0, leadership: 0, healing: 0, analytical: 0, nurturing: 0,
  };

  allNumbers.forEach((n) => {
    const cat = getNumberCategory(n);
    energyCounts[cat]++;
  });

  const total = allNumbers.length;
  const sortedEnergies = Object.entries(energyCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]) as [NumberCategory, number][];

  const dominantEnergy = sortedEnergies[0];
  const firstName = name.split(" ")[0];

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="relative bg-card-gradient rounded-xl border border-border/50 p-5 md:p-8 overflow-hidden"
    >
      <motion.div
        className="absolute -top-20 -right-20 w-48 h-48 rounded-full"
        style={{ background: `radial-gradient(circle, ${getCategoryColor(dominantEnergy[0])}15, transparent 70%)` }}
        animate={isInView ? { scale: [0.8, 1.2, 0.8] } : {}}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10">
        <div className="text-center mb-6">
          <h2 className="font-display text-xl md:text-2xl text-gradient-gold mb-1">
            Energy Signature
          </h2>
          <p className="font-ui text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            Your dominant vibrational frequencies
          </p>
        </div>

        {/* Energy bars */}
        <div className="space-y-3 mb-6">
          {sortedEnergies.map(([category, count], i) => {
            const color = getCategoryColor(category);
            const percentage = Math.round((count / total) * 100);

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-ui text-xs capitalize text-foreground/80">{category}</span>
                  </div>
                  <span className="font-ui text-[10px] text-muted-foreground">{percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${percentage}%` } : {}}
                    transition={{ duration: 1, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dominant energy description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="rounded-lg p-4 border border-border/20 bg-muted/10"
        >
          <p className="font-ui text-[10px] tracking-wider uppercase text-primary mb-1.5">
            Dominant Energy: <span className="capitalize">{dominantEnergy[0]}</span>
          </p>
          <p className="font-body text-sm text-foreground/70 leading-relaxed">
            {firstName}, your blueprint is dominated by{" "}
            <span className="text-primary capitalize">{dominantEnergy[0]}</span> energy.{" "}
            {categoryDescriptions[dominantEnergy[0]]}.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default EnergyProfile;
