REVOKE ALL ON FUNCTION public.award_game_points() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.award_game_points() FROM anon;
REVOKE ALL ON FUNCTION public.award_game_points() FROM authenticated;

REVOKE ALL ON FUNCTION public.redeem_loyalty_points(uuid, integer, numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.redeem_loyalty_points(uuid, integer, numeric) FROM anon;
GRANT EXECUTE ON FUNCTION public.redeem_loyalty_points(uuid, integer, numeric) TO authenticated;