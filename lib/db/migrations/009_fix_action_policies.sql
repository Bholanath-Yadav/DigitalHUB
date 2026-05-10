-- ============================================================
-- Migration 009: Fix action/update permissions after DB reset
--
-- Run this if actions like payment approve/reject, admin updates,
-- or profile avatar upload fail after recreating the database.
-- ============================================================

-- Ensure RLS is enabled on all app tables used by browser actions
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;

-- Public read + insert policies used by storefront
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read banners" ON banners;
CREATE POLICY "Public read banners"
  ON banners FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read payment settings" ON payment_settings;
CREATE POLICY "Public read payment settings"
  ON payment_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read orders" ON orders;
CREATE POLICY "Public read orders"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public insert orders" ON orders;
CREATE POLICY "Public insert orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public read payments" ON payments;
CREATE POLICY "Public read payments"
  ON payments FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public insert payments" ON payments;
CREATE POLICY "Public insert payments"
  ON payments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public read coupons" ON coupons;
CREATE POLICY "Public read coupons"
  ON coupons FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users read own profile" ON users;
CREATE POLICY "Users read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (supabase_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users insert own profile" ON users;
CREATE POLICY "Users insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (supabase_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users update own profile" ON users;
CREATE POLICY "Users update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (supabase_id = auth.uid()::text)
  WITH CHECK (supabase_id = auth.uid()::text);

-- Admin write permissions for all dashboard actions
DROP POLICY IF EXISTS "Admins insert products" ON products;
CREATE POLICY "Admins insert products" ON products FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "Admins update products" ON products;
CREATE POLICY "Admins update products" ON products FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "Admins delete products" ON products;
CREATE POLICY "Admins delete products" ON products FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "Admins insert banners" ON banners;
CREATE POLICY "Admins insert banners" ON banners FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "Admins update banners" ON banners;
CREATE POLICY "Admins update banners" ON banners FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "Admins delete banners" ON banners;
CREATE POLICY "Admins delete banners" ON banners FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "Admins insert coupons" ON coupons;
CREATE POLICY "Admins insert coupons" ON coupons FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "Admins update coupons" ON coupons;
CREATE POLICY "Admins update coupons" ON coupons FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "Admins delete coupons" ON coupons;
CREATE POLICY "Admins delete coupons" ON coupons FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "Admins insert payment_settings" ON payment_settings;
CREATE POLICY "Admins insert payment_settings" ON payment_settings FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "Admins update payment_settings" ON payment_settings;
CREATE POLICY "Admins update payment_settings" ON payment_settings FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "Admins delete payment_settings" ON payment_settings;
CREATE POLICY "Admins delete payment_settings" ON payment_settings FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "Admins update orders" ON orders;
CREATE POLICY "Admins update orders" ON orders FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "Admins delete orders" ON orders;
CREATE POLICY "Admins delete orders" ON orders FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "Admins update payments" ON payments;
CREATE POLICY "Admins update payments" ON payments FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "Admins delete payments" ON payments;
CREATE POLICY "Admins delete payments" ON payments FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "Admins update users" ON users;
CREATE POLICY "Admins update users" ON users FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')));

DROP POLICY IF EXISTS "Admins delete users" ON users;
CREATE POLICY "Admins delete users" ON users FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role IN ('admin', 'staff')));

-- Chat and reviews policies used by client app
DROP POLICY IF EXISTS "Public read chat messages" ON chat_messages;
CREATE POLICY "Public read chat messages"
  ON chat_messages FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public insert chat messages" ON chat_messages;
CREATE POLICY "Public insert chat messages"
  ON chat_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage reviews" ON reviews;
CREATE POLICY "Admin manage reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.supabase_id = auth.uid()::text
        AND u.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.supabase_id = auth.uid()::text
        AND u.role IN ('admin', 'staff')
    )
  );

-- Storage policies needed by browser-side uploads
DROP POLICY IF EXISTS "Auth users upload own avatar" ON storage.objects;
CREATE POLICY "Auth users upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'gaming-store'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Auth users update own avatar" ON storage.objects;
CREATE POLICY "Auth users update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'gaming-store'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'gaming-store'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Auth users delete own avatar" ON storage.objects;
CREATE POLICY "Auth users delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'gaming-store'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Public upload payment screenshots" ON storage.objects;
CREATE POLICY "Public upload payment screenshots"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'gaming-store'
    AND (storage.foldername(name))[1] = 'payment-screenshots'
  );

DROP POLICY IF EXISTS "Auth upload content images" ON storage.objects;
CREATE POLICY "Auth upload content images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'gaming-store'
    AND (storage.foldername(name))[1] IN ('product-images', 'banner-images', 'qr-codes')
  );

-- ============================================================
-- Ensure admin user is set up in public.users with correct role
-- This is required for RLS policies to grant admin write permissions
-- ============================================================

-- Upsert admin user: admin@digitalhub.com with UID d02ff351-72b3-45dd-a7ca-474ad82aa48a
INSERT INTO public.users (supabase_id, email, role)
VALUES (
  'd02ff351-72b3-45dd-a7ca-474ad82aa48a',
  'admin@digitalhub.com',
  'admin'
)
ON CONFLICT (supabase_id) DO UPDATE SET
  role = 'admin',
  email = 'admin@digitalhub.com',
  updated_at = now();
