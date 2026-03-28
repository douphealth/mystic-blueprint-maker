import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { getNumberCategory, getCategoryColor } from "@/lib/numerology";
import { useEffect, useState } from "react";

interface NumberRevealProps {
  number: number;
  label: string;
  delay?: number;
}

const NumberReveal = ({ number, label, delay = 0 }: NumberRevealProps) => {
  const category = getNumberCategory(number);
  const color = getCategoryColor(category);
  const [displayNum, setDisplayNum] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setRevealed(true);
      // Counting animation
      const duration = 800;
      const steps = 20;
      const interval = duration / steps;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        if (step >= steps) {
          setDisplayNum(number);
          clearInterval(timer);
        } else {
          setDisplayNum(Math.floor(Math.random() * 33) + 1);
        }
      }, interval);
      return () => clearInterval(timer);
    }, delay * 1000 + 300);
    return () => clearTimeout(timeout);
  }, [number, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={revealed ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="flex flex-col items-center"
    >
      <div className="relative group">
        <motion.div
          className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border relative z-10 cursor-pointer"
          style={{
            borderColor: revealed ? `${color}60` : 'transparent',
            boxShadow: revealed ? `0 0 20px ${color}20, inset 0 0 15px ${color}10` : 'none',
          }}
          whileHover={{ scale: 1.1, boxShadow: `0 0 35px ${color}40` }}
          whileTap={{ scale: 0.95 }}
          animate={revealed ? {
            boxShadow: [`0 0 15px ${color}15`, `0 0 30px ${color}35`, `0 0 15px ${color}15`],
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.span
            className="font-display text-2xl md:text-3xl font-bold tabular-nums"
            style={{ color: revealed ? color : 'transparent' }}
            animate={revealed ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: delay }}
          >
            {displayNum}
          </motion.span>
        </motion.div>

        {/* Pulse ring on reveal */}
        {revealed && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ borderColor: color }}
            initial={{ scale: 1, opacity: 0.6, borderWidth: 2 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        )}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={revealed ? { opacity: 1 } : {}}
        transition={{ delay: 0.3 }}
        className="mt-2 font-ui text-[9px] md:text-[10px] tracking-[0.15em] uppercase text-muted-foreground"
      >
        {label}
      </motion.p>
    </motion.div>
  );
};

export default NumberReveal;
