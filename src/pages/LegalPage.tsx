import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import LegalFooter from "@/components/LegalFooter";
import { useNoindex } from "@/hooks/useNoindex";

/**
 * Shared layout for /terms and /privacy.
 *
 * Both are noindexed: the proxy Worker in front of this app rewrites every
 * HTML response's canonical to the home page, and these pages exist for
 * buyers, not for search.
 */
const LegalPage = ({ title, updated, children }: { title: string; updated: string; children: ReactNode }) => {
  useNoindex();
  const { hash } = useLocation();
  // The router doesn't scroll to #refunds by itself.
  useEffect(() => {
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [hash]);
  return (
    <div className="min-h-screen bg-background px-5 py-10">
      <main className="max-w-2xl mx-auto font-body text-foreground/80 leading-relaxed">
        <Link to="/" className="inline-flex items-center gap-1.5 font-ui text-xs text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to the Blueprint
        </Link>
        <h1 className="font-display text-3xl text-gradient-gold mb-2">{title}</h1>
        <p className="font-ui text-xs text-muted-foreground mb-8">Last updated {updated}</p>
        <div className="legal-prose space-y-4 text-base [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4">
          {children}
        </div>
      </main>
      <LegalFooter className="max-w-3xl mx-auto mt-14" />
    </div>
  );
};

export default LegalPage;
