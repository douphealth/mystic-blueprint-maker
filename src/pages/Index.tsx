import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GuidedIntake from "@/components/GuidedIntake";
import NumberReveal from "@/components/NumberReveal";
import NumerologySection from "@/components/NumerologySection";
import ConstellationChart from "@/components/ConstellationChart";
import SummaryDashboard from "@/components/SummaryDashboard";
import PremiumPaywall from "@/components/PremiumPaywall";
import FloatingParticles from "@/components/FloatingParticles";
import { calculateFullProfile, type NumerologyProfile } from "@/lib/numerology";
import { getInterpretation, birthdayInterpretations } from "@/lib/interpretations";

type Phase = "landing" | "calculating" | "revealing" | "results";

const loadingSteps = [
  "Mapping your birth numbers…",
  "Decoding your name vibration…",
  "Aligning cosmic frequencies…",
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
    }, 3000);
  };

  // ── Calculating ──
  if (phase === "calculating") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <FloatingParticles />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center relative z-10">
          <div className="relative w-28 h-28 mx-auto mb-10">
            <motion.div
              className="absolute inset-0 rounded-full border border-primary/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <motion.div
                  key={deg}
                  className="absolute w-1.5 h-1.5 rounded-full bg-primary/60"
                  style={{ left: "50%", top: 0, marginLeft: -3, marginTop: -3, transformOrigin: "3px 56px", transform: `rotate(${deg}deg)` }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, delay: deg / 360, repeat: Infinity }}
                />
              ))}
            </motion.div>
            <motion.div className="absolute inset-4 rounded-full border border-accent/25" style={{ borderStyle: "dashed" }} animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
            <motion.div className="absolute inset-8 rounded-full border border-primary/40" animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-4 h-4 rounded-full bg-primary"
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6], boxShadow: ["0 0 10px hsl(var(--gold) / 0.3)", "0 0 30px hsl(var(--gold) / 0.6)", "0 0 10px hsl(var(--gold) / 0.3)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border border-primary/20"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.8], opacity: [0.4, 0] }}
                transition={{ duration: 2.5, delay: i * 0.8, repeat: Infinity, ease: "easeOut" }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.p key={loadingStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="font-display text-base text-primary tracking-[0.2em] uppercase">
              {loadingSteps[loadingStep]}
            </motion.p>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-4">
            {loadingSteps.map((_, i) => (
              <motion.div key={i} className="w-1.5 h-1.5 rounded-full" animate={{ backgroundColor: i <= loadingStep ? "hsl(var(--gold))" : "hsl(var(--muted))", scale: i === loadingStep ? 1.3 : 1 }} transition={{ duration: 0.3 }} />
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
            <div className="w-20 h-20 mx-auto rounded-full border-2 border-primary flex items-center justify-center shadow-gold">
              <span className="font-display text-3xl text-primary font-bold">{profile?.lifePath}</span>
            </div>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="font-display text-xl text-gradient-gold">{userName}'s Blueprint</motion.p>
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
    const bd = birthdayInterpretations[profile.birthday] || birthdayInterpretations[1];
    const firstName = userName.split(" ")[0];

    return (
      <div className="min-h-screen bg-background">
        <FloatingParticles />
        <div className="relative z-10 max-w-3xl mx-auto px-5 py-10 md:py-16">
          {/* Header */}
          <motion.header className="text-center mb-10">
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.2 }} className="h-px w-16 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mb-4 origin-center" />
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
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.5 }} className="h-px w-16 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mt-4 origin-center" />
          </motion.header>

          {/* Free reading badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 font-ui text-[10px] tracking-wider uppercase text-primary">
              ✦ Free Reading — 3 Core Numbers
            </span>
          </motion.div>

          {/* Number grid */}
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-4 mb-14">
            <NumberReveal number={profile.lifePath} label="Life Path" delay={0.1} />
            <NumberReveal number={profile.expression} label="Destiny" delay={0.2} />
            <NumberReveal number={profile.soulUrge} label="Soul Urge" delay={0.3} />
            <NumberReveal number={profile.personality} label="Persona" delay={0.4} locked />
            <NumberReveal number={profile.birthday} label="Birthday" delay={0.5} locked />
            <NumberReveal number={profile.personalYear} label={`${new Date().getFullYear()}`} delay={0.6} locked />
          </div>

          {/* FREE: 3 Core Number Sections */}
          <div className="space-y-6">
            <NumerologySection icon="✦" number={profile.lifePath} interpretation={lp} index={0} />
            <NumerologySection icon="◆" number={profile.expression} interpretation={ex} index={1} />
            <NumerologySection icon="♡" number={profile.soulUrge} interpretation={su} index={2} />
          </div>

          {/* Constellation (free) */}
          <div className="my-14">
            <ConstellationChart profile={profile} name={userName} />
          </div>

          {/* Summary (free) */}
          <div className="mb-14">
            <SummaryDashboard profile={profile} name={userName} />
          </div>

          {/* ── LOCKED PREMIUM SECTIONS ── */}
          <div className="space-y-4 mb-10">
            {[
              { icon: "◈", label: "Personality", title: pe.title, number: profile.personality },
              { icon: "❋", label: "Birthday Number", title: `Day ${profile.birthday}`, number: profile.birthday },
              { icon: "☽", label: `${new Date().getFullYear()} Forecast`, title: py.title, number: profile.personalYear },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-card-gradient rounded-xl border border-border/30 p-5 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-primary/60">{item.icon}</span>
                    <div>
                      <h3 className="font-display text-base text-foreground">{item.label} <span className="text-primary">{item.number}</span></h3>
                      <p className="font-body text-sm text-muted-foreground">{item.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-ui text-[9px] tracking-wider uppercase text-primary/50 border border-primary/20 rounded-full px-2 py-0.5">Premium</span>
                  </div>
                </div>
                {/* Blurred teaser */}
                <div className="mt-3 filter blur-[6px] opacity-30 pointer-events-none select-none">
                  <p className="font-body text-sm text-foreground/60 leading-relaxed">
                    Your {item.label.toLowerCase()} reveals deep patterns that shape how you interact with the world. This number carries powerful vibrations that influence your relationships, career path, and personal growth trajectory…
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Premium Paywall */}
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
          Uncover your Life Path, Destiny, and Soul Urge numbers — 
          a free personalized reading in under 2 minutes.
        </motion.p>

        <GuidedIntake onComplete={handleSubmit} />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ delay: 1.5 }}
          className="font-ui text-[10px] text-muted-foreground mt-8 tracking-wider"
        >
          Free · No account required · 3 core numbers revealed
        </motion.p>
      </div>
    </div>
  );
};

export default Index;
