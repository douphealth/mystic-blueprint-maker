import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Status = "checking" | "ready" | "confirming" | "done" | "invalid" | "error";

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<Status>("checking");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
    fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`, {
      headers: { apikey: anon },
    })
      .then(async (r) => {
        if (!r.ok) { setStatus("invalid"); return; }
        const data = await r.json().catch(() => ({}));
        if (data?.email) setEmail(data.email);
        setStatus(data?.alreadyUnsubscribed ? "done" : "ready");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  const confirm = async () => {
    setStatus("confirming");
    const { error } = await supabase.functions.invoke("handle-email-unsubscribe", { body: { token } });
    setStatus(error ? "error" : "done");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        <h1 className="font-display text-3xl text-gradient-gold mb-3">Manage your emails</h1>
        {status === "checking" && <p className="text-muted-foreground">Verifying your link…</p>}
        {status === "invalid" && <p className="text-destructive">This link is invalid or has expired.</p>}
        {status === "error" && <p className="text-destructive">Something went wrong. Please try again.</p>}
        {status === "ready" && (
          <>
            <p className="text-muted-foreground mb-6">
              Unsubscribe {email && <span className="text-foreground">{email}</span>} from Mystical Digits emails?
            </p>
            <Button onClick={confirm} className="bg-primary text-primary-foreground">Confirm Unsubscribe</Button>
          </>
        )}
        {status === "confirming" && <p className="text-muted-foreground">Updating your preferences…</p>}
        {status === "done" && (
          <>
            <p className="text-foreground mb-6">You’re unsubscribed. We won’t email you again.</p>
            <Link to="/" className="text-primary underline">Back to home</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
