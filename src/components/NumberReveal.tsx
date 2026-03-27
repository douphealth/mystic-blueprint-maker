import { motion } from "framer-motion";
import { getNumberCategory, getCategoryColor } from "@/lib/numerology";

interface NumberRevealProps {
  number: number;
  label: string;
  delay?: number;
}

const NumberReveal = ({ number, label, delay = 0 }: NumberRevealProps) => {
  const category = getNumberCategory(number);
  const color = getCategoryColor(category);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, type: "spring", stiffness: 100 }}
      className="flex flex-col items-center"
    >
      <div className="relative">
        <motion.div
          className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center border-2 relative z-10"
          style={{ borderColor: color, boxShadow: `0 0 30px ${color}40, inset 0 0 20px ${color}15` }}
          animate={{ boxShadow: [`0 0 20px ${color}30`, `0 0 40px ${color}50`, `0 0 20px ${color}30`] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="font-display text-4xl md:text-5xl font-bold" style={{ color }}>
            {number}
          </span>
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle, ${color}15, transparent 70%)` }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <p className="mt-3 font-display text-xs tracking-[0.2em] uppercase text-muted-foreground">{label}</p>
    </motion.div>
  );
};

export default NumberReveal;
