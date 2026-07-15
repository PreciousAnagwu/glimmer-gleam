
-- 1. admin_permissions table
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  manage_orders BOOLEAN NOT NULL DEFAULT true,
  manage_products BOOLEAN NOT NULL DEFAULT true,
  manage_categories BOOLEAN NOT NULL DEFAULT true,
  manage_coupons BOOLEAN NOT NULL DEFAULT true,
  manage_content BOOLEAN NOT NULL DEFAULT true,
  manage_admins BOOLEAN NOT NULL DEFAULT false,
  manage_rewards BOOLEAN NOT NULL DEFAULT true,
  manage_newsletters BOOLEAN NOT NULL DEFAULT true,
  notify_email BOOLEAN NOT NULL DEFAULT true,
  email_for_notifications TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_permissions TO authenticated;
GRANT ALL ON public.admin_permissions TO service_role;

ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Admins can see their own permissions row; super admins (manage_admins) can manage all.
CREATE POLICY "Admins view own permissions"
  ON public.admin_permissions FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.admin_permissions ap
    WHERE ap.user_id = auth.uid() AND ap.manage_admins = true
  ));

CREATE POLICY "Super admins manage permissions"
  ON public.admin_permissions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.admin_permissions ap
    WHERE ap.user_id = auth.uid() AND ap.manage_admins = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.admin_permissions ap
    WHERE ap.user_id = auth.uid() AND ap.manage_admins = true
  ));

CREATE TRIGGER trg_admin_permissions_updated
  BEFORE UPDATE ON public.admin_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. helper function
CREATE OR REPLACE FUNCTION public.has_admin_permission(_user_id UUID, _perm TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_val BOOLEAN;
BEGIN
  IF NOT public.has_role(_user_id, 'admin'::app_role) THEN
    RETURN false;
  END IF;
  EXECUTE format('SELECT %I FROM public.admin_permissions WHERE user_id = $1', _perm)
    INTO v_val USING _user_id;
  -- If no row exists yet, admin has full defaults except manage_admins
  IF v_val IS NULL THEN
    RETURN _perm <> 'manage_admins';
  END IF;
  RETURN v_val;
END;
$$;

-- 3. Auto-create admin_permissions row when a user is granted admin role
CREATE OR REPLACE FUNCTION public.ensure_admin_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    INSERT INTO public.admin_permissions (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_admin_perms ON public.user_roles;
CREATE TRIGGER trg_ensure_admin_perms
  AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.ensure_admin_permissions();

-- 4. Notify admins on new order
CREATE OR REPLACE FUNCTION public.notify_admins_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT ur.user_id
    FROM public.user_roles ur
    WHERE ur.role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      r.user_id,
      'admin_new_order',
      '🛎️ New order placed',
      COALESCE(NEW.shipping_name, 'A customer') || ' placed an order of ₦' || COALESCE(NEW.total::text, '0'),
      '/admin?order=' || NEW.id::text
    );
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admins_new_order ON public.orders;
CREATE TRIGGER trg_notify_admins_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_new_order();

-- 5. Notify user on order status / payment status change
CREATE OR REPLACE FUNCTION public.notify_user_order_change()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_title TEXT;
  v_body TEXT;
BEGIN
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    v_title := CASE NEW.status
      WHEN 'processing' THEN '📦 Order is being prepared'
      WHEN 'shipped' THEN '🚚 Your order has shipped'
      WHEN 'delivered' THEN '🎉 Your order was delivered'
      WHEN 'cancelled' THEN '❌ Your order was cancelled'
      ELSE 'Order update'
    END;
    v_body := 'Order #' || substr(NEW.id::text, 1, 8) || ' — status: ' || NEW.status;
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (NEW.user_id, 'order_status', v_title, v_body, '/order/' || NEW.id::text);
  END IF;

  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
    v_title := CASE NEW.payment_status
      WHEN 'paid' THEN '✅ Payment confirmed'
      WHEN 'awaiting_confirmation' THEN '⏳ Payment awaiting confirmation'
      WHEN 'failed' THEN '⚠️ Payment failed'
      ELSE 'Payment update'
    END;
    v_body := 'Order #' || substr(NEW.id::text, 1, 8) || ' — payment: ' || NEW.payment_status;
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (NEW.user_id, 'order_payment', v_title, v_body, '/order/' || NEW.id::text);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_user_order_change ON public.orders;
CREATE TRIGGER trg_notify_user_order_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_user_order_change();

-- 6. Seed admin role for panagwu@gmail.com if user exists
DO $$
DECLARE
  v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = 'panagwu@gmail.com' LIMIT 1;
  IF v_uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    INSERT INTO public.admin_permissions (user_id, manage_admins, email_for_notifications)
    VALUES (v_uid, true, 'panagwu@gmail.com')
    ON CONFLICT (user_id) DO UPDATE SET manage_admins = true,
      email_for_notifications = COALESCE(public.admin_permissions.email_for_notifications, 'panagwu@gmail.com');
  END IF;
END $$;

-- 7. Auto-grant admin + super-admin when panagwu@gmail.com signs up in the future
CREATE OR REPLACE FUNCTION public.auto_grant_super_admin()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = 'panagwu@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    INSERT INTO public.admin_permissions (user_id, manage_admins, email_for_notifications)
    VALUES (NEW.id, true, NEW.email)
    ON CONFLICT (user_id) DO UPDATE SET manage_admins = true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_super_admin ON auth.users;
CREATE TRIGGER trg_auto_super_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_grant_super_admin();

-- 8. Ensure notifications table is on realtime publication (safe if already added)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;
