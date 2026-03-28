import { useState } from "react";
import { motion } from "framer-motion";
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
          <div className="relative w-20 h-20 mx-auto mb-8">
            <motion.div
              className="absolute inset-0 border border-gold/40 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 border border-accent/40 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-4 border border-gold/60 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-2 h-2 rounded-full bg-gold" />
            </motion.div>
          </div>
          <p className="font-display text-lg text-gold animate-pulse-gold tracking-[0.3em] uppercase">
            Reading the Stars
          </p>
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
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <p className="font-ui text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
              The Numerology Blueprint of
            </p>
            <h1 className="font-display text-3xl md:text-5xl text-gradient-gold leading-tight">{userName}</h1>
          </motion.header>

          {/* Number grid */}
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-4 mb-14">
            <NumberReveal number={profile.lifePath} label="Life Path" delay={0.1} />
            <NumberReveal number={profile.expression} label="Destiny" delay={0.15} />
            <NumberReveal number={profile.soulUrge} label="Soul Urge" delay={0.2} />
            <NumberReveal number={profile.personality} label="Persona" delay={0.25} />
            <NumberReveal number={profile.birthday} label="Birthday" delay={0.3} />
            <NumberReveal number={profile.personalYear} label={`${new Date().getFullYear()}`} delay={0.35} />
          </div>

          {/* Sections */}
          <div className="space-y-6">
            <NumerologySection icon="✦" number={profile.lifePath} interpretation={lp} index={0} />
            <NumerologySection icon="◆" number={profile.expression} interpretation={ex} index={1} />
            <NumerologySection icon="♡" number={profile.soulUrge} interpretation={su} index={2} />
            <NumerologySection icon="◈" number={profile.personality} interpretation={pe} index={3} />

            {/* Birthday — compact */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card-gradient rounded-xl border border-border/50 p-5 md:p-8"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="font-display text-gold text-lg">❋</span>
                <h2 className="font-display text-lg md:text-xl text-foreground">
                  Birthday Number <span className="text-gold">{profile.birthday}</span>
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
            <p className="font-display text-xs text-gold/50 tracking-[0.3em]">MYSTICALDIGITS.COM</p>
            <p className="font-ui text-[10px] text-muted-foreground mt-1">
              © {new Date().getFullYear()} MysticalDigits · Your Numerology Blueprint
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
        {/* Subtle ornament */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 -top-20 flex items-center justify-center pointer-events-none"
        >
          <div className="w-80 h-80 rounded-full border border-gold/20 animate-spin-slow" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="font-ui text-[10px] tracking-[0.5em] uppercase text-gold/50 mb-6"
        >
          MysticalDigits
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-4xl md:text-6xl text-gradient-gold mb-5 leading-[1.1]"
        >
          Your Numerology Blueprint
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
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
