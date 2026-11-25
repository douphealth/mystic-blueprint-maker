
/**
 * Footer on every screen: the entertainment framing, and the terms, refund and
 * privacy pages, so they are one tap away before anyone pays.
 */
const LegalFooter = ({ className = "" }: { className?: string }) => (
  <footer className={`text-center pt-6 border-t border-border/20 font-ui text-[11px] text-muted-foreground ${className}`}>
    <p className="max-w-xl mx-auto leading-relaxed mb-3">
      Numerology is a reflective and entertainment practice. Readings describe themes to think about; they don't
      predict events and aren't medical, legal, financial or relationship advice.
    </p>
    <nav aria-label="Legal and site links" className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-3">
      <a href="/terms" target="_blank" rel="noopener" className="underline underline-offset-4 decoration-muted-foreground/40 hover:text-foreground">
        Terms &amp; refunds
      </a>
      <a href="/privacy" target="_blank" rel="noopener" className="underline underline-offset-4 decoration-muted-foreground/40 hover:text-foreground">
        Privacy
      </a>
      <a
        href="https://mysticaldigits.com/life-path-number-calculator/"
        className="underline underline-offset-4 decoration-muted-foreground/40 hover:text-foreground"
      >
        Life Path calculator
      </a>
      <a
        href="https://mysticaldigits.com/contact-us/"
        className="underline underline-offset-4 decoration-muted-foreground/40 hover:text-foreground"
      >
        Contact
      </a>
    </nav>
    <p className="text-[10px] text-muted-foreground/70">
      © {new Date().getFullYear()}{" "}
      <a href="https://mysticaldigits.com/" className="hover:text-foreground">
        MysticalDigits.com
      </a>
    </p>
  </footer>
);

export default LegalFooter;
