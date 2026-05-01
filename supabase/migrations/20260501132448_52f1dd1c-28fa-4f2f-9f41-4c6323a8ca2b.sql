
CREATE TABLE public.gift_wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE DEFAULT lower(substr(md5(gen_random_uuid()::text || clock_timestamp()::text), 1, 10)),
  sender_id UUID,
  sender_name TEXT NOT NULL,
  recipient_name TEXT,
  recipient_email TEXT,
  message TEXT,
  occasion TEXT,
  product_ids TEXT[] NOT NULL DEFAULT '{}',
  view_count INTEGER NOT NULL DEFAULT 0,
  opened_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gift_wishlists ENABLE ROW LEVEL SECURITY;

-- Public can view any gift wishlist via the link
CREATE POLICY "Gift wishlists are publicly readable"
  ON public.gift_wishlists FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create their own"
  ON public.gift_wishlists FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Senders can update own gift wishlists"
  ON public.gift_wishlists FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "Senders can delete own gift wishlists"
  ON public.gift_wishlists FOR DELETE
  USING (auth.uid() = sender_id);

CREATE POLICY "Admins can manage all gift wishlists"
  ON public.gift_wishlists FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_gift_wishlists_updated_at
  BEFORE UPDATE ON public.gift_wishlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to safely increment view count (anyone can call)
CREATE OR REPLACE FUNCTION public.record_gift_view(_slug TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.gift_wishlists
    SET view_count = view_count + 1,
        opened_at = COALESCE(opened_at, now())
    WHERE slug = _slug;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_gift_view(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_gift_view(TEXT) TO anon, authenticated;

CREATE INDEX idx_gift_wishlists_sender ON public.gift_wishlists(sender_id);
CREATE INDEX idx_gift_wishlists_slug ON public.gift_wishlists(slug);
