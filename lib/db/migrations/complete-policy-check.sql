-- Check ALL policies on ALL tables
SELECT 'COMPLETE POLICY CHECK' as section;

SELECT 'PRODUCTS POLICIES' as table_name;
SELECT policyname FROM pg_policies WHERE tablename = 'products' ORDER BY policyname;

SELECT 'ORDERS POLICIES' as table_name;
SELECT policyname FROM pg_policies WHERE tablename = 'orders' ORDER BY policyname;

SELECT 'PAYMENTS POLICIES' as table_name;
SELECT policyname FROM pg_policies WHERE tablename = 'payments' ORDER BY policyname;

SELECT 'COUPONS POLICIES' as table_name;
SELECT policyname FROM pg_policies WHERE tablename = 'coupons' ORDER BY policyname;

-- Check admin user
SELECT 'ADMIN USER' as check_name;
SELECT COUNT(*) as admin_count, role FROM public.users WHERE role = 'admin' GROUP BY role;

-- Check if all tables have RLS enabled
SELECT 'RLS STATUS' as check_name;
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('products', 'orders', 'payments', 'coupons', 'users')
ORDER BY tablename;
