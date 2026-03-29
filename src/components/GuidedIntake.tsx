import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Sparkles } from "lucide-react";

interface GuidedIntakeProps {
  onComplete: (name: string, dob: Date) => void;
}

const GuidedIntake = ({ onComplete }: GuidedIntakeProps) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");

  const totalSteps = 2;
  const progress = ((step + 1) / (totalSteps + 1)) * 100;

  const handleNameSubmit = () => {
    if (!name.trim()) { setError("Please enter your full birth name"); return; }
    setError("");
    setStep(1);
  };

  const handleDobSubmit = () => {
    if (!dob) { setError("Please enter your date of birth"); return; }
    const date = new Date(dob + "T00:00:00");
    if (isNaN(date.getTime())) { setError("Please enter a valid date"); return; }
    setError("");
    onComplete(name.trim(), date);
  };

  return (
    <div className="w-full max-w-md mx-auto px-5">
      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-ui text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            Step {step + 1} of {totalSteps}
          </span>
          <span className="font-ui text-[10px] text-primary/60">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-1 bg-muted/30" />
      </motion.div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mt-10"
          >
            <h2 className="font-display text-2xl md:text-3xl text-foreground text-center mb-2">
              What's your <span className="text-gradient-gold">full birth name</span>?
            </h2>
            <p className="font-body text-base text-muted-foreground text-center mb-8 leading-relaxed">
              The name given at birth — each letter carries a unique vibration that shapes your destiny.
            </p>

            <Input
              type="text"
              placeholder="e.g. Alexander James Smith"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              autoFocus
              className="bg-card/60 border-border/60 text-foreground font-body text-lg placeholder:text-muted-foreground/30 focus:border-primary focus:ring-primary/20 h-14 text-center tracking-wide"
            />
            {error && <p className="text-destructive text-xs font-ui text-center mt-2">{error}</p>}

            <Button
              onClick={handleNameSubmit}
              className="w-full h-13 mt-5 text-sm font-display tracking-[0.15em] uppercase bg-primary text-primary-foreground hover:bg-gold-light border-0 shadow-gold transition-all duration-300 group"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="dob"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mt-10"
          >
            <h2 className="font-display text-2xl md:text-3xl text-foreground text-center mb-2">
              When were you <span className="text-gradient-gold">born</span>?
            </h2>
            <p className="font-body text-base text-muted-foreground text-center mb-8 leading-relaxed">
              Your birth date encodes your Life Path — the core lesson and purpose of this lifetime.
            </p>

            <Input
              type="date"
              value={dob}
              onChange={(e) => { setDob(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleDobSubmit()}
              autoFocus
              className="bg-card/60 border-border/60 text-foreground font-body text-lg focus:border-primary focus:ring-primary/20 h-14 text-center"
            />
            {error && <p className="text-destructive text-xs font-ui text-center mt-2">{error}</p>}

            <Button
              onClick={handleDobSubmit}
              className="w-full h-13 mt-5 text-sm font-display tracking-[0.15em] uppercase bg-primary text-primary-foreground hover:bg-gold-light border-0 shadow-gold transition-all duration-300 group"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Reveal My Blueprint
            </Button>

            <button
              onClick={() => setStep(0)}
              className="w-full mt-3 text-xs font-ui text-muted-foreground hover:text-foreground/60 transition-colors"
            >
              ← Go back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuidedIntake;
