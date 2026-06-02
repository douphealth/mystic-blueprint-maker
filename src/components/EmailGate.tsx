import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SEND_COOLDOWN_MS = 60_000;
const LAST_SEND_KEY = "mysticaldigits:last_blueprint_email";

interface EmailGateProps {
  userName: string;
  onComplete: (email: string) => void;
  lifePathNumber?: number | string;
}

const EmailGate = ({ userName, onComplete, lifePathNumber }: EmailGateProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const submitLockedRef = useRef(false);

  const firstName = userName.split(" ")[0] || "Seeker";
  const isCoolingDown = secondsRemaining > 0;

  useEffect(() => {
    if (!retryAt) return;
    const tick = () => {
      const s = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
      setSecondsRemaining(s);
      if (s === 0) setRetryAt(null);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [retryAt]);

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (submitLockedRef.current || sending || isCoolingDown) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    submitLockedRef.current = true;
    setError("");
    setSending(true);

    const origin = window.location.origin;
    const { error: fnError } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "blueprint-ready",
        recipientEmail: normalizedEmail,
        idempotencyKey: `blueprint-${normalizedEmail}-${Date.now()}`,
        templateData: {
          firstName,
          lifePathNumber,
          readingUrl: origin,
          purchaseUrl: `${origin}/?upgrade=1`,
        },
      },
    });

    if (fnError) {
      setError("We couldn't send your blueprint email. Please try again.");
      submitLockedRef.current = false;
      setSending(false);
      return;
    }

    window.localStorage.setItem(
      LAST_SEND_KEY,
      JSON.stringify({ email: normalizedEmail, sentAt: Date.now() }),
    );
    setRetryAt(Date.now() + SEND_COOLDOWN_MS);
    setSent(true);
    setSending(false);
    submitLockedRef.current = false;

    // Unlock the reading immediately — email is a parallel send.
    setTimeout(() => onComplete(normalizedEmail), 1400);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="relative z-10 text-center max-w-md w-full">
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div key="capture" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full border border-primary/30 flex items-center justify-center bg-card/60"
              >
                <Sparkles className="w-8 h-8 text-primary" />
              </motion.div>

              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-display text-2xl md:text-3xl text-gradient-gold mb-3">
                {firstName}, your blueprint is ready
              </motion.h2>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="font-body text-lg text-muted-foreground mb-2 leading-relaxed">
                Enter your email to unlock your complete reading — we'll also send your personal blueprint to your inbox.
              </motion.p>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="font-ui text-[10px] text-muted-foreground/60 tracking-wider mb-8">
                No password. No spam. Access your reading anytime.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !sending && !isCoolingDown) handleSubmit(); }}
                    autoFocus
                    className="bg-card/60 border-border/60 text-foreground font-body text-lg placeholder:text-muted-foreground/30 focus:border-primary focus:ring-primary/20 h-14 text-center pl-10 tracking-wide"
                  />
                </div>
                {error && <p className="text-destructive text-xs font-ui text-center mt-2">{error}</p>}

                <Button
                  onClick={handleSubmit}
                  disabled={sending || isCoolingDown}
                  className="w-full h-13 mt-4 text-sm font-display tracking-[0.15em] uppercase bg-primary text-primary-foreground hover:bg-gold-light border-0 shadow-gold transition-all duration-300 group"
                >
                  {sending ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full mr-2" />
                      Sending your blueprint…
                    </>
                  ) : isCoolingDown ? (
                    <>Try again in {secondsRemaining}s</>
                  ) : (
                    <>Reveal My Blueprint<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </Button>

                <p className="font-ui text-[9px] text-muted-foreground/50 mt-3 tracking-wider">
                  No spam · Unsubscribe anytime
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="w-20 h-20 mx-auto mb-6 rounded-full border border-emerald-500/30 flex items-center justify-center bg-emerald-500/10">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <h2 className="font-display text-2xl text-gradient-gold mb-3">Your blueprint is on its way</h2>
              <p className="font-body text-lg text-muted-foreground mb-2">
                We just sent your personal reading to <span className="text-foreground">{email}</span>.
              </p>
              <p className="font-body text-base text-muted-foreground/60">Revealing your blueprint now…</p>
              <motion.div className="mt-6 flex justify-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }} />
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
