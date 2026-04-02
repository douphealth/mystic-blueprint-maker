import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GuidedIntake from "@/components/GuidedIntake";
import EmailGate from "@/components/EmailGate";
import NumberReveal from "@/components/NumberReveal";
import NumerologySection from "@/components/NumerologySection";
import ConstellationChart from "@/components/ConstellationChart";
import SummaryDashboard from "@/components/SummaryDashboard";
import MonthlyForecast from "@/components/MonthlyForecast";
import CoreInsights from "@/components/CoreInsights";
import EnergyProfile from "@/components/EnergyProfile";
import FreePdfButton from "@/components/FreePdfButton";
import PremiumPaywall from "@/components/PremiumPaywall";
import FloatingParticles from "@/components/FloatingParticles";
import { calculateFullProfile, type NumerologyProfile } from "@/lib/numerology";
import { getInterpretation, birthdayInterpretations } from "@/lib/interpretations";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Phase = "landing" | "email-gate" | "calculating" | "revealing" | "results";

const loadingSteps = [
  "Mapping your birth numbers…",
  "Decoding your name vibration…",
  "Aligning cosmic frequencies…",
  "Weaving your energy signature…",
  "Revealing your blueprint…",
];

const Index = () => {
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [userName, setUserName] = useState("");
  const [phase, setPhase] = useState<Phase>("landing");
  const [loadingStep, setLoadingStep] = useState(0);

  const handleSubmit = (name: string, dob: Date) => {
    setPhase("calculating");
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((s) => {
        if (s >= loadingSteps.length - 1) { clearInterval(stepInterval); return s; }
        return s + 1;
      });
    }, 700);

    setTimeout(() => {
      clearInterval(stepInterval);
      setProfile(calculateFullProfile(name, dob));
      setUserName(name);
      setPhase("revealing");
      setTimeout(() => setPhase("results"), 1200);
    }, 3800);
  };

  // ── Calculating ──
  if (phase === "calculating") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <FloatingParticles />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center relative z-10">
          <div className="relative w-32 h-32 mx-auto mb-10">
            <motion.div
              className="absolute inset-0 rounded-full border border-primary/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <motion.div
                  key={deg}
                  className="absolute w-2 h-2 rounded-full bg-primary/60"
                  style={{ left: "50%", top: 0, marginLeft: -4, marginTop: -4, transformOrigin: "4px 64px", transform: `rotate(${deg}deg)` }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
                  transition={{ duration: 1.5, delay: deg / 360, repeat: Infinity }}
                />
              ))}
            </motion.div>
            <motion.div className="absolute inset-4 rounded-full border border-accent/25" style={{ borderStyle: "dashed" }} animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
            <motion.div className="absolute inset-8 rounded-full border border-primary/40" animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} />
            <motion.div className="absolute inset-12 rounded-full border border-mystic-teal/20" animate={{ rotate: -360 }} transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }} style={{ borderStyle: "dotted" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-5 h-5 rounded-full bg-primary"
                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6], boxShadow: ["0 0 10px hsl(var(--gold) / 0.3)", "0 0 40px hsl(var(--gold) / 0.7)", "0 0 10px hsl(var(--gold) / 0.3)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border border-primary/20"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 2], opacity: [0.5, 0] }}
                transition={{ duration: 2.5, delay: i * 0.8, repeat: Infinity, ease: "easeOut" }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.p key={loadingStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="font-display text-base text-primary tracking-[0.2em] uppercase">
              {loadingSteps[loadingStep]}
            </motion.p>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-5">
            {loadingSteps.map((_, i) => (
              <motion.div key={i} className="w-1.5 h-1.5 rounded-full" animate={{ backgroundColor: i <= loadingStep ? "hsl(var(--gold))" : "hsl(var(--muted))", scale: i === loadingStep ? 1.4 : 1 }} transition={{ duration: 0.3 }} />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Reveal transition ──
  if (phase === "revealing") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <FloatingParticles />
        <motion.div className="text-center relative z-10">
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }} transition={{ duration: 0.8 }} className="mb-6">
            <div className="w-24 h-24 mx-auto rounded-full border-2 border-primary flex items-center justify-center shadow-gold">
              <span className="font-display text-4xl text-primary font-bold">{profile?.lifePath}</span>
            </div>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="font-display text-2xl text-gradient-gold">{userName}'s Blueprint</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.6 }} className="font-ui text-xs text-muted-foreground mt-2 tracking-wider">Your numbers have been revealed</motion.p>
        </motion.div>
      </div>
    );
  }

  // ── Results ──
  if (phase === "results" && profile) {
    const lp = getInterpretation("lifePath", profile.lifePath)!;
    const ex = getInterpretation("expression", profile.expression)!;
    const su = getInterpretation("soulUrge", profile.soulUrge)!;
    const pe = getInterpretation("personality", profile.personality)!;
    const py = getInterpretation("personalYear", profile.personalYear)!;
    const bdText = birthdayInterpretations[profile.birthday] || birthdayInterpretations[1];
    const bd = { title: `Day ${profile.birthday}`, keywords: ["Birthday Energy", "Natural Gift", "Special Talent"], shortDesc: bdText.split('.')[0] + '.', fullText: bdText };

    return (
      <div className="min-h-screen bg-background">
        <FloatingParticles />
        <div className="relative z-10 max-w-3xl mx-auto px-5 py-10 md:py-16">
          {/* Header */}
          <motion.header className="text-center mb-10">
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.2 }} className="h-px w-20 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mb-4 origin-center" />
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="font-ui text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
              The Numerology Blueprint of
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
              className="font-display text-3xl md:text-5xl text-gradient-gold leading-tight shimmer-text"
            >
              {userName}
            </motion.h1>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.5 }} className="h-px w-20 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mt-4 origin-center" />
          </motion.header>

          {/* Comprehensive Free Reading badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8"
          >
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 font-ui text-[10px] tracking-wider uppercase text-primary">
              ✦ Complete Free Reading — All 6 Core Numbers + Insights
            </span>
          </motion.div>

          {/* All 6 numbers — UNLOCKED */}
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-4 mb-14">
            <NumberReveal number={profile.lifePath} label="Life Path" delay={0.1} />
            <NumberReveal number={profile.expression} label="Destiny" delay={0.2} />
            <NumberReveal number={profile.soulUrge} label="Soul Urge" delay={0.3} />
            <NumberReveal number={profile.personality} label="Persona" delay={0.4} />
            <NumberReveal number={profile.birthday} label="Birthday" delay={0.5} />
            <NumberReveal number={profile.personalYear} label={`${new Date().getFullYear()}`} delay={0.6} />
          </div>

          {/* ALL 6 Core Number Interpretations */}
          <div className="space-y-6">
            <NumerologySection icon="✦" number={profile.lifePath} interpretation={lp} index={0} />
            <NumerologySection icon="◆" number={profile.expression} interpretation={ex} index={1} />
            <NumerologySection icon="♡" number={profile.soulUrge} interpretation={su} index={2} />
            <NumerologySection icon="◈" number={profile.personality} interpretation={pe} index={3} />
            <NumerologySection icon="❋" number={profile.birthday} interpretation={bd} index={4} />
            <NumerologySection icon="☽" number={profile.personalYear} interpretation={py} index={5} />
          </div>

          {/* Energy Signature */}
          <div className="my-10">
            <EnergyProfile profile={profile} name={userName} />
          </div>

          {/* Constellation (free) */}
          <div className="my-10">
            <ConstellationChart profile={profile} name={userName} />
          </div>

          {/* Summary (free) */}
          <div className="mb-10">
            <SummaryDashboard profile={profile} name={userName} />
          </div>

          {/* Hidden Passion + Karmic Debt */}
          <div className="mb-10">
            <CoreInsights profile={profile} name={userName} />
          </div>

          {/* Monthly Forecast */}
          <div className="mb-10">
            <MonthlyForecast profile={profile} />
          </div>

          {/* Free PDF Download */}
          <div className="mb-14">
            <FreePdfButton profile={profile} name={userName} />
          </div>

          {/* ── PREMIUM UPSELL ── */}
          <PremiumPaywall />

          {/* Footer */}
          <footer className="text-center mt-14 pt-6 border-t border-border/20">
            <p className="font-display text-xs text-primary/50 tracking-[0.3em]">MYSTICALDIGITS.COM</p>
            <p className="font-ui text-[10px] text-muted-foreground mt-1">
              © {new Date().getFullYear()} MysticalDigits — All rights reserved
            </p>
          </footer>
        </div>
      </div>
    );
  }

  // ── Landing ──
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      <FloatingParticles />
      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Ambient rings */}
        <div className="absolute inset-0 -top-32 flex items-center justify-center pointer-events-none">
          <motion.div className="w-80 h-80 rounded-full border border-primary/8" animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }}>
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <motion.div key={deg} className="absolute w-1 h-1 rounded-full bg-primary/20" style={{ left: "50%", top: 0, transformOrigin: "0px 160px", transform: `rotate(${deg}deg)` }} animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 3, delay: deg / 200, repeat: Infinity }} />
            ))}
          </motion.div>
          <motion.div className="absolute w-56 h-56 rounded-full border border-accent/8" animate={{ rotate: -360 }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }} />
          <motion.div className="absolute w-36 h-36 rounded-full border border-primary/12" animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} style={{ borderStyle: "dashed" }} />
        </div>

        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="font-ui text-[10px] tracking-[0.5em] uppercase text-primary/50 mb-6">
          MysticalDigits
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="font-display text-3xl md:text-5xl text-gradient-gold mb-4 leading-[1.1] shimmer-text"
        >
          Discover Your Personal Blueprint
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="font-body text-lg md:text-xl text-foreground/50 mb-10 leading-relaxed"
        >
          Uncover all 6 core numbers — Life Path, Destiny, Soul Urge,
          Personality, Birthday & Personal Year — in a free, personalized reading.
        </motion.p>

        <GuidedIntake onComplete={handleSubmit} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 space-y-1"
        >
          <p className="font-ui text-[10px] text-muted-foreground tracking-wider">
            Free · No account required · All 6 numbers + PDF download
          </p>
          <p className="font-ui text-[9px] text-muted-foreground/50 tracking-wider">
            Trusted by 12,000+ people worldwide
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
