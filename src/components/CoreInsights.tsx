import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { type NumerologyProfile, getNumberCategory, getCategoryColor } from "@/lib/numerology";

interface CoreInsightsProps {
  profile: NumerologyProfile;
  name: string;
}

const karmicLessons: Record<number, { title: string; message: string }> = {
  13: { title: "Karmic Debt 13 — Discipline", message: "Past-life laziness or shortcuts now manifest as repeated obstacles until you learn focused, honest work. Embrace discipline as liberation." },
  14: { title: "Karmic Debt 14 — Moderation", message: "Past-life excess demands you learn healthy boundaries. Freedom comes through responsibility, not indulgence. Master self-control to unlock your true power." },
  16: { title: "Karmic Debt 16 — Ego Dissolution", message: "The universe periodically dismantles what you've built so you can rebuild with greater wisdom. Surrender ego attachment — your true self is indestructible." },
  19: { title: "Karmic Debt 19 — Self-Reliance", message: "Past-life misuse of power means you must learn to lead with compassion. Independence is earned through serving others, not dominating them." },
};

const passionDescriptions: Record<number, string> = {
  1: "You're naturally driven to lead and create — independence and originality fuel your fire.",
  2: "Connection and harmony are your deepest motivators — you thrive through meaningful partnerships.",
  3: "Creative expression is your lifeblood — communication and artistic vision drive everything you do.",
  4: "Building something enduring gives you purpose — structure and reliability are your superpowers.",
  5: "You're wired for adventure and transformation — variety and freedom keep your spirit alive.",
  6: "Nurturing and creating beauty is your calling — love and responsibility give your life meaning.",
  7: "The pursuit of deep truth captivates you — wisdom and inner knowing are your greatest treasures.",
  8: "Achievement and mastery call to you — you're driven to manifest abundance and wield influence wisely.",
  9: "You're moved by compassion and universal truths — serving the greater good fulfills your soul.",
};

const CoreInsights = ({ profile, name }: CoreInsightsProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const firstName = name.split(" ")[0];

  return (
    <div ref={ref} className="space-y-5">
      {/* Hidden Passion */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative bg-card-gradient rounded-xl border border-border/50 p-5 md:p-8 overflow-hidden"
      >
        <motion.div
          className="absolute -top-16 -left-16 w-40 h-40 rounded-full"
          style={{ background: "radial-gradient(circle, hsl(43 72% 55% / 0.06), transparent 70%)" }}
          animate={isInView ? { scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] } : {}}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <motion.span
              className="text-lg"
              animate={isInView ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 4, repeat: Infinity }}
            >
              🔥
            </motion.span>
            <div>
              <h2 className="font-display text-lg md:text-xl text-foreground">
                Hidden Passion
              </h2>
              <p className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground">
                The dominant vibration in your name
              </p>
            </div>
            <div className="ml-auto flex gap-1.5">
              {profile.hiddenPassion.map((hp) => {
                const color = getCategoryColor(getNumberCategory(hp));
                return (
                  <motion.span
                    key={hp}
                    className="font-display text-2xl font-bold"
                    style={{ color }}
                    animate={isInView ? { textShadow: [`0 0 10px ${color}00`, `0 0 20px ${color}60`, `0 0 10px ${color}00`] } : {}}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {hp}
                  </motion.span>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            {profile.hiddenPassion.map((hp) => (
              <motion.div
                key={hp}
                initial={{ opacity: 0, x: -15 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 }}
                className="rounded-lg p-4 border border-border/20 bg-muted/10"
              >
                <p className="font-body text-sm text-foreground/75 leading-relaxed">
                  {firstName}, your most frequently occurring number is{" "}
                  <span className="text-primary font-semibold">{hp}</span>.{" "}
                  {passionDescriptions[hp] || passionDescriptions[1]}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Karmic Debt */}
      {profile.karmicDebt.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative bg-card-gradient rounded-xl border border-border/50 p-5 md:p-8 overflow-hidden"
        >
          <motion.div
            className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full"
            style={{ background: "radial-gradient(circle, hsl(270 40% 30% / 0.08), transparent 70%)" }}
            animate={isInView ? { scale: [0.9, 1.3, 0.9] } : {}}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <motion.span
                className="text-lg"
                animate={isInView ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 3, repeat: Infinity }}
              >
                ⚡
              </motion.span>
              <div>
                <h2 className="font-display text-lg md:text-xl text-foreground">
                  Karmic Lessons
                </h2>
                <p className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground">
                  Soul patterns seeking resolution
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {profile.karmicDebt.map((debt, i) => {
                const lesson = karmicLessons[debt];
                if (!lesson) return null;
                return (
                  <motion.div
                    key={debt}
                    initial={{ opacity: 0, x: -15 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.15 }}
                    className="rounded-lg p-4 border border-accent/20 bg-accent/5"
                  >
                    <h3 className="font-display text-sm text-foreground mb-1.5">
                      {lesson.title}
                    </h3>
                    <p className="font-body text-sm text-foreground/65 leading-relaxed">
                      {lesson.message}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default CoreInsights;
