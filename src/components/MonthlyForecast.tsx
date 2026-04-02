import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { type NumerologyProfile, getNumberCategory, getCategoryColor } from "@/lib/numerology";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const monthThemes: Record<number, string> = {
  1: "New beginnings",
  2: "Partnerships",
  3: "Creative expression",
  4: "Building foundations",
  5: "Change & freedom",
  6: "Home & family",
  7: "Reflection & wisdom",
  8: "Power & abundance",
  9: "Completion & release",
  11: "Spiritual awakening",
  22: "Manifesting vision",
  33: "Master healing",
};

interface MonthlyForecastProps {
  profile: NumerologyProfile;
}

const MonthlyForecast = ({ profile }: MonthlyForecastProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const currentMonth = new Date().getMonth();

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="relative bg-card-gradient rounded-xl border border-border/50 p-5 md:p-8 overflow-hidden"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="h-px w-12 bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto mb-3 origin-center"
        />
        <h2 className="font-display text-xl md:text-2xl text-gradient-gold mb-1">
          {new Date().getFullYear()} Monthly Energy Map
        </h2>
        <p className="font-ui text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          Your personal vibration each month
        </p>
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2.5">
        {profile.personalMonths.map((num, i) => {
          const cat = getNumberCategory(num);
          const color = getCategoryColor(cat);
          const isCurrent = i === currentMonth;
          const theme = monthThemes[num] || "Transformation";

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.05 }}
              className={`relative rounded-lg p-3 border transition-all duration-300 ${
                isCurrent
                  ? "border-primary/40 bg-primary/5 shadow-gold"
                  : "border-border/20 bg-muted/10 hover:border-border/40"
              }`}
            >
              {isCurrent && (
                <motion.div
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <p className="font-ui text-[9px] tracking-wider uppercase text-muted-foreground mb-1">
                {MONTH_NAMES[i]}
              </p>
              <p className="font-display text-xl font-bold mb-0.5" style={{ color }}>
                {num}
              </p>
              <p className="font-body text-[10px] text-foreground/50 leading-tight">
                {theme}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Current month highlight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.6 }}
        className="mt-5 rounded-lg p-4 border border-primary/20 bg-primary/5"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <motion.div
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <p className="font-ui text-[10px] tracking-[0.15em] uppercase text-primary">
            This Month's Focus
          </p>
        </div>
        <p className="font-body text-sm text-foreground/70 leading-relaxed">
          Your Personal Month {profile.personalMonths[currentMonth]} brings the energy of{" "}
          <span className="text-primary font-medium">
            {monthThemes[profile.personalMonths[currentMonth]]?.toLowerCase() || "transformation"}
          </span>
          . Align your actions with this vibration for maximum flow and synchronicity.
        </p>
      </motion.div>
    </motion.section>
  );
};

export default MonthlyForecast;
