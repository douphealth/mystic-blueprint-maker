import LegalPage from "./LegalPage";

/**
 * Privacy notice for the Blueprint app. Every item below describes what the
 * code and its backends actually do (see lifePathLead.ts, entitlement.ts,
 * premiumApi.ts, and the WordPress snippet behind /wp-json/mdx/v1). Update it
 * whenever the data flow changes.
 */
const Privacy = () => (
  <LegalPage title="Blueprint privacy notice" updated="25 November 2026">
    <p>
      This notice explains what the Mystical Digits Blueprint (blueprint.mysticaldigits.com) does with your
      information. It adds detail to the site-wide{" "}
      <a href="https://mysticaldigits.com/privacy-policy/">privacy policy</a>.
    </p>

    <h2>What we collect and why</h2>
    <ul>
      <li>
        <strong>Your birth name and date of birth.</strong> Used to calculate your numbers. The calculation and both
        PDFs are produced in your browser.
      </li>
      <li>
        <strong>Your email address</strong>, with your name and birth date, when you choose to open the reading. We
        use them to send the free guide and a short series of numerology emails, which link back to your reading and
        include an offer for the Premium Edition. The legal basis is your consent, which you give with the checkbox
        and can withdraw at any time with the unsubscribe link or by contacting us.
      </li>
      <li>
        <strong>If you buy the Premium Edition:</strong> Stripe processes the payment. We receive and keep your email
        address, the Stripe checkout reference, the amount and the date, so we can confirm your purchase, let you
        restore it on another device, handle refunds and keep accounting records. We never receive your card
        details.
      </li>
      <li>
        <strong>Technical data.</strong> Our hosting and security providers process your IP address and browser
        details to deliver the site and protect it from abuse. The lead form also sends the page address and your
        browser's user-agent string with your sign-up.
      </li>
    </ul>

    <h2>Stored in your browser</h2>
    <p>
      The app keeps your name, birth date, email address and whether you've unlocked the Premium Edition in your
      browser's local storage, so you don't have to type them again. Clearing your browser data removes them. The
      Blueprint app itself doesn't set advertising or analytics cookies.
    </p>

    <h2>Who processes it for us</h2>
    <ul>
      <li>Cloudflare: hosting, and relaying the sign-up form.</li>
      <li>Brevo: sending our emails and keeping the mailing list.</li>
      <li>Stripe: payments and receipts.</li>
      <li>Our WordPress site at mysticaldigits.com: the record of Premium Edition purchases.</li>
    </ul>
    <p>We don't sell your personal information.</p>

    <h2>How long we keep it</h2>
    <p>
      Mailing-list details: until you unsubscribe or ask us to delete them. Purchase records: as long as tax and
      accounting rules require.
    </p>

    <h2>Your rights</h2>
    <p>
      You can ask to see, correct or delete your information, withdraw consent, or object to how we use it. Write to
      admin@mysticaldigits.com or use our <a href="https://mysticaldigits.com/contact-us/">contact page</a>. You can
      also complain to your local data protection authority.
    </p>
  </LegalPage>
);

export default Privacy;
