import { motion } from "framer-motion";
import { getNumberCategory, getCategoryColor } from "@/lib/numerology";
import type { NumberInterpretation } from "@/lib/interpretations";

interface NumerologySectionProps {
  icon: string;
  number: number;
  interpretation: NumberInterpretation;
  index: number;
}

const NumerologySection = ({ icon, number, interpretation, index }: NumerologySectionProps) => {
  const category = getNumberCategory(number);
  const color = getCategoryColor(category);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className="relative bg-card-gradient rounded-xl border border-border/50 p-6 md:p-10 overflow-hidden"
    >
      {/* Subtle glow */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }} />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-3xl">{icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-display text-xl md:text-2xl text-foreground">{interpretation.title}</h2>
              <span className="font-display text-2xl md:text-3xl font-bold" style={{ color }}>{number}</span>
            </div>
            <p className="text-muted-foreground font-ui text-xs tracking-wide uppercase mt-1">
              {interpretation.keywords.join(" · ")}
            </p>
          </div>
        </div>

        <p className="text-gold-light font-body text-lg md:text-xl mb-6 leading-relaxed italic">
          "{interpretation.shortDesc}"
        </p>

        <div className="font-body text-base md:text-lg text-foreground/85 leading-relaxed space-y-4">
          {interpretation.fullText.split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {interpretation.famousPeople && (
          <div className="mt-6 pt-4 border-t border-border/30">
            <p className="font-ui text-xs uppercase tracking-widest text-muted-foreground mb-2">Famous people sharing this number</p>
            <p className="font-body text-foreground/70">{interpretation.famousPeople.join(" · ")}</p>
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default NumerologySection;
