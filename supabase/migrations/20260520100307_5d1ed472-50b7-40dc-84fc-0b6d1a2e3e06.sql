
ALTER TABLE public.gift_wishlists
  ADD COLUMN IF NOT EXISTS gift_type text NOT NULL DEFAULT 'send',
  ADD COLUMN IF NOT EXISTS recipient_user_id uuid,
  ADD COLUMN IF NOT EXISTS shipping_name text,
  ADD COLUMN IF NOT EXISTS shipping_phone text,
  ADD COLUMN IF NOT EXISTS shipping_address text,
  ADD COLUMN IF NOT EXISTS shipping_city text,
  ADD COLUMN IF NOT EXISTS shipping_state text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS fulfilled_order_id uuid;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS is_gift boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS gift_id uuid,
  ADD COLUMN IF NOT EXISTS gift_message text,
  ADD COLUMN IF NOT EXISTS gift_sender_name text,
  ADD COLUMN IF NOT EXISTS gift_recipient_user_id uuid;

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage notifications" ON public.notifications;
CREATE POLICY "Admins manage notifications" ON public.notifications
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated can create notifications" ON public.notifications;
CREATE POLICY "Authenticated can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = gift_recipient_user_id);

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.gift_recipient_user_id = auth.uid())
  ));

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_wishlists;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
