-- Newsletter subscribers
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'footer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
ON public.newsletter_subscribers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view subscribers"
ON public.newsletter_subscribers FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage subscribers"
ON public.newsletter_subscribers FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Newsletters (drafts + sent log)
CREATE TABLE public.newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  recipient_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage newsletters"
ON public.newsletters FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Game plays (spin & quiz daily limits)
CREATE TABLE public.game_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  game_type TEXT NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  played_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_game_plays_user_date ON public.game_plays(user_id, game_type, played_at DESC);
ALTER TABLE public.game_plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plays"
ON public.game_plays FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plays"
ON public.game_plays FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all plays"
ON public.game_plays FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Test order flag + admin delete
ALTER TABLE public.orders ADD COLUMN is_test_order BOOLEAN NOT NULL DEFAULT false;

CREATE POLICY "Admins can delete test orders"
ON public.orders FOR DELETE
USING (has_role(auth.uid(), 'admin') AND is_test_order = true);

CREATE POLICY "Admins can delete test order items"
ON public.order_items FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.orders
  WHERE orders.id = order_items.order_id
    AND has_role(auth.uid(), 'admin')
    AND orders.is_test_order = true
));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.newsletter_subscribers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.newsletters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_plays;