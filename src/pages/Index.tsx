import { useState, useEffect } from "react";
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
import PremiumPdfButton from "@/components/PremiumPdfButton";
import FloatingParticles from "@/components/FloatingParticles";
import { calculateFullProfile, type NumerologyProfile } from "@/lib/numerology";
import { getInterpretationSafe, birthdayInterpretations } from "@/lib/interpretations";
import { saveProfile, saveBuyerEmail, loadBuyerEmail, isPremiumUnlocked, resolveEntitlement } from "@/lib/entitlement";
import { parseIsoDateLocal } from "@/lib/localDate";
import { readHandoff, clearHandoffFromUrl, cleanHandoffDob } from "@/lib/handoff";
import { useAuth } from "@/contexts/AuthContext";
import LegalFooter from "@/components/LegalFooter";
import LandingDetails from "@/components/LandingDetails";
import { FREE_PAGE_COUNT } from "@/lib/editions";
import { RESTORE_SENT_NOTICE } from "@/lib/premiumApi";

type Phase = "landing" | "email-gate" | "calculating" | "revealing" | "results";

const loadingSteps = [
  "Mapping your birth numbers…",
  "Decoding your name vibration…",
  "Aligning cosmic frequencies…",
  "Weaving your energy signature…",
  "Revealing your blueprint…",
];

