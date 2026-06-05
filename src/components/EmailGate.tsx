import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Sparkles, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { submitLifePathLead } from "@/lib/lifePathLead";

interface EmailGateProps {
  userName: string;
  birthDate?: Date | null;
  onComplete: (email: string) => void;
}

const EmailGate = ({ userName, birthDate, onComplete }: EmailGateProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailSentSuccessfully, setEmailSentSuccessfully] = useState(true);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");

  const firstName = userName.split(" ")[0];

  const handleSubmit = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setSending(true);
    setEmailSentSuccessfully(true);
    setEmailErrorMessage("");

    try {
      const res = await submitLifePathLead({
        email: email.trim(),
        fullName: userName,
        birthDate: birthDate ? birthDate.toISOString().split("T")[0] : undefined,
      });
      if (!res.ok) {
        setEmailSentSuccessfully(false);
        setEmailErrorMessage(res.message || "Failed to send email");
      }
    } catch (leadError: any) {
      console.error("Life-path lead capture failed", leadError);
      setEmailSentSuccessfully(false);
      setEmailErrorMessage(leadError instanceof Error ? leadError.message : String(leadError));
    }

    setSent(true);
    setSending(false);

    // Let user proceed immediately while the welcome email lands in their inbox.
    // Give them a bit more time if it failed to let them read the warning status.
    const delay = emailSentSuccessfully ? 900 : 2500;
    setTimeout(() => onComplete(email.trim()), delay);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="relative z-10 text-center max-w-md w-full">
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full border border-primary/30 flex items-center justify-center bg-card/60"
              >
                <Sparkles className="w-8 h-8 text-primary" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-2xl md:text-3xl text-gradient-gold mb-3"
              >
                {firstName}, your premium blueprint is ready
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="font-body text-lg text-muted-foreground mb-2 leading-relaxed"
              >
                Enter your email to unlock the full reading and your premium PDF workbook — a gorgeous, practical guide with decision filters, timing prompts, a 30-day activation plan, and printable reflection pages.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="font-ui text-[10px] text-muted-foreground/60 tracking-wider mb-8"
              >
                Instant access after capture: your results, the Download Free Blueprint PDF button, and a high-value email guide showing exactly how to use your numbers this week.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    autoFocus
                    className="bg-card/60 border-border/60 text-foreground font-body text-lg placeholder:text-muted-foreground/30 focus:border-primary focus:ring-primary/20 h-14 text-center pl-10 tracking-wide"
                  />
                </div>
                {error && <p className="text-destructive text-xs font-ui text-center mt-2">{error}</p>}

                <Button
                  onClick={handleSubmit}
                  disabled={sending}
                  className="w-full h-13 mt-4 text-sm font-display tracking-[0.15em] uppercase bg-primary text-primary-foreground hover:bg-gold-light border-0 shadow-gold transition-all duration-300 group"
                >
                  {sending ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full mr-2"
                      />
                      Sending Your Guide…
                    </>
                  ) : (
                    <>
                      Unlock My Free Blueprint + PDF
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] font-ui tracking-wide text-muted-foreground/60">
                  <span className="inline-flex items-center justify-center gap-1 rounded-full border border-border/50 bg-card/40 px-2 py-1"><ShieldCheck className="h-3 w-3 text-primary" />Private</span>
                  <span className="rounded-full border border-border/50 bg-card/40 px-2 py-1">Premium PDF</span>
                  <span className="rounded-full border border-border/50 bg-card/40 px-2 py-1">1-click opt out</span>
                </div>

                <p className="font-ui text-[9px] text-muted-foreground/50 mt-3 tracking-wider">
                  No spam · Free forever · Unsubscribe anytime
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className={`w-20 h-20 mx-auto mb-6 rounded-full border flex items-center justify-center ${
                  emailSentSuccessfully 
                    ? "border-emerald-500/30 bg-emerald-500/10" 
                    : "border-amber-500/30 bg-amber-500/10"
                }`}
              >
                {emailSentSuccessfully ? (
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                ) : (
                  <span className="text-amber-400 font-display text-2xl font-bold">!</span>
                )}
              </motion.div>

              <h2 className="font-display text-2xl text-gradient-gold mb-3">
                {emailSentSuccessfully ? "Your blueprint is unlocked!" : "Blueprint Unlocked (With Warnings)"}
              </h2>
              {emailSentSuccessfully ? (
                <p className="font-body text-lg text-muted-foreground mb-2">
                  We emailed <span className="text-foreground">{email}</span> your premium usage guide.
                </p>
              ) : (
                <p className="font-body text-lg text-amber-500/90 mb-2">
                  Warning: We couldn't send your email guide ({emailErrorMessage}).
                </p>
              )}
              <p className="font-body text-base text-muted-foreground/60">
                Opening your reading now — your Download Free Blueprint PDF button appears on the results page.
              </p>

              <motion.div
                className="mt-6 flex justify-center gap-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EmailGate;
