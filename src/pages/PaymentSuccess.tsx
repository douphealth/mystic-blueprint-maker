import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Sparkles, ShieldCheck, Loader2, ArrowRight, MailQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import PremiumDelivery from "@/components/PremiumDelivery";
import { resolveEntitlement, loadBuyerEmail, type Entitlement } from "@/lib/entitlement";
import { PREMIUM_PAGE_COUNT } from "@/lib/editions";

/**
 * Where Stripe's success_url lands.
 *
 * This page has one job: hand over the thing that was paid for. It previously
 * did not — it congratulated the buyer and sent them back to a homepage that
 * still showed the paywall.
 *
 * Two rules govern everything here:
 *
 *   1. Delivery never waits on the network. The PDF is generated in the
 *      browser, so the entitlement check is an enhancement, not a dependency.
 *   2. Arriving on this URL is itself evidence of payment. Only Stripe
 *      redirects a browser here, and the production checkout is a payment link
 *      that does not reliably carry a session id — so requiring one would mean
 *      a buyer who paid in a fresh browser gets nothing.
 *
 * The check runs anyway, because a verified purchase is worth recording and
 * worth showing. It just never gets to veto the download.
 */
const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id") ?? undefined;

  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const email = loadBuyerEmail();

  useEffect(() => {
    let active = true;

    // A short grace period so the status line does not flicker between states
    // on a fast connection, and so the buyer reads a confirmation rather than
    // watching a spinner blink.
    const started = Date.now();
    const MIN_VISIBLE_MS = 600;

    resolveEntitlement({ sessionId, email: email ?? undefined, trustRedirect: true })
      .then(async (result) => {
        const elapsed = Date.now() - started;
        if (elapsed < MIN_VISIBLE_MS) {
          await new Promise((r) => setTimeout(r, MIN_VISIBLE_MS - elapsed));
        }
        if (active) setEntitlement(result);
      })
      .catch(() => {
        // resolveEntitlement is written not to throw; this is belt and braces
        // so an unexpected failure still cannot strand a paying customer.
        if (active) {
          setEntitlement({
            entitled: true,
            source: "stripe-redirect",
            email: email ?? undefined,
            unverified: true,
          });
        }
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

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
          <CheckCircle className="w-10 h-10 text-primary" />
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
        ) : (
          <>
            <h1 className="font-display text-3xl text-gradient-gold mb-3">We couldn't confirm a purchase</h1>
            <p className="font-body text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              If you paid with a different email address, you can restore it from your reading page. If you think this
              is a mistake, reply to your Stripe receipt and we'll sort it out.
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
