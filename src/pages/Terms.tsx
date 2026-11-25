import LegalPage from "./LegalPage";
import { FREE_PAGE_COUNT, PREMIUM_PAGE_LABEL } from "@/lib/editions";

/**
 * Terms for the Blueprint app and the Premium Edition, including the refund
 * policy that the paywall links to (#refunds).
 *
 * REFUND_DAYS: 14-day full refund, confirmed by the owner on 25 Nov 2026.
 * It matches the EU cooling-off period, so EU buyers are covered without a separate
 * "waive your right of withdrawal" checkbox at checkout.
 */
export const REFUND_DAYS = 14;

const Terms = () => (
  <LegalPage title="Terms & refund policy" updated="25 November 2026">
    <p>
      These terms cover the Mystical Digits Blueprint at blueprint.mysticaldigits.com: the free numerology reading
      and the optional paid Premium Edition. The wider site has its own{" "}
      <a href="https://mysticaldigits.com/terms-and-conditions/">terms and conditions</a>, which also apply.
    </p>

    <h2>What the Blueprint is</h2>
    <p>
      Numerology is a reflective and entertainment practice. Your reading describes themes that numerology associates
      with your numbers. It does not predict events, guarantee any result, or replace medical, psychological, legal,
      financial or relationship advice. Please make important decisions with the help of a qualified professional.
    </p>

    <h2>The free reading</h2>
    <p>
      The free reading shows six core numbers with written interpretations and a {FREE_PAGE_COUNT}-page PDF. To open
      it we ask for your email address and your agreement to receive our emails, which you can stop at any time with
      the unsubscribe link in each one.
    </p>

    <h2>The Premium Edition</h2>
    <ul>
      <li>Price: US$7.99, charged once. There is no subscription and nothing renews.</li>
      <li>
        What you get: a {PREMIUM_PAGE_LABEL} PDF generated from the name and birth date you entered. It is created
        in your browser straight after your payment is confirmed.
      </li>
      <li>
        Payment is handled by Stripe. We never see or store your card details. Stripe emails you a receipt.
      </li>
      <li>
        Getting it again: the Premium Edition stays unlocked in the browser you bought it in. On another device, use
        "Already purchased? Restore it" on the reading page and we'll email a one-time unlock link to the address you
        paid with.
      </li>
      <li>The PDF is for your personal use. Please don't resell or republish it.</li>
    </ul>

    <h2 id="refunds">Refund policy</h2>
    <p>
      If the Premium Edition doesn't download, has a problem, or isn't what you expected, email us within{" "}
      {REFUND_DAYS} days of purchase and we'll refund you in full. Reply to your Stripe receipt or use our{" "}
      <a href="https://mysticaldigits.com/contact-us/">contact page</a>, and include the email address you paid with.
      Refunds go back to the original payment method through Stripe; your bank may take 5 to 10 business days to show
      it.
    </p>

    <h2>Changes and contact</h2>
    <p>
      If we change these terms we'll update the date at the top; the terms that applied when you paid continue to
      apply to that purchase. Questions: <a href="https://mysticaldigits.com/contact-us/">contact us</a>.
    </p>
  </LegalPage>
);

export default Terms;
