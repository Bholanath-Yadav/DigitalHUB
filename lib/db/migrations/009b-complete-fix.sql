-- ============================================================
-- Migration 009B: COMPLETE FIX - Policies + Admin User
-- Run this to fix all admin action failures
-- ============================================================

-- STEP 1: Ensure RLS is disabled then re-enabled (fresh start)
ALTER TABLE IF EXISTS products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Admins insert products" ON products;
DROP POLICY IF EXISTS "Admins update products" ON products;
DROP POLICY IF EXISTS "Admins delete products" ON products;

DROP POLICY IF EXISTS "Public read banners" ON banners;
DROP POLICY IF EXISTS "Admins insert banners" ON banners;
DROP POLICY IF EXISTS "Admins update banners" ON banners;
DROP POLICY IF EXISTS "Admins delete banners" ON banners;

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

DROP POLICY IF EXISTS "Users read own profile" ON users;
DROP POLICY IF EXISTS "Users insert own profile" ON users;
DROP POLICY IF EXISTS "Users update own profile" ON users;
DROP POLICY IF EXISTS "Admins update users" ON users;
DROP POLICY IF EXISTS "Admins delete users" ON users;

-- STEP 2: Create admin user FIRST (required for policies)
INSERT INTO public.users (supabase_id, email, role, name)
VALUES (
  'd02ff351-72b3-45dd-a7ca-474ad82aa48a',
  'admin@digitalhub.com',
  'admin',
  'Admin'
)
ON CONFLICT (supabase_id) DO UPDATE SET
  role = 'admin',
  email = 'admin@digitalhub.com',
  updated_at = now();

-- STEP 3: Re-enable RLS
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create PRODUCTS policies
CREATE POLICY "Public read products" ON products FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "Admins insert products" ON products FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

CREATE POLICY "Admins update products" ON products FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

CREATE POLICY "Admins delete products" ON products FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

-- STEP 5: Create ORDERS policies
CREATE POLICY "Public read orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "Public insert orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins update orders" ON orders FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

CREATE POLICY "Admins delete orders" ON orders FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

-- STEP 6: Create PAYMENTS policies
CREATE POLICY "Public read payments" ON payments FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "Public insert payments" ON payments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins update payments" ON payments FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

CREATE POLICY "Admins delete payments" ON payments FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

-- STEP 7: Create COUPONS policies
CREATE POLICY "Public read coupons" ON coupons FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "Admins insert coupons" ON coupons FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

CREATE POLICY "Admins update coupons" ON coupons FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

CREATE POLICY "Admins delete coupons" ON coupons FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

-- STEP 8: Create BANNERS policies
CREATE POLICY "Public read banners" ON banners FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "Admins insert banners" ON banners FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

CREATE POLICY "Admins update banners" ON banners FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

CREATE POLICY "Admins delete banners" ON banners FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

-- STEP 9: Create USERS policies
CREATE POLICY "Users read own profile" ON users FOR SELECT
  TO authenticated
  USING (supabase_id = auth.uid()::text);

CREATE POLICY "Users insert own profile" ON users FOR INSERT
  TO authenticated
  WITH CHECK (supabase_id = auth.uid()::text);

CREATE POLICY "Users update own profile" ON users FOR UPDATE
  TO authenticated
  USING (supabase_id = auth.uid()::text)
  WITH CHECK (supabase_id = auth.uid()::text);

CREATE POLICY "Admins update users" ON users FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

CREATE POLICY "Admins delete users" ON users FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

-- STEP 10: Verify
SELECT 'VERIFICATION' as step;
SELECT 'Admin User' as check_name;
SELECT id, email, role FROM public.users WHERE role = 'admin';

SELECT 'Policies on Products' as check_name;
SELECT COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'products';

SELECT 'Policies on Orders' as check_name;
SELECT COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'orders';

SELECT 'Policies on Payments' as check_name;
SELECT COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'payments';

SELECT 'Policies on Coupons' as check_name;
SELECT COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'coupons';
