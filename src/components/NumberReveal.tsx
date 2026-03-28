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
      initial={{ opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, type: "spring", stiffness: 120 }}
      className="flex flex-col items-center"
    >
      <motion.div
        className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border"
        style={{ borderColor: `${color}60`, boxShadow: `0 0 20px ${color}20, inset 0 0 15px ${color}10` }}
        animate={{ boxShadow: [`0 0 15px ${color}15`, `0 0 25px ${color}30`, `0 0 15px ${color}15`] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="font-display text-2xl md:text-3xl font-bold" style={{ color }}>
          {number}
        </span>
      </motion.div>
      <p className="mt-2 font-ui text-[9px] md:text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
        {label}
      </p>
    </motion.div>
  );
};

export default NumberReveal;
