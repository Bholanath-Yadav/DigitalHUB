-- ============================================================
-- Migration 101: FRESH SCHEMA + RLS (ADMIN FLOW SAFE)
-- ============================================================
-- Run after 100_full_database_reset.sql
-- ============================================================

-- --------------------
-- ENUMS
-- --------------------
CREATE TYPE public.user_role AS ENUM ('user', 'staff', 'admin');
CREATE TYPE public.product_category AS ENUM ('digital-tools', 'gaming', 'gift-cards', 'social-boost', 'streaming', 'vpn-privacy');
CREATE TYPE public.order_status AS ENUM ('pending', 'verified', 'rejected', 'completed');
CREATE TYPE public.payment_method AS ENUM ('esewa', 'khalti', 'ime-pay', 'connectips', 'bank');
CREATE TYPE public.payment_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE public.discount_type AS ENUM ('percentage', 'fixed');
CREATE TYPE public.chat_sender AS ENUM ('user', 'bot', 'staff');

-- --------------------
-- TABLES
-- --------------------
CREATE TABLE public.users (
  id serial PRIMARY KEY,
  supabase_id text NOT NULL UNIQUE,
  email text NOT NULL,
  name text,
  phone text,
  avatar_url text,
  role public.user_role NOT NULL DEFAULT 'user',
  is_banned boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10, 2) NOT NULL,
  category public.product_category NOT NULL,
  image_url text,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  dynamic_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  in_stock boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id serial PRIMARY KEY,
  user_id text,
  guest_name text,
  guest_email text,
  guest_phone text,
  product_id integer NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  game_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_amount numeric(10, 2) NOT NULL,
  discount_amount numeric(10, 2) NOT NULL DEFAULT 0,
  coupon_code text,
  status public.order_status NOT NULL DEFAULT 'pending',
  payment_screenshot_url text,
  admin_note text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
  id serial PRIMARY KEY,
  order_id integer NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  screenshot_url text NOT NULL,
  payment_method public.payment_method NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  admin_note text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.coupons (
  id serial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  discount_type public.discount_type NOT NULL,
  discount_value numeric(10, 2) NOT NULL,
  expires_at timestamp,
  usage_limit integer,
  usage_count integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  applicable_product_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.banners (
  id serial PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  image_url text,
  link_url text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_messages (
  id serial PRIMARY KEY,
  session_id text NOT NULL,
  user_id text,
  guest_name text,
  sender public.chat_sender NOT NULL,
  content text NOT NULL,
  read integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.payment_settings (
  id serial PRIMARY KEY,
  method text NOT NULL UNIQUE,
  label text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  account_name text,
  account_number text,
  qr_image_url text,
  instructions text,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.reviews (
  id serial PRIMARY KEY,
  user_id text,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  rejected boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- --------------------
-- INDEXES
-- --------------------
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_product_id ON public.orders(product_id);
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_chat_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_users_email_lower ON public.users (lower(email));

-- --------------------
-- UPDATED_AT TRIGGER
-- --------------------
CREATE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_payment_settings_updated_at BEFORE UPDATE ON public.payment_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- --------------------
-- HELPER FUNCTION
-- --------------------
CREATE FUNCTION public.is_admin_or_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.supabase_id = auth.uid()::text
      AND u.role IN ('admin', 'staff')
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_or_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_or_staff() TO anon, authenticated;

-- --------------------
-- ENABLE RLS
-- --------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- --------------------
-- STORAGE NOTE
-- --------------------
-- Supabase owns the storage schema objects, so this migration does not
-- alter storage.objects or storage.buckets directly.
-- Create the "gaming-store" bucket in the Supabase Dashboard:
--   Storage -> New bucket -> name: gaming-store -> Public: true
-- Then add the avatar/upload policies there if needed.

-- --------------------
-- TABLE POLICIES
-- --------------------
-- Products
CREATE POLICY "Public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_staff());
CREATE POLICY "Admins update products" ON public.products FOR UPDATE TO authenticated USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());
CREATE POLICY "Admins delete products" ON public.products FOR DELETE TO authenticated USING (public.is_admin_or_staff());

-- Orders
CREATE POLICY "Public read orders" ON public.orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());
CREATE POLICY "Admins delete orders" ON public.orders FOR DELETE TO authenticated USING (public.is_admin_or_staff());

-- Payments
CREATE POLICY "Public read payments" ON public.payments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert payments" ON public.payments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins update payments" ON public.payments FOR UPDATE TO authenticated USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());
CREATE POLICY "Admins delete payments" ON public.payments FOR DELETE TO authenticated USING (public.is_admin_or_staff());

-- Coupons
CREATE POLICY "Public read coupons" ON public.coupons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert coupons" ON public.coupons FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_staff());
CREATE POLICY "Admins update coupons" ON public.coupons FOR UPDATE TO authenticated USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());
CREATE POLICY "Admins delete coupons" ON public.coupons FOR DELETE TO authenticated USING (public.is_admin_or_staff());

-- Banners
CREATE POLICY "Public read banners" ON public.banners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert banners" ON public.banners FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_staff());
CREATE POLICY "Admins update banners" ON public.banners FOR UPDATE TO authenticated USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());
CREATE POLICY "Admins delete banners" ON public.banners FOR DELETE TO authenticated USING (public.is_admin_or_staff());

-- Payment settings
CREATE POLICY "Public read payment settings" ON public.payment_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert payment settings" ON public.payment_settings FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_staff());
CREATE POLICY "Admins update payment settings" ON public.payment_settings FOR UPDATE TO authenticated USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());
CREATE POLICY "Admins delete payment settings" ON public.payment_settings FOR DELETE TO authenticated USING (public.is_admin_or_staff());

-- Users
CREATE POLICY "Users read own profile" ON public.users FOR SELECT TO authenticated USING (supabase_id = auth.uid()::text);
CREATE POLICY "Admins read all users" ON public.users FOR SELECT TO authenticated USING (public.is_admin_or_staff());

CREATE POLICY "Users insert own profile" ON public.users FOR INSERT TO authenticated
WITH CHECK (
  (supabase_id = auth.uid()::text AND role = 'user')
  OR public.is_admin_or_staff()
);

CREATE POLICY "Users update own profile" ON public.users FOR UPDATE TO authenticated
USING (supabase_id = auth.uid()::text)
WITH CHECK (supabase_id = auth.uid()::text AND role = 'user');

CREATE POLICY "Admins update users" ON public.users FOR UPDATE TO authenticated
USING (public.is_admin_or_staff())
WITH CHECK (public.is_admin_or_staff());

CREATE POLICY "Admins delete users" ON public.users FOR DELETE TO authenticated
USING (public.is_admin_or_staff());

-- Reviews
CREATE POLICY "Public read approved reviews" ON public.reviews FOR SELECT TO anon, authenticated
USING ((approved = true AND rejected = false) OR public.is_admin_or_staff());
CREATE POLICY "Public insert reviews" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins update reviews" ON public.reviews FOR UPDATE TO authenticated USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());
CREATE POLICY "Admins delete reviews" ON public.reviews FOR DELETE TO authenticated USING (public.is_admin_or_staff());

-- Chat
CREATE POLICY "Public read chat messages" ON public.chat_messages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert chat messages" ON public.chat_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins delete chat messages" ON public.chat_messages FOR DELETE TO authenticated USING (public.is_admin_or_staff());

SELECT 'SCHEMA_AND_RLS_READY' AS status;
