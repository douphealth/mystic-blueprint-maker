import { FREE_PAGE_COUNT, PREMIUM_PAGE_LABEL } from "@/lib/editions";

/**
 * Visible, below-the-fold copy for the landing page.
 *
 * This replaces a visually hidden "crawl layer" in index.html that only search
 * engines saw (hidden text is against Google's spam policies) and that repeated
 * the Life Path formula FAQ from the calculator page on mysticaldigits.com.
 * The formula lives on the calculator; this page describes what this tool does
 * and links there instead of duplicating it.
 */
const LandingDetails = () => (
  <section
    aria-labelledby="how-it-works"
    className="relative z-10 w-full max-w-2xl mx-auto text-left font-body text-foreground/70 pb-12"
  >
    <h2 id="how-it-works" className="font-display text-xl text-foreground mb-4 text-center">
      What you get
    </h2>
    <ol className="space-y-3 mb-8 text-base leading-relaxed list-decimal pl-5">
      <li>Enter the full name you were given at birth and your date of birth.</li>
      <li>
        Add your email to open the reading. We send the free PDF guide and a short series of numerology emails;
        you can unsubscribe at any time.
      </li>
      <li>
        Read all six core numbers on screen, then download the free {FREE_PAGE_COUNT}-page PDF workbook.
      </li>
    </ol>

    <div className="grid gap-4 sm:grid-cols-2 mb-8">
      <div className="rounded-xl border border-border/40 bg-card/40 p-4">
        <h3 className="font-display text-sm text-foreground mb-1">Free reading</h3>
        <p className="text-sm leading-relaxed">
          Life Path, Destiny, Soul Urge, Personality, Birthday and Personal Year numbers, each with a written
          interpretation, plus the {FREE_PAGE_COUNT}-page PDF.
        </p>
      </div>
      <div className="rounded-xl border border-border/40 bg-card/40 p-4">
        <h3 className="font-display text-sm text-foreground mb-1">Premium Edition, $7.99 one-time</h3>
        <p className="text-sm leading-relaxed">
          Optional. A {PREMIUM_PAGE_LABEL} PDF with pinnacles and challenges, compatibility, career and money
          themes, a month-by-month outlook and journaling pages. No subscription.
        </p>
      </div>
    </div>

    <p className="text-sm leading-relaxed text-center">
      Only want your Life Path number and how it's worked out? Use the{" "}
      <a
        href="https://mysticaldigits.com/life-path-number-calculator/"
        className="text-primary underline underline-offset-4"
      >
        free Life Path calculator
      </a>{" "}
      or read the{" "}
      <a href="https://mysticaldigits.com/life-path-numbers/" className="text-primary underline underline-offset-4">
        Life Path number meanings
      </a>
      .
    </p>
  </section>
);

export default LandingDetails;
