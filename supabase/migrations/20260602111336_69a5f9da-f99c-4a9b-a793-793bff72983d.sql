CREATE TABLE IF NOT EXISTS public.email_unsubscribe_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  token text NOT NULL UNIQUE,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.email_unsubscribe_tokens TO service_role;

ALTER TABLE public.email_unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages email unsubscribe tokens" ON public.email_unsubscribe_tokens;
CREATE POLICY "Service role manages email unsubscribe tokens"
ON public.email_unsubscribe_tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.suppressed_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  reason text NOT NULL CHECK (reason IN ('unsubscribe', 'bounce', 'complaint')),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.suppressed_emails TO service_role;

ALTER TABLE public.suppressed_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages suppressed emails" ON public.suppressed_emails;
CREATE POLICY "Service role manages suppressed emails"
ON public.suppressed_emails
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.email_send_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id text,
  template_name text NOT NULL,
  recipient_email text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'dlq', 'bounced', 'complained', 'suppressed')),
  error_message text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.email_send_log TO service_role;

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages email send log" ON public.email_send_log;
CREATE POLICY "Service role manages email send log"
ON public.email_send_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_email_unsubscribe_tokens_email ON public.email_unsubscribe_tokens (lower(email));
CREATE INDEX IF NOT EXISTS idx_email_unsubscribe_tokens_token ON public.email_unsubscribe_tokens (token);
CREATE INDEX IF NOT EXISTS idx_suppressed_emails_email ON public.suppressed_emails (lower(email));
CREATE INDEX IF NOT EXISTS idx_email_send_log_recipient_created ON public.email_send_log (lower(recipient_email), created_at DESC);