-- Expand the allowed point transaction types used by rewards, admin adjustments, and Play & Earn.
ALTER TABLE public.points_transactions
DROP CONSTRAINT IF EXISTS points_transactions_type_check;

ALTER TABLE public.points_transactions
ADD CONSTRAINT points_transactions_type_check
CHECK (type IN ('signup_bonus', 'order_reward', 'referral_bonus', 'redemption', 'game_reward', 'admin_credit', 'admin_debit'));

-- Award game points centrally when a user records a valid game play.
CREATE OR REPLACE FUNCTION public.award_game_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.points_earned > 0 THEN
    INSERT INTO public.loyalty_points (user_id, points_balance, lifetime_points)
    VALUES (NEW.user_id, NEW.points_earned, NEW.points_earned)
    ON CONFLICT (user_id) DO UPDATE
      SET points_balance = public.loyalty_points.points_balance + NEW.points_earned,
          lifetime_points = public.loyalty_points.lifetime_points + NEW.points_earned,
          updated_at = now();

    INSERT INTO public.points_transactions (user_id, points, type, description)
    VALUES (
      NEW.user_id,
      NEW.points_earned,
      'game_reward',
      CASE
        WHEN NEW.game_type = 'spin' THEN 'Spin & Win: ' || NEW.points_earned || ' pts'
        WHEN NEW.game_type = 'quiz' THEN 'Trivia reward: ' || NEW.points_earned || ' pts'
        ELSE 'Play & Earn reward: ' || NEW.points_earned || ' pts'
      END
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS award_game_points_on_insert ON public.game_plays;
CREATE TRIGGER award_game_points_on_insert
AFTER INSERT ON public.game_plays
FOR EACH ROW
EXECUTE FUNCTION public.award_game_points();

-- Restore already-earned game points that were saved in game_plays but never appeared in loyalty history.
CREATE OR REPLACE FUNCTION public.backfill_missing_game_points()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    SELECT gp.user_id, COALESCE(SUM(gp.points_earned), 0)::integer AS total_points
    FROM public.game_plays gp
    WHERE gp.points_earned > 0
      AND NOT EXISTS (
        SELECT 1
        FROM public.points_transactions pt
        WHERE pt.user_id = gp.user_id
          AND pt.type = 'game_reward'
          AND pt.created_at >= gp.played_at - interval '5 minutes'
          AND pt.created_at <= gp.played_at + interval '5 minutes'
      )
    GROUP BY gp.user_id
  LOOP
    INSERT INTO public.loyalty_points (user_id, points_balance, lifetime_points)
    VALUES (rec.user_id, rec.total_points, rec.total_points)
    ON CONFLICT (user_id) DO UPDATE
      SET points_balance = public.loyalty_points.points_balance + rec.total_points,
          lifetime_points = public.loyalty_points.lifetime_points + rec.total_points,
          updated_at = now();

    INSERT INTO public.points_transactions (user_id, points, type, description)
    VALUES (rec.user_id, rec.total_points, 'game_reward', 'Play & Earn points restored');
  END LOOP;
END;
$$;

SELECT public.backfill_missing_game_points();
DROP FUNCTION public.backfill_missing_game_points();