const Index = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [userName, setUserName] = useState("");
  const [userDob, setUserDob] = useState<Date | null>(null);
  const [phase, setPhase] = useState<Phase>("landing");
  const [loadingStep, setLoadingStep] = useState(0);
  const [intakeNotice, setIntakeNotice] = useState("");
  const [handoffDob, setHandoffDob] = useState("");
  const [restoreNotice, setRestoreNotice] = useState("");
  // A returning visitor's address, so checkout stays prefilled on a later visit.
  const [userEmail, setUserEmail] = useState(() => loadBuyerEmail() ?? "");
  const [autoDownload, setAutoDownload] = useState(false);
  // read once on mount — if this visitor already bought the Premium Edition,
  // the results page should offer the download rather than the paywall again
  const [premiumUnlocked, setPremiumUnlocked] = useState(() => isPremiumUnlocked());

  // re-check when the results screen appears, in case checkout completed in
  // another tab while this one stayed open
  useEffect(() => {
    if (phase === "results") setPremiumUnlocked(isPremiumUnlocked());
  }, [phase]);

  // Auto-advance past email gate if user becomes authenticated
  useEffect(() => {
    if (user && phase === "email-gate" && userName && userDob) {
      startCalculation(userName, userDob);
    }
  }, [user, phase]);

  // Load profile from URL query parameters if present to bypass intake quiz and email gate
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nameParam = params.get("name") || params.get("full_name") || params.get("fullname");
    const dobParam = params.get("dob") || params.get("birth_date") || params.get("birthDate");
    const emailParam = params.get("email");
    const downloadParam = params.get("download");

    // create-payment sends an already-entitled buyer to /?restore=1&email=...
    // instead of a second checkout. Confirm it with the server and unlock.
    // Checkout found an earlier purchase for this address and emailed a
    // one-time unlock link instead of charging twice.
    if (params.get("restore") === "sent") {
      setRestoreNotice(RESTORE_SENT_NOTICE);
    }

    // Older backend: the restore URL carried the email. The current backend
    // no longer unlocks on an email alone (anyone could type one), so this
    // only succeeds against the old server.
    if (params.get("restore") === "1" && emailParam?.includes("@")) {
      setUserEmail(emailParam.trim());
      resolveEntitlement({ email: emailParam }).then((r) => {
        if (r.entitled) setPremiumUnlocked(true);
      });
    }

    // Arriving from the Life Path calculator: the birth date travels in the URL
    // fragment. Fill it in, ask only for the name, and drop it from the URL.
    const handoff = readHandoff();
    // From the free-Blueprint email: name and date are both there and the
    // email was already given, so open the reading itself.
    if (handoff.from === "email" && handoff.name && handoff.dob) {
      clearHandoffFromUrl();
      const emailDob = parseIsoDateLocal(handoff.dob);
      if (emailDob) {
        setUserName(handoff.name);
        setUserDob(emailDob);
        saveProfile(handoff.name, emailDob);
        setProfile(calculateFullProfile(handoff.name, emailDob));
        setPhase("results");
        return;
      }
    }
    if (handoff.dob) {
      clearHandoffFromUrl();
      setHandoffDob(handoff.dob);
      setIntakeNotice("Your birth date from the Life Path calculator is already filled in. Add your full birth name to see all six numbers.");
      return;
    }

    if (!nameParam && !dobParam) return;

    // Decode '+' as spaces
    const decodedName = (nameParam ?? "").replace(/\+/g, " ").trim();
    const decodedDob = (dobParam ?? "").trim();

    // A link with only a birth date (older calculator links used ?dob=): treat
    // it like the fragment handoff rather than as a broken personalised link.
    if (!decodedName && cleanHandoffDob(decodedDob)) {
      setHandoffDob(cleanHandoffDob(decodedDob)!);
      setIntakeNotice("Your birth date is already filled in. Add your full birth name to see all six numbers.");
      return;
    }

    if (emailParam?.trim()) {
      setUserEmail(emailParam.trim());
      saveBuyerEmail(emailParam.trim());
    }
    if (downloadParam === "1") setAutoDownload(true);

    // Read as local midnight, the same way GuidedIntake does — see
    // @/lib/localDate for why a plain new Date(iso) is wrong here.
    const parsedDob = parseIsoDateLocal(decodedDob);

    if (!decodedName || !parsedDob) {
      // The link did not survive the trip — most often an ESP merge tag that
      // failed to substitute, or a birth date emitted in a locale format.
      // Recover instead of dead-ending: keep whatever we could read and ask
      // only for the piece that is missing.
      setUserName(decodedName);
      setIntakeNotice(
        decodedName
          ? "We couldn't read a birth date from your link, so please confirm it below."
          : "That link didn't include everything we need — please enter your details below.",
      );
      setPhase("landing");
      return;
    }

    setUserName(decodedName);
    setUserDob(parsedDob);

    const calculatedProfile = calculateFullProfile(decodedName, parsedDob);
    setProfile(calculatedProfile);
    setPhase("results");
  }, []);

  const handleSubmit = (name: string, dob: Date) => {
    setUserName(name.trim());
    setUserDob(dob);
    if (user) {
      startCalculation(name.trim(), dob);
    } else {
      setPhase("email-gate");
    }
  };

  const handleEmailComplete = (email: string) => {
    // Keep the address the visitor just gave us. Without it the paywall opened
    // Stripe with an empty email field (no prefill), create-payment could not
    // recognise an existing buyer and offer the restore link instead of a
    // second charge, and /payment-success had no address to look up.
    const trimmed = email.trim();
    if (trimmed) {
      setUserEmail(trimmed);
      saveBuyerEmail(trimmed);
    }
    if (userName && userDob) {
      startCalculation(userName, userDob);
    }
  };

  const startCalculation = (name: string, dob: Date) => {
    setPhase("calculating");
    setLoadingStep(0);

    // Remember the identity behind this reading. If the visitor later buys the
    // Premium Edition, /payment-success rebuilds the profile from this rather
    // than asking them to type everything again.
    saveProfile(name, dob);

    const stepInterval = setInterval(() => {
      setLoadingStep((s) => {
        if (s >= loadingSteps.length - 1) { clearInterval(stepInterval); return s; }
        return s + 1;
      });
    }, 700);

    setTimeout(() => {
      clearInterval(stepInterval);
      const calculatedProfile = calculateFullProfile(name, dob);
      setProfile(calculatedProfile);
      setPhase("revealing");
      setTimeout(() => setPhase("results"), 1200);

      // The reading is persisted to localStorage by saveProfile(), which is what
      // the paid flow actually reads back. A server-side copy used to be
      // attempted here against a Supabase table in a project that no longer
      // exists, guarded by `if (user)` — and `user` was never non-null, so the
      // branch could not run. Removed rather than repointed: there is no
      // account system in this product to attach a stored reading to.
    }, 3800);
  };

  // ── Email Gate ──
  if (phase === "email-gate") {
    return (
      <div className="min-h-screen bg-background">
        <FloatingParticles />
        <EmailGate userName={userName} birthDate={userDob} onComplete={handleEmailComplete} />
      </div>
    );
  }

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
    const lp = getInterpretationSafe("lifePath", profile.lifePath);
    const ex = getInterpretationSafe("expression", profile.expression);
    const su = getInterpretationSafe("soulUrge", profile.soulUrge);
    const pe = getInterpretationSafe("personality", profile.personality);
    const py = getInterpretationSafe("personalYear", profile.personalYear);
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
            <FreePdfButton profile={profile} name={userName} autoDownload={autoDownload} />
          </div>

          {/* ── PREMIUM ──
              Returning buyers get the download itself, not the paywall again.
              isPremiumUnlocked() is read on mount so that landing back here
              after checkout shows the artifact instead of a second upsell. */}
          {premiumUnlocked ? (
            <PremiumPdfButton profile={profile} name={userName} />
          ) : (
            <PremiumPaywall email={userEmail} onUnlocked={() => setPremiumUnlocked(true)} />
          )}

          <LegalFooter className="mt-14" />
        </div>
      </div>
    );
  }

  // ── Landing ──
  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-5">
      <FloatingParticles />
      <main className="relative z-10 text-center max-w-lg w-full min-h-[100svh] flex flex-col justify-center py-10">
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

        <p className="font-ui text-[10px] tracking-[0.5em] uppercase text-primary/50 mb-6">
          <a href="https://mysticaldigits.com/" className="hover:text-primary transition-colors">MysticalDigits</a>
        </p>
        {/* The H1 and intro are the largest paint on a phone, so they render
            visible from the first frame (no opacity/blur entrance), which
            keeps LCP from waiting on an animation. */}
        <h1 className="font-display text-3xl md:text-5xl text-gradient-gold mb-4 leading-[1.1]">
          Free Numerology Blueprint
        </h1>
        <p className="font-body text-lg md:text-xl text-foreground/60 mb-10 leading-relaxed">
          Enter your birth name and date to see your Life Path, Destiny, Soul Urge,
          Personality, Birthday and Personal Year numbers, each with a written reading.
        </p>

        {restoreNotice && (
          <p role="status" className="mb-6 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 font-ui text-xs leading-relaxed text-foreground/80">
            {restoreNotice}
          </p>
        )}

        <GuidedIntake onComplete={handleSubmit} initialName={userName} initialDob={handoffDob} notice={intakeNotice} />

        <p className="mt-8 font-ui text-[10px] text-muted-foreground tracking-wider">
          Free · No account · 6 numbers + {FREE_PAGE_COUNT}-page PDF · For reflection and entertainment
        </p>
      </main>

      <LandingDetails />
      <LegalFooter className="relative z-10 w-full max-w-3xl mb-8" />
    </div>
  );
};

export default Index;
