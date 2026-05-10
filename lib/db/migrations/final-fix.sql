-- ============================================================
-- FINAL FIX: Drop old policies and create fresh ones
-- ============================================================

-- Step 1: Drop ALL old policies on all tables
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

DROP POLICY IF EXISTS "Users read own profile" ON users;
DROP POLICY IF EXISTS "Users insert own profile" ON users;
DROP POLICY IF EXISTS "Users update own profile" ON users;
DROP POLICY IF EXISTS "Admins update users" ON users;
DROP POLICY IF EXISTS "Admins delete users" ON users;

-- Step 2: Create admin user
INSERT INTO public.users (supabase_id, email, role, name)
VALUES ('d02ff351-72b3-45dd-a7ca-474ad82aa48a', 'admin@digitalhub.com', 'admin', 'Admin')
ON CONFLICT (supabase_id) DO UPDATE SET role = 'admin';

-- Step 3: Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 4: Create PRODUCTS policies
CREATE POLICY "Public read products" ON products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert products" ON products FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));
CREATE POLICY "Admins update products" ON products FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff'))) WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));
CREATE POLICY "Admins delete products" ON products FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

-- Step 5: Create ORDERS policies
CREATE POLICY "Public read orders" ON orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert orders" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins update orders" ON orders FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff'))) WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));
CREATE POLICY "Admins delete orders" ON orders FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

-- Step 6: Create PAYMENTS policies
CREATE POLICY "Public read payments" ON payments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert payments" ON payments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins update payments" ON payments FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff'))) WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));
CREATE POLICY "Admins delete payments" ON payments FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

-- Step 7: Create COUPONS policies
CREATE POLICY "Public read coupons" ON coupons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert coupons" ON coupons FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));
CREATE POLICY "Admins update coupons" ON coupons FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff'))) WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));
CREATE POLICY "Admins delete coupons" ON coupons FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

-- Step 8: Create BANNERS policies
CREATE POLICY "Public read banners" ON banners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert banners" ON banners FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));
CREATE POLICY "Admins update banners" ON banners FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff'))) WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));
CREATE POLICY "Admins delete banners" ON banners FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

-- Step 9: Create USERS policies
CREATE POLICY "Users read own profile" ON users FOR SELECT TO authenticated USING (supabase_id = auth.uid()::text);
CREATE POLICY "Users insert own profile" ON users FOR INSERT TO authenticated WITH CHECK (supabase_id = auth.uid()::text);
CREATE POLICY "Users update own profile" ON users FOR UPDATE TO authenticated USING (supabase_id = auth.uid()::text) WITH CHECK (supabase_id = auth.uid()::text);
CREATE POLICY "Admins update users" ON users FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff'))) WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));
CREATE POLICY "Admins delete users" ON users FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

-- Step 10: Verify everything is set up
SELECT '✅ SETUP COMPLETE' as result;
SELECT COUNT(*) as admin_users FROM public.users WHERE role = 'admin';
SELECT COUNT(*) as product_policies FROM pg_policies WHERE tablename = 'products';
SELECT COUNT(*) as order_policies FROM pg_policies WHERE tablename = 'orders';
SELECT COUNT(*) as payment_policies FROM pg_policies WHERE tablename = 'payments';
SELECT COUNT(*) as coupon_policies FROM pg_policies WHERE tablename = 'coupons';
