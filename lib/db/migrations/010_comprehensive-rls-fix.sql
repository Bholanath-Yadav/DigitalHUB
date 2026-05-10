-- ============================================================
-- MIGRATION 010: COMPREHENSIVE RLS FIX
-- Fixes all permission issues for admin actions
-- ============================================================

-- CRITICAL: Drop all problematic old policies
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Admins insert products" ON products;
DROP POLICY IF EXISTS "Admins update products" ON products;
DROP POLICY IF EXISTS "Admins delete products" ON products;

DROP POLICY IF EXISTS "Public read orders" ON orders;
DROP POLICY IF EXISTS "Public insert orders" ON orders;
DROP POLICY IF EXISTS "Admins update orders" ON orders;
DROP POLICY IF EXISTS "Admins delete orders" ON orders;

DROP POLICY IF EXISTS "Public read payments" ON payments;
DROP POLICY IF EXISTS "Public insert payments" ON payments;
DROP POLICY IF EXISTS "Admins update payments" ON payments;
DROP POLICY IF EXISTS "Admins delete payments" ON payments;

DROP POLICY IF EXISTS "Public read coupons" ON coupons;
DROP POLICY IF EXISTS "Admins insert coupons" ON coupons;
DROP POLICY IF EXISTS "Admins update coupons" ON coupons;
DROP POLICY IF EXISTS "Admins delete coupons" ON coupons;

DROP POLICY IF EXISTS "Public read banners" ON banners;
DROP POLICY IF EXISTS "Admins insert banners" ON banners;
DROP POLICY IF EXISTS "Admins update banners" ON banners;
DROP POLICY IF EXISTS "Admins delete banners" ON banners;

DROP POLICY IF EXISTS "Public read payment settings" ON payment_settings;
DROP POLICY IF EXISTS "Admins insert payment_settings" ON payment_settings;
DROP POLICY IF EXISTS "Admins update payment_settings" ON payment_settings;
DROP POLICY IF EXISTS "Admins delete payment_settings" ON payment_settings;

DROP POLICY IF EXISTS "Users read own profile" ON users;
DROP POLICY IF EXISTS "Users insert own profile" ON users;
DROP POLICY IF EXISTS "Users update own profile" ON users;
DROP POLICY IF EXISTS "Admins update users" ON users;
DROP POLICY IF EXISTS "Admins delete users" ON users;

DROP POLICY IF EXISTS "Users read own chat" ON chat_messages;
DROP POLICY IF EXISTS "Admins read all chats" ON chat_messages;
DROP POLICY IF EXISTS "Public read public chats" ON chat_messages;
DROP POLICY IF EXISTS "Public insert chat" ON chat_messages;

DROP POLICY IF EXISTS "Public read reviews" ON reviews;
DROP POLICY IF EXISTS "Public insert reviews" ON reviews;

-- ============================================================
-- STEP 1: Enable RLS on ALL tables
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: Ensure admin user exists and is properly configured
-- ============================================================
-- Note: After running this, the admin must log in with Supabase Auth
-- and then run the next migration to update their entry with the correct UUID

-- For now, try to insert a placeholder if admin doesn't exist
-- This will be populated with the real UUID once admin logs in
INSERT INTO public.users (supabase_id, email, role, name)
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@digitalhub.com', 'admin', 'Admin User')
ON CONFLICT (supabase_id) DO NOTHING;

-- ============================================================
-- STEP 3: PRODUCTS - Public read, Admin write
-- ============================================================
CREATE POLICY "Products: Public read"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Products: Admins insert"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Products: Admins update"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Products: Admins delete"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

-- ============================================================
-- STEP 4: ORDERS - Public read/insert, Admin update/delete
-- ============================================================
CREATE POLICY "Orders: Public read"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Orders: Public insert"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Orders: Admins update"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Orders: Admins delete"
  ON orders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

-- ============================================================
-- STEP 5: PAYMENTS - Public read/insert, Admin update/delete
-- ============================================================
CREATE POLICY "Payments: Public read"
  ON payments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Payments: Public insert"
  ON payments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Payments: Admins update"
  ON payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Payments: Admins delete"
  ON payments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

-- ============================================================
-- STEP 6: COUPONS - Public read, Admin write
-- ============================================================
CREATE POLICY "Coupons: Public read"
  ON coupons FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Coupons: Admins insert"
  ON coupons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Coupons: Admins update"
  ON coupons FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Coupons: Admins delete"
  ON coupons FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

-- ============================================================
-- STEP 7: BANNERS - Public read, Admin write
-- ============================================================
CREATE POLICY "Banners: Public read"
  ON banners FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Banners: Admins insert"
  ON banners FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Banners: Admins update"
  ON banners FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Banners: Admins delete"
  ON banners FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

-- ============================================================
-- STEP 8: PAYMENT SETTINGS - Public read, Admin write
-- ============================================================
CREATE POLICY "Payment Settings: Public read"
  ON payment_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Payment Settings: Admins insert"
  ON payment_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Payment Settings: Admins update"
  ON payment_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Payment Settings: Admins delete"
  ON payment_settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

-- ============================================================
-- STEP 9: USERS - Users read/update own, Admins read/write all
-- ============================================================
CREATE POLICY "Users: Read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (supabase_id = auth.uid()::text);

CREATE POLICY "Users: Insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (supabase_id = auth.uid()::text);

CREATE POLICY "Users: Update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (supabase_id = auth.uid()::text)
  WITH CHECK (supabase_id = auth.uid()::text);

CREATE POLICY "Users: Admins read all"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Users: Admins update any"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Users: Admins delete any"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

-- ============================================================
-- STEP 10: CHAT MESSAGES - Users insert own, Admins manage all
-- ============================================================
CREATE POLICY "Chat: Admins read all"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Chat: Public read"
  ON chat_messages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Chat: Public insert"
  ON chat_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================
-- STEP 11: REVIEWS - Public read/insert, Admins delete
-- ============================================================
CREATE POLICY "Reviews: Public read"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Reviews: Public insert"
  ON reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Reviews: Admins delete"
  ON reviews FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE supabase_id = auth.uid()::text 
      AND role IN ('admin', 'staff')
    )
  );

-- ============================================================
-- STEP 12: Verify setup
-- ============================================================
SELECT '✅ Migration 010 complete: All RLS policies recreated' as status;

-- Check policies created
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
