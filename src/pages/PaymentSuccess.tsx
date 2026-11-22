import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Sparkles, ShieldCheck, Loader2, ArrowRight, MailQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import PremiumDelivery from "@/components/PremiumDelivery";
import { resolveEntitlement, loadBuyerEmail, type Entitlement } from "@/lib/entitlement";
import { PREMIUM_PAGE_COUNT } from "@/lib/editions";
import { useNoindex } from "@/hooks/useNoindex";

/**
 * Where Stripe's success_url lands:
 *   /payment-success?session_id={CHECKOUT_SESSION_ID}
 *
 * Premium unlocks only when the backend confirms that session id, which it can
 * do only because a signature-verified Stripe webhook recorded the paid
 * session. Opening this URL by hand, or with a made-up id, unlocks nothing.
 *
 * The webhook and the redirect race each other, so verifySession() polls for
 * about 12 seconds. If the session is still unconfirmed after that, the buyer
 * gets a "check again" button and the restore-by-email path, never a dead end.
 */
const PaymentSuccess = () => {
  useNoindex();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id")?.trim() || undefined;

  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [attempt, setAttempt] = useState(0);
  const email = loadBuyerEmail();

  useEffect(() => {
    let active = true;
    setEntitlement(null);

    // A short grace period so the status line does not flicker between states
    // on a fast connection.
    const started = Date.now();
    const MIN_VISIBLE_MS = 600;

    resolveEntitlement({ sessionId, email: sessionId ? undefined : email ?? undefined })
      .then(async (result) => {
        const elapsed = Date.now() - started;
        if (elapsed < MIN_VISIBLE_MS) {
          await new Promise((r) => setTimeout(r, MIN_VISIBLE_MS - elapsed));
        }
        if (active) setEntitlement(result);
      })
      .catch(() => {
        // resolveEntitlement is written not to throw. If it does, offer a retry
        // rather than unlocking on no evidence.
        if (active) setEntitlement({ entitled: false, source: "none", pending: !!sessionId, inconclusive: true });
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, attempt]);

  if (!entitlement) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="font-display text-lg text-gradient-gold mb-1">Confirming your purchase…</p>
          <p className="font-ui text-xs text-muted-foreground">This takes a moment.</p>
        </motion.div>
      </div>
    );
  }

  const verified = entitlement.entitled && entitlement.source === "server";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-6"
        >
          {entitlement.entitled ? (
            <CheckCircle className="w-10 h-10 text-primary" />
          ) : (
            <MailQuestion className="w-10 h-10 text-primary" />
          )}
        </motion.div>

        {entitlement.entitled ? (
          <>
            <h1 className="font-display text-3xl text-gradient-gold mb-3">Payment received</h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="font-body text-foreground/60">Thank you — your Premium Edition is unlocked</p>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>

            {verified ? (
              <p className="font-ui text-[11px] text-muted-foreground inline-flex items-center gap-1.5 mb-6">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Purchase verified
                {entitlement.email ? <span className="text-muted-foreground/60">· {entitlement.email}</span> : null}
              </p>
            ) : (
              <p className="font-ui text-[11px] text-muted-foreground mb-6">
                Your payment is confirmed
                {entitlement.email ? <span className="text-muted-foreground/60"> · {entitlement.email}</span> : null}
              </p>
            )}

            <p className="font-ui text-sm text-muted-foreground mb-8 max-w-lg mx-auto">
              Your {PREMIUM_PAGE_COUNT}-page Premium Edition starts downloading automatically. Keep this page
              bookmarked — you can download it again as many times as you like.
            </p>

            <PremiumDelivery autoDownload />
          </>
        ) : entitlement.pending ? (
          <>
            <h1 className="font-display text-3xl text-gradient-gold mb-3">Still confirming your payment</h1>
            <p className="font-body text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              {entitlement.inconclusive
                ? "We couldn't reach our server just now. Your payment is safe — check again in a moment."
                : "Stripe hasn't sent us the confirmation yet. This usually takes a few seconds."}{" "}
              Your receipt from Stripe is your proof of purchase, and you can also restore it by email from your
              reading page.
            </p>
            <Button
              onClick={() => setAttempt((n) => n + 1)}
              className="h-12 px-8 bg-primary text-primary-foreground hover:bg-gold-light shadow-gold font-display tracking-[0.13em] uppercase"
            >
              <Loader2 className="w-4 h-4 mr-2" />
              Check again
            </Button>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl text-gradient-gold mb-3">No purchase to confirm here</h1>
            <p className="font-body text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              This page confirms a payment when Stripe sends you here after checkout. If you've already paid, restore
              your Premium Edition with the email address you paid with. If something looks wrong, reply to your Stripe
              receipt and we'll sort it out.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="h-12 px-8 bg-primary text-primary-foreground hover:bg-gold-light shadow-gold font-display tracking-[0.13em] uppercase"
            >
              <MailQuestion className="w-4 h-4 mr-2" />
              Restore my purchase
            </Button>
          </>
        )}

        <div className="mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="font-ui text-xs text-muted-foreground hover:text-foreground tracking-wider"
          >
            Back to my blueprint <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
