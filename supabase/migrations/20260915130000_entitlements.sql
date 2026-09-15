-- ---------------------------------------------------------------------------
-- Entitlements
--
-- The Premium Edition was originally gated by a flag in the buyer's
-- localStorage. That had two problems:
--
--   1. Anyone could unlock a paid product from devtools.
--   2. A paying customer who cleared their browser, switched device, or opened
--      the site in a private window lost the product permanently with no way
--      to restore it.
--
-- This table is the source of truth. Rows are written only by the Stripe
-- webhook (which runs with the service role) and read only by the
-- verify-entitlement function (also service role). No client-facing policy is
-- granted, so RLS denies everything to anon and authenticated roles by
-- default — which is exactly what we want.
-- ---------------------------------------------------------------------------

CREATE TABLE public.entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- lowercased so lookups are case-insensitive
  email TEXT NOT NULL,

  product TEXT NOT NULL DEFAULT 'premium_blueprint',

  -- Stripe's checkout session id. UNIQUE gives the webhook idempotency:
  -- Stripe retries on any non-2xx, and a retry must not create a second row.
  stripe_session_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_payment_intent TEXT,

  amount_total INTEGER,
  currency TEXT,

  -- 'active' | 'refunded' | 'revoked'
  status TEXT NOT NULL DEFAULT 'active',

  -- what the buyer entered at intake, so support can find a row by name too
  buyer_name TEXT,
  birth_date DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- one active entitlement per email per product
CREATE UNIQUE INDEX entitlements_email_product_active_idx
  ON public.entitlements (lower(email), product)
  WHERE status = 'active';

CREATE INDEX entitlements_email_idx ON public.entitlements (lower(email));
CREATE INDEX entitlements_session_idx ON public.entitlements (stripe_session_id);

ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

-- Intentionally no policies. Only the service role (used by the edge functions)
-- can read or write. Adding a "users can read own" policy would require an
-- authenticated user, and this app supports guest checkout.

CREATE OR REPLACE FUNCTION public.touch_entitlements_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER entitlements_updated_at
  BEFORE UPDATE ON public.entitlements
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_entitlements_updated_at();
