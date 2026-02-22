-- Loyalty rewards tables
CREATE TABLE public.loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_balance integer NOT NULL DEFAULT 0,
  lifetime_points integer NOT NULL DEFAULT 0,
  referral_code text NOT NULL UNIQUE DEFAULT upper(substr(md5(random()::text), 1, 8)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE public.points_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer NOT NULL,
  type text NOT NULL CHECK (type IN ('signup_bonus', 'order_reward', 'referral_bonus', 'redemption', 'manual')),
  description text,
  order_id uuid REFERENCES public.orders(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  points_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loyalty points" ON public.loyalty_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage loyalty points" ON public.loyalty_points FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can insert loyalty points" ON public.loyalty_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON public.points_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage transactions" ON public.points_transactions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Admins can manage referrals" ON public.referrals FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_loyalty_points_updated_at BEFORE UPDATE ON public.loyalty_points FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Product Q&A tables
CREATE TABLE public.product_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.product_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.product_questions(id) ON DELETE CASCADE,
  answer text NOT NULL,
  is_ai_generated boolean NOT NULL DEFAULT false,
  is_approved boolean NOT NULL DEFAULT false,
  responder_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions are publicly readable" ON public.product_questions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can ask questions" ON public.product_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage questions" ON public.product_questions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Approved answers are publicly readable" ON public.product_answers FOR SELECT USING (is_approved = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage answers" ON public.product_answers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can insert answers" ON public.product_answers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Realtime for Q&A and loyalty
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.loyalty_points;

-- Auto-create loyalty record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_loyalty()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.loyalty_points (user_id, points_balance, lifetime_points)
  VALUES (NEW.id, 100, 100);
  INSERT INTO public.points_transactions (user_id, points, type, description)
  VALUES (NEW.id, 100, 'signup_bonus', 'Welcome bonus for joining!');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_loyalty
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_loyalty();