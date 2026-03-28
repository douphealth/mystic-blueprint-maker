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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="relative bg-card-gradient rounded-xl border border-border/50 p-5 md:p-8 overflow-hidden group"
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-[0.06] transition-opacity duration-700 group-hover:opacity-[0.12]"
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-gold/70 text-sm">{icon}</span>
          <h2 className="font-display text-lg md:text-xl text-foreground flex-1">
            {interpretation.title}
          </h2>
          <span className="font-display text-2xl font-bold" style={{ color }}>{number}</span>
        </div>

        {/* Keywords */}
        <div className="flex flex-wrap gap-2 mb-4">
          {interpretation.keywords.map((kw) => (
            <span key={kw} className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground px-2 py-0.5 rounded-full border border-border/40 bg-muted/20">
              {kw}
            </span>
          ))}
        </div>

        {/* Quote */}
        <p className="text-gold-light/80 font-body text-base md:text-lg mb-5 leading-relaxed italic border-l-2 border-gold/20 pl-4">
          {interpretation.shortDesc}
        </p>

        {/* Body */}
        <div className="font-body text-[15px] md:text-base text-foreground/80 leading-[1.8] space-y-3">
          {interpretation.fullText.split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Famous people */}
        {interpretation.famousPeople && (
          <div className="mt-5 pt-4 border-t border-border/20">
            <p className="font-ui text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5">
              Notable {number}s
            </p>
            <p className="font-body text-sm text-foreground/60">{interpretation.famousPeople.join(" · ")}</p>
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default NumerologySection;
