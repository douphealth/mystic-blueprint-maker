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
          <motion.div
            className="w-24 h-24 mx-auto border-2 border-gold/50 rounded-full mb-6"
            animate={{ rotate: 360, borderColor: ["hsl(43,72%,55%)", "hsl(270,40%,50%)", "hsl(43,72%,55%)"] }}
            transition={{ rotate: { duration: 3, repeat: Infinity, ease: "linear" }, borderColor: { duration: 2, repeat: Infinity } }}
          />
          <p className="font-display text-xl text-gold animate-pulse-gold tracking-widest">
            Reading the Stars...
          </p>
          <p className="font-body text-muted-foreground mt-2">Calculating your numerology blueprint</p>
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
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <p className="font-ui text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">The Numerology Blueprint of</p>
            <h1 className="font-display text-4xl md:text-5xl text-gradient-gold mb-4">{userName}</h1>
          </motion.div>

          {/* Number overview */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-16">
            <NumberReveal number={profile.lifePath} label="Life Path" delay={0.1} />
            <NumberReveal number={profile.expression} label="Destiny" delay={0.2} />
            <NumberReveal number={profile.soulUrge} label="Soul Urge" delay={0.3} />
            <NumberReveal number={profile.personality} label="Personality" delay={0.4} />
            <NumberReveal number={profile.birthday} label="Birthday" delay={0.5} />
            <NumberReveal number={profile.personalYear} label={`${new Date().getFullYear()}`} delay={0.6} />
          </div>

          {/* Sections */}
          <div className="space-y-8">
            <NumerologySection icon="🌟" number={profile.lifePath} interpretation={lp} index={0} />
            <NumerologySection icon="🔢" number={profile.expression} interpretation={ex} index={1} />
            <NumerologySection icon="💜" number={profile.soulUrge} interpretation={su} index={2} />
            <NumerologySection icon="🎭" number={profile.personality} interpretation={pe} index={3} />

            {/* Birthday section (simpler) */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card-gradient rounded-xl border border-border/50 p-6 md:p-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎂</span>
                <h2 className="font-display text-xl md:text-2xl text-foreground">Birthday Number {profile.birthday}</h2>
              </div>
              <p className="font-body text-base md:text-lg text-foreground/85 leading-relaxed">{bd}</p>
            </motion.section>

            <NumerologySection icon="📅" number={profile.personalYear} interpretation={py} index={5} />
          </div>

          {/* Constellation Chart */}
          <div className="my-16">
            <ConstellationChart profile={profile} name={userName} />
          </div>

          {/* Summary Dashboard */}
          <div className="mb-16">
            <SummaryDashboard profile={profile} name={userName} />
          </div>

          {/* Premium Paywall */}
          <PremiumPaywall />

          {/* Footer */}
          <div className="text-center mt-16 pt-8 border-t border-border/30">
            <p className="font-display text-sm text-gold/60 tracking-widest">MYSTICALDIGITS.COM</p>
            <p className="font-ui text-xs text-muted-foreground mt-1">© {new Date().getFullYear()} MysticalDigits · Your Numerology Blueprint</p>
          </div>
        </div>
      </div>
    );
  }

  // Landing page
  return (
    <div className="min-h-screen bg-background starfield flex flex-col items-center justify-center px-4">
      <div className="relative z-10 text-center max-w-2xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="font-ui text-xs tracking-[0.4em] uppercase text-gold/60 mb-4"
        >
          MysticalDigits.com
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-5xl md:text-7xl text-gradient-gold mb-4 leading-tight"
        >
          Discover Your Numerology Blueprint
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-body text-xl md:text-2xl text-foreground/60 mb-12 leading-relaxed"
        >
          Enter your birth name and date of birth to unlock a deeply personalized reading
          of your life's purpose, hidden talents, and cosmic destiny.
        </motion.p>
        <InputForm onSubmit={handleSubmit} />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.5 }}
          className="font-ui text-xs text-muted-foreground mt-8"
        >
          ✨ Free detailed reading · No account required · 6 core numbers revealed
        </motion.p>
      </div>
    </div>
  );
};

export default Index;
