import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InputForm from "@/components/InputForm";
import NumberReveal from "@/components/NumberReveal";
import NumerologySection from "@/components/NumerologySection";
import ConstellationChart from "@/components/ConstellationChart";
import SummaryDashboard from "@/components/SummaryDashboard";
import PremiumPaywall from "@/components/PremiumPaywall";
import { calculateFullProfile, type NumerologyProfile } from "@/lib/numerology";
import { getInterpretation, birthdayInterpretations } from "@/lib/interpretations";

const Index = () => {
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [userName, setUserName] = useState("");
  const [calculating, setCalculating] = useState(false);

  const handleSubmit = (name: string, dob: Date) => {
    setCalculating(true);
    setTimeout(() => {
      setProfile(calculateFullProfile(name, dob));
      setUserName(name);
      setCalculating(false);
    }, 2500);
  };

  if (calculating) {
    return (
      <div className="min-h-screen bg-background starfield flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center relative z-10"
        >
          <div className="relative w-24 h-24 mx-auto mb-8">
            {/* Orbiting rings */}
            <motion.div
              className="absolute inset-0 border border-primary/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-3 border border-accent/30 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-6 border border-primary/50 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            {/* Orbiting dots */}
            {[0, 120, 240].map((offset) => (
              <motion.div
                key={offset}
                className="absolute w-1.5 h-1.5 rounded-full bg-primary"
                style={{ top: "50%", left: "50%", marginTop: -3, marginLeft: -3 }}
                animate={{
                  x: [
                    Math.cos((offset * Math.PI) / 180) * 40,
                    Math.cos(((offset + 360) * Math.PI) / 180) * 40,
                  ],
                  y: [
                    Math.sin((offset * Math.PI) / 180) * 40,
                    Math.sin(((offset + 360) * Math.PI) / 180) * 40,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            ))}
            {/* Center glow */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-3 h-3 rounded-full bg-primary shadow-gold" />
            </motion.div>
          </div>
          <motion.p
            className="font-display text-lg text-primary animate-pulse-gold tracking-[0.3em] uppercase"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Reading the Stars
          </motion.p>
          <p className="font-ui text-xs text-muted-foreground mt-3 tracking-wider">
            Calculating your numerology blueprint
          </p>
        </motion.div>
      </div>
    );
  }

  if (profile) {
    const lp = getInterpretation("lifePath", profile.lifePath)!;
    const ex = getInterpretation("expression", profile.expression)!;
    const su = getInterpretation("soulUrge", profile.soulUrge)!;
    const pe = getInterpretation("personality", profile.personality)!;
    const py = getInterpretation("personalYear", profile.personalYear)!;
    const bd = birthdayInterpretations[profile.birthday] || birthdayInterpretations[1];

    return (
      <div className="min-h-screen bg-background starfield">
        <div className="relative z-10 max-w-3xl mx-auto px-5 py-10 md:py-16">
          {/* Header with animated reveal */}
          <motion.header className="text-center mb-10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "4rem" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-px bg-primary/40 mx-auto mb-4"
            />
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.4em" }}
              transition={{ duration: 1 }}
              className="font-ui text-[10px] uppercase text-muted-foreground mb-3"
            >
              The Numerology Blueprint of
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
              className="font-display text-3xl md:text-5xl text-gradient-gold leading-tight"
            >
              {userName}
            </motion.h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "4rem" }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-px bg-primary/40 mx-auto mt-4"
            />
          </motion.header>

          {/* Number grid */}
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-4 mb-14">
            <NumberReveal number={profile.lifePath} label="Life Path" delay={0.1} />
            <NumberReveal number={profile.expression} label="Destiny" delay={0.2} />
            <NumberReveal number={profile.soulUrge} label="Soul Urge" delay={0.3} />
            <NumberReveal number={profile.personality} label="Persona" delay={0.4} />
            <NumberReveal number={profile.birthday} label="Birthday" delay={0.5} />
            <NumberReveal number={profile.personalYear} label={`${new Date().getFullYear()}`} delay={0.6} />
          </div>

          {/* Sections */}
          <div className="space-y-6">
            <NumerologySection icon="✦" number={profile.lifePath} interpretation={lp} index={0} />
            <NumerologySection icon="◆" number={profile.expression} interpretation={ex} index={1} />
            <NumerologySection icon="♡" number={profile.soulUrge} interpretation={su} index={2} />
            <NumerologySection icon="◈" number={profile.personality} interpretation={pe} index={3} />

            {/* Birthday — compact with animation */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card-gradient rounded-xl border border-border/50 p-5 md:p-8 relative overflow-hidden"
            >
              <motion.div
                className="absolute top-0 left-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
              />
              <div className="flex items-center gap-3 mb-3">
                <motion.span
                  className="font-display text-primary text-lg"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  ❋
                </motion.span>
                <h2 className="font-display text-lg md:text-xl text-foreground">
                  Birthday Number <span className="text-primary">{profile.birthday}</span>
                </h2>
              </div>
              <p className="font-body text-base md:text-lg text-foreground/80 leading-relaxed">{bd}</p>
            </motion.section>

            <NumerologySection icon="☽" number={profile.personalYear} interpretation={py} index={5} />
          </div>

          {/* Constellation */}
          <div className="my-14">
            <ConstellationChart profile={profile} name={userName} />
          </div>

          {/* Summary */}
          <div className="mb-14">
            <SummaryDashboard profile={profile} name={userName} />
          </div>

          {/* Premium */}
          <PremiumPaywall />

          {/* Footer */}
          <footer className="text-center mt-14 pt-6 border-t border-border/20">
            <p className="font-display text-xs text-primary/50 tracking-[0.3em]">MYSTICALDIGITS.COM</p>
            <p className="font-ui text-[10px] text-muted-foreground mt-1">
              © {new Date().getFullYear()} MysticalDigits
            </p>
          </footer>
        </div>
      </div>
    );
  }

  // Landing
  return (
    <div className="min-h-screen bg-background starfield flex flex-col items-center justify-center px-5">
      <div className="relative z-10 text-center max-w-lg">
        {/* Animated sacred geometry background */}
        <div className="absolute inset-0 -top-32 flex items-center justify-center pointer-events-none">
          <motion.div
            className="w-72 h-72 rounded-full border border-primary/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute w-56 h-56 rounded-full border border-accent/10"
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute w-40 h-40 rounded-full border border-primary/15"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ borderStyle: "dashed" }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="font-ui text-[10px] tracking-[0.5em] uppercase text-primary/50 mb-6"
        >
          MysticalDigits
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 80 }}
          className="font-display text-4xl md:text-6xl text-gradient-gold mb-5 leading-[1.1]"
        >
          Your Numerology Blueprint
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="font-body text-lg md:text-xl text-foreground/50 mb-10 leading-relaxed"
        >
          Unlock your life's purpose, hidden talents, and cosmic destiny
          through the ancient wisdom of numbers.
        </motion.p>
        <InputForm onSubmit={handleSubmit} />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ delay: 1.5 }}
          className="font-ui text-[10px] text-muted-foreground mt-8 tracking-wider"
        >
          Free · No account required · 6 core numbers revealed
        </motion.p>
      </div>
    </div>
  );
};

export default Index;
