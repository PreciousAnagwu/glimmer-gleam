
-- 1) Settings table (singleton)
CREATE TABLE IF NOT EXISTS public.rewards_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signup_bonus integer NOT NULL DEFAULT 100,
  points_per_order integer NOT NULL DEFAULT 50,
  referral_bonus integer NOT NULL DEFAULT 200,
  points_per_naira numeric NOT NULL DEFAULT 0.5, -- 1 point = 0.5 NGN discount
  min_redeem_points integer NOT NULL DEFAULT 100,
  page_heading text NOT NULL DEFAULT 'How to Earn Points',
  page_subheading text NOT NULL DEFAULT 'Earn points on every purchase and unlock exclusive rewards.',
  signup_label text NOT NULL DEFAULT 'Sign Up Bonus',
  signup_description text NOT NULL DEFAULT '100 points when you join',
  order_label text NOT NULL DEFAULT 'Per Order',
  order_description text NOT NULL DEFAULT '50 points per completed order',
  referral_label text NOT NULL DEFAULT 'Referrals',
  referral_description text NOT NULL DEFAULT '200 points per friend referred',
  is_singleton boolean NOT NULL DEFAULT true UNIQUE,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rewards_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are publicly readable"
ON public.rewards_settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings"
ON public.rewards_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.rewards_settings DEFAULT VALUES
ON CONFLICT (is_singleton) DO NOTHING;

-- 2) Update signup loyalty function to read from settings
CREATE OR REPLACE FUNCTION public.handle_new_user_loyalty()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_bonus integer;
  v_referral_code text;
  v_referrer uuid;
BEGIN
  SELECT signup_bonus INTO v_bonus FROM public.rewards_settings LIMIT 1;
  v_bonus := COALESCE(v_bonus, 100);

  INSERT INTO public.loyalty_points (user_id, points_balance, lifetime_points)
  VALUES (NEW.id, v_bonus, v_bonus);
  INSERT INTO public.points_transactions (user_id, points, type, description)
  VALUES (NEW.id, v_bonus, 'signup_bonus', 'Welcome bonus for joining!');

  -- Referral handling
  v_referral_code := NEW.raw_user_meta_data->>'referral_code';
  IF v_referral_code IS NOT NULL AND length(v_referral_code) > 0 THEN
    SELECT user_id INTO v_referrer
      FROM public.loyalty_points
      WHERE upper(referral_code) = upper(v_referral_code) AND user_id <> NEW.id
      LIMIT 1;
    IF v_referrer IS NOT NULL THEN
      INSERT INTO public.referrals (referrer_id, referred_id, status)
      VALUES (v_referrer, NEW.id, 'pending');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Re-attach trigger if missing
DROP TRIGGER IF EXISTS on_auth_user_loyalty ON auth.users;
CREATE TRIGGER on_auth_user_loyalty
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_loyalty();

-- Also ensure profile trigger
DROP TRIGGER IF EXISTS on_auth_user_profile ON auth.users;
CREATE TRIGGER on_auth_user_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3) Function: award order points when payment_status becomes 'paid'
CREATE OR REPLACE FUNCTION public.award_order_points()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_pts integer;
  v_ref_bonus integer;
  v_already integer;
  v_referral record;
BEGIN
  IF NEW.payment_status <> 'paid' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND OLD.payment_status = 'paid' THEN RETURN NEW; END IF;

  SELECT points_per_order, referral_bonus INTO v_pts, v_ref_bonus FROM public.rewards_settings LIMIT 1;
  v_pts := COALESCE(v_pts, 50);
  v_ref_bonus := COALESCE(v_ref_bonus, 200);

  -- Prevent double award (in case of trigger re-fire)
  SELECT count(*) INTO v_already FROM public.points_transactions
    WHERE order_id = NEW.id AND type = 'order_reward';
  IF v_already > 0 THEN RETURN NEW; END IF;

  -- Award order points
  IF v_pts > 0 AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.loyalty_points (user_id, points_balance, lifetime_points)
    VALUES (NEW.user_id, v_pts, v_pts)
    ON CONFLICT (user_id) DO UPDATE
      SET points_balance = public.loyalty_points.points_balance + v_pts,
          lifetime_points = public.loyalty_points.lifetime_points + v_pts,
          updated_at = now();

    INSERT INTO public.points_transactions (user_id, points, type, description, order_id)
    VALUES (NEW.user_id, v_pts, 'order_reward', 'Points earned from order #' || substr(NEW.id::text, 1, 8), NEW.id);
  END IF;

  -- Referral fulfillment on first paid order
  SELECT * INTO v_referral FROM public.referrals
    WHERE referred_id = NEW.user_id AND status = 'pending'
    ORDER BY created_at LIMIT 1;
  IF FOUND AND v_ref_bonus > 0 THEN
    -- Award referrer
    INSERT INTO public.loyalty_points (user_id, points_balance, lifetime_points)
    VALUES (v_referral.referrer_id, v_ref_bonus, v_ref_bonus)
    ON CONFLICT (user_id) DO UPDATE
      SET points_balance = public.loyalty_points.points_balance + v_ref_bonus,
          lifetime_points = public.loyalty_points.lifetime_points + v_ref_bonus,
          updated_at = now();
    INSERT INTO public.points_transactions (user_id, points, type, description)
    VALUES (v_referral.referrer_id, v_ref_bonus, 'referral_bonus', 'Referral bonus: friend made first purchase');

    -- Award referee
    INSERT INTO public.loyalty_points (user_id, points_balance, lifetime_points)
    VALUES (NEW.user_id, v_ref_bonus, v_ref_bonus)
    ON CONFLICT (user_id) DO UPDATE
      SET points_balance = public.loyalty_points.points_balance + v_ref_bonus,
          lifetime_points = public.loyalty_points.lifetime_points + v_ref_bonus,
          updated_at = now();
    INSERT INTO public.points_transactions (user_id, points, type, description)
    VALUES (NEW.user_id, v_ref_bonus, 'referral_bonus', 'Welcome referral bonus from your inviter');

    UPDATE public.referrals
      SET status = 'completed', points_awarded = v_ref_bonus
      WHERE id = v_referral.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Need a unique index on user_id of loyalty_points for the ON CONFLICT
CREATE UNIQUE INDEX IF NOT EXISTS loyalty_points_user_id_unique ON public.loyalty_points(user_id);

DROP TRIGGER IF EXISTS trg_award_order_points_ins ON public.orders;
CREATE TRIGGER trg_award_order_points_ins
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.award_order_points();

DROP TRIGGER IF EXISTS trg_award_order_points_upd ON public.orders;
CREATE TRIGGER trg_award_order_points_upd
AFTER UPDATE OF payment_status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.award_order_points();

-- 4) Trigger to keep updated_at fresh on rewards_settings
DROP TRIGGER IF EXISTS trg_rewards_settings_updated ON public.rewards_settings;
CREATE TRIGGER trg_rewards_settings_updated
BEFORE UPDATE ON public.rewards_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
