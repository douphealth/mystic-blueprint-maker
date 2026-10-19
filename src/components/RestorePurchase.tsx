import { useState } from "react";
import { Loader2, ArrowRight, MailQuestion, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PremiumDelivery from "@/components/PremiumDelivery";
import { saveBuyerEmail } from "@/lib/entitlement";
import { requestPurchaseRestore, completePurchaseRestore } from "@/lib/wpBackend";

interface RestorePurchaseProps {
  defaultEmail?: string;
  onRestored?: () => void;
}

/** Email ownership is proven with a one-time code, never by knowing an address. */
export default function RestorePurchase({ defaultEmail, onRestored }: RestorePurchaseProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [requestId, setRequestId] = useState("");
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [restored, setRestored] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const requestCode = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter the email address you used at checkout.");
      return;
    }
    setChecking(true);
    setError("");
    const { data, error: backendError } = await requestPurchaseRestore(email.trim().toLowerCase());
    setChecking(false);
    if (backendError || !data?.request_id) {
      setError("Purchase verification is temporarily unavailable. Please try again later.");
      return;
    }
    setRequestId(data.request_id);
    setNotice("If a qualifying purchase exists, we have emailed an 8-digit verification code. Check your inbox.");
  };

  const complete = async () => {
    if (!/^\d{8}$/.test(code)) {
      setError("Enter the 8-digit verification code from your email.");
      return;
    }
    setChecking(true);
    setError("");
    const { data, error: backendError } = await completePurchaseRestore(requestId, code);
    setChecking(false);
    if (backendError || !data?.entitled || data?.verified !== true) {
      setError("This code could not be verified. Check it or request a new one.");
      return;
    }
    saveBuyerEmail(email);
    setRestored(true);
    onRestored?.();
  };

  if (restored) return <div className="mt-8 text-center">
    <p className="flex justify-center items-center gap-2 text-primary mb-4"><CheckCircle className="w-4 h-4" /> Purchase verified</p>
    <PremiumDelivery autoDownload={false} />
  </div>;

  if (!open) return <div className="text-center mt-6">
    <button type="button" onClick={() => setOpen(true)} className="font-ui text-[11px] underline underline-offset-4 text-muted-foreground">
      Already purchased? Restore it
    </button>
  </div>;

  return <div className="max-w-md mx-auto mt-8 text-left rounded-2xl border border-border/50 bg-card/60 p-5">
    <div className="flex items-start gap-3 mb-4">
      <MailQuestion className="w-5 h-5 text-primary shrink-0" />
      <p className="text-sm text-muted-foreground">Verify your purchase using a code emailed to your Stripe checkout address.</p>
    </div>
    <label htmlFor="mdx-restore-email" className="text-xs block mb-1">Checkout email</label>
    <Input id="mdx-restore-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="mb-3" />
    {requestId ? <>
      <label htmlFor="mdx-restore-code" className="text-xs block mb-1">8-digit verification code</label>
      <Input id="mdx-restore-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="12345678" className="mb-3" />
    </> : null}
    {notice && <p className="text-xs text-muted-foreground mb-3" role="status">{notice}</p>}
    {error && <p className="text-destructive text-xs mb-3" role="alert">{error}</p>}
    <Button onClick={requestId ? complete : requestCode} disabled={checking} className="w-full">
      {checking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
      {requestId ? "Verify purchase" : "Email verification code"}
    </Button>
    {requestId && <button type="button" className="mt-3 text-xs underline" disabled={checking} onClick={() => { setRequestId(""); setCode(""); setNotice(""); setError(""); }}>Use another email or request a new code</button>}
  </div>;
}
