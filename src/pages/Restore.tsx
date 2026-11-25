import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Loader2, MailQuestion, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PremiumDelivery from "@/components/PremiumDelivery";
import RestorePurchase from "@/components/RestorePurchase";
import OrderReceipt from "@/components/OrderReceipt";
import LegalFooter from "@/components/LegalFooter";
import { resolveEntitlement, type Entitlement } from "@/lib/entitlement";
import { useNoindex } from "@/hooks/useNoindex";

/**
 * Landing page for the one-time unlock link in a restore email:
 *   /restore#token=...
 *
 * The token travels in the fragment so it never reaches a server log or a
 * Referer header. It is read once and removed from the address bar.
 */
function takeToken(): string {
  const hash = window.location.hash.replace(/^#/, "");
  const fromHash = new URLSearchParams(hash).get("token");
  const fromQuery = new URLSearchParams(window.location.search).get("token");
  const token = (fromHash || fromQuery || "").trim();
  if (hash || fromQuery) {
    try {
      window.history.replaceState(window.history.state, "", window.location.pathname);
    } catch {
      /* ignore */
    }
  }
  return token;
}

const Restore = () => {
  useNoindex();
  const navigate = useNavigate();
  const [token] = useState(takeToken);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);

  useEffect(() => {
    let active = true;
    if (!token) {
      setEntitlement({ entitled: false, source: "none" });
      return;
    }
    resolveEntitlement({ restoreToken: token })
      .then((r) => active && setEntitlement(r))
      .catch(() => active && setEntitlement({ entitled: false, source: "none", inconclusive: true }));
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-6">
      <main className="w-full max-w-2xl text-center flex-1 flex flex-col justify-center py-10">
        {!entitlement ? (
          <div>
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <h1 className="font-display text-lg text-gradient-gold mb-1">Checking your unlock link…</h1>
          </div>
        ) : entitlement.entitled ? (
          <>
            <CheckCircle className="w-10 h-10 text-primary mx-auto mb-5" />
            <h1 className="font-display text-3xl text-gradient-gold mb-3">Your Premium Edition is unlocked</h1>
            <p className="font-ui text-sm text-muted-foreground mb-8 max-w-lg mx-auto">
              It stays unlocked in this browser. Download it below.
            </p>
            <OrderReceipt receipt={entitlement.receipt} email={entitlement.email} />
            <PremiumDelivery autoDownload={false} />
          </>
        ) : (
          <>
            <MailQuestion className="w-10 h-10 text-primary mx-auto mb-5" />
            <h1 className="font-display text-3xl text-gradient-gold mb-3">
              {entitlement.inconclusive ? "We couldn't check this link just now" : "This unlock link has expired"}
            </h1>
            <p className="font-body text-sm text-muted-foreground mb-2 max-w-md mx-auto">
              {entitlement.inconclusive
                ? "Please try again in a moment."
                : "Unlock links work for 24 hours. Enter the email you paid with and we'll send a new one."}
            </p>
            <RestorePurchase startOpen />
          </>
        )}

        <div className="mt-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="font-ui text-xs text-muted-foreground hover:text-foreground tracking-wider"
          >
            Back to my blueprint <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </main>
      <LegalFooter className="w-full max-w-3xl" />
    </div>
  );
};

export default Restore;
