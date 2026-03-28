import { motion, useInView } from "framer-motion";
import { getNumberCategory, getCategoryColor } from "@/lib/numerology";
import type { NumberInterpretation } from "@/lib/interpretations";
import { useRef } from "react";

interface NumerologySectionProps {
  icon: string;
  number: number;
  interpretation: NumberInterpretation;
  index: number;
}

const NumerologySection = ({ icon, number, interpretation, index }: NumerologySectionProps) => {
  const category = getNumberCategory(number);
  const color = getCategoryColor(category);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const paragraphs = interpretation.fullText.split('\n\n');

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="relative bg-card-gradient rounded-xl border border-border/50 p-5 md:p-8 overflow-hidden group"
    >
      {/* Animated ambient glow */}
      <motion.div
        className="absolute -top-20 -right-20 w-48 h-48 rounded-full"
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: [0.04, 0.1, 0.04], scale: [0.8, 1.1, 0.8] } : {}}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Animated top accent line */}
      <motion.div
        className="absolute top-0 left-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        initial={{ width: "0%" }}
        animate={isInView ? { width: "100%" } : {}}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-baseline gap-3 mb-4">
          <motion.span
            className="text-sm"
            style={{ color: `${color}cc` }}
            animate={isInView ? { rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {icon}
          </motion.span>
          <h2 className="font-display text-lg md:text-xl text-foreground flex-1">
            {interpretation.title}
          </h2>
          <motion.span
            className="font-display text-2xl font-bold"
            style={{ color }}
            animate={isInView ? { textShadow: [`0 0 10px ${color}00`, `0 0 20px ${color}60`, `0 0 10px ${color}00`] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {number}
          </motion.span>
        </div>

        {/* Keywords with stagger */}
        <div className="flex flex-wrap gap-2 mb-4">
          {interpretation.keywords.map((kw, i) => (
            <motion.span
              key={kw}
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground px-2 py-0.5 rounded-full border border-border/40 bg-muted/20"
            >
              {kw}
            </motion.span>
          ))}
        </div>

        {/* Quote with animated border */}
        <motion.div
          className="mb-5 border-l-2 pl-4"
          style={{ borderColor: `${color}30` }}
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p className="text-gold-light/80 font-body text-base md:text-lg leading-relaxed italic">
            {interpretation.shortDesc}
          </p>
        </motion.div>

        {/* Body paragraphs with stagger */}
        <div className="font-body text-[15px] md:text-base text-foreground/80 leading-[1.8] space-y-3">
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.2, duration: 0.5 }}
            >
              {p}
            </motion.p>
          ))}
        </div>

        {/* Famous people */}
        {interpretation.famousPeople && (
          <motion.div
            className="mt-5 pt-4 border-t border-border/20"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
          >
            <p className="font-ui text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5">
              Notable {number}s
            </p>
            <p className="font-body text-sm text-foreground/60">{interpretation.famousPeople.join(" · ")}</p>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default NumerologySection;
