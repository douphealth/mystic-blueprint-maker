import type { Receipt } from "@/lib/entitlement";
import { PREMIUM_EDITION } from "@/lib/editions";

/**
 * A plain order summary on the success page. Stripe also emails its own
 * receipt; this one is here so the buyer sees what they paid for, to which
 * address, and how to get back in, without leaving the page.
 *
 * Every figure comes from the server's record of the paid Stripe session.
 * When the server sends no receipt (older backend) the block is not shown,
 * rather than showing a price we did not read from the purchase.
 */
interface OrderReceiptProps {
  receipt?: Receipt;
  email?: string;
}

function formatAmount(amount?: number, currency?: string): string | null {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) return null;
  const code = (currency || "usd").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: code }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${code}`;
  }
}

function formatDate(value?: string): string | null {
  if (!value) return null;
  // "YYYY-MM-DD HH:MM:SS" from MySQL; show the date only.
  const day = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}

const OrderReceipt = ({ receipt, email }: OrderReceiptProps) => {
  const amount = formatAmount(receipt?.amount_total, receipt?.currency);
  if (!receipt || !amount) return null;
  const date = formatDate(receipt.purchased_at);

  return (
    <section
      aria-label="Order summary"
      className="max-w-md mx-auto mb-8 text-left rounded-2xl border border-border/50 bg-card/60 p-5 font-ui text-xs text-muted-foreground"
    >
      <h2 className="font-display text-sm text-foreground mb-3 tracking-wide">Order summary</h2>
      <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1.5">
        <dt>Item</dt>
        <dd className="text-foreground">Mystical Digits Blueprint, {PREMIUM_EDITION.name}</dd>
        <dt>Paid</dt>
        <dd className="text-foreground">{amount}, one-time</dd>
        {date && (
          <>
            <dt>Date</dt>
            <dd className="text-foreground">{date}</dd>
          </>
        )}
        {email && (
          <>
            <dt>Email</dt>
            <dd className="text-foreground break-all">{email}</dd>
          </>
        )}
      </dl>
      <p className="mt-3 leading-relaxed">
        Stripe emails your payment receipt to this address. To open the Premium Edition on another device, use
        "Already purchased? Restore it" on the reading page and we'll email you an unlock link.
      </p>
    </section>
  );
};

export default OrderReceipt;
