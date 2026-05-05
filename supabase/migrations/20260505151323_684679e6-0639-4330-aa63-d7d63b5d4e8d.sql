-- Secure loyalty point redemption through a backend function instead of direct client balance edits.
CREATE OR REPLACE FUNCTION public.redeem_loyalty_points(_order_id uuid, _points integer, _naira_value numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_balance integer;
  v_order_owner uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to redeem points';
  END IF;

  IF _points IS NULL OR _points <= 0 THEN
    RAISE EXCEPTION 'Points must be greater than zero';
  END IF;

  SELECT user_id INTO v_order_owner
  FROM public.orders
  WHERE id = _order_id;

  IF v_order_owner IS NULL OR v_order_owner <> v_user THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  SELECT points_balance INTO v_balance
  FROM public.loyalty_points
  WHERE user_id = v_user
  FOR UPDATE;

  IF COALESCE(v_balance, 0) < _points THEN
    RAISE EXCEPTION 'Insufficient loyalty points';
  END IF;

  UPDATE public.loyalty_points
  SET points_balance = points_balance - _points,
      updated_at = now()
  WHERE user_id = v_user;

  INSERT INTO public.points_transactions (user_id, points, type, description, order_id)
  VALUES (v_user, -_points, 'redemption', 'Redeemed for ₦' || COALESCE(_naira_value, 0)::text || ' off order', _order_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_loyalty_points(uuid, integer, numeric) FROM anon;
GRANT EXECUTE ON FUNCTION public.redeem_loyalty_points(uuid, integer, numeric) TO authenticated;

-- Customers should not directly edit point balances from the browser.
DROP POLICY IF EXISTS "Users can update own loyalty points" ON public.loyalty_points;