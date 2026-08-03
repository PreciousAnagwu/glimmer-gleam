-- Payment review metadata on orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_reviewed_by UUID,
  ADD COLUMN IF NOT EXISTS payment_rejection_reason TEXT;

-- Email delivery monitoring log
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient TEXT NOT NULL,
  subject TEXT,
  template TEXT,
  event TEXT,
  order_id UUID,
  status TEXT NOT NULL DEFAULT 'queued',
  provider_id TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.email_logs TO authenticated;
GRANT ALL ON public.email_logs TO service_role;

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view email logs" ON public.email_logs;
CREATE POLICY "Admins can view email logs"
ON public.email_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS email_logs_created_at_idx ON public.email_logs (created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.email_logs;