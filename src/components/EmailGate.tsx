import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface EmailGateProps {
  userName: string;
  onComplete: (email: string) => void;
}

const EmailGate = ({ userName, onComplete }: EmailGateProps) => {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const firstName = userName.split(" ")[0];

  const handleSubmit = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setSending(true);

    const { error: authError } = await signInWithMagicLink(email.trim(), userName);

    if (authError) {
      setError("Something went wrong. Please try again.");
      setSending(false);
      return;
    }

    setSent(true);
    setSending(false);

    // Let user proceed immediately — magic link creates account in background
    setTimeout(() => onComplete(email.trim()), 1800);
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
                {firstName}, your blueprint is ready
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="font-body text-lg text-muted-foreground mb-2 leading-relaxed"
              >
                Enter your email to unlock your complete reading — including a downloadable PDF blueprint.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="font-ui text-[10px] text-muted-foreground/60 tracking-wider mb-8"
              >
                We'll also send a magic link so you can save your reading & access it anytime
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
                      Sending…
                    </>
                  ) : (
                    <>
                      Reveal My Blueprint
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

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
                className="w-20 h-20 mx-auto mb-6 rounded-full border border-emerald-500/30 flex items-center justify-center bg-emerald-500/10"
              >
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </motion.div>

              <h2 className="font-display text-2xl text-gradient-gold mb-3">
                Magic link sent!
              </h2>
              <p className="font-body text-lg text-muted-foreground mb-2">
                Check <span className="text-foreground">{email}</span> to save your reading.
              </p>
              <p className="font-body text-base text-muted-foreground/60">
                Revealing your blueprint now…
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
