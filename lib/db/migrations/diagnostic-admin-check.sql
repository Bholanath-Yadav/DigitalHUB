-- ============================================================
-- Diagnostic: Check admin setup and RLS configuration
-- Run this to troubleshoot why admin actions are failing
-- ============================================================

-- 1. Check if admin user exists in public.users
SELECT 'ADMIN USER CHECK' as check_name;
SELECT id, supabase_id, email, role, created_at FROM public.users WHERE role = 'admin' LIMIT 5;

-- 2. Check what the specific admin user ID maps to
SELECT 'ADMIN UID MAPPING' as check_name;
SELECT id, supabase_id, email, role FROM public.users 
WHERE supabase_id = 'd02ff351-72b3-45dd-a7ca-474ad82aa48a';

-- 3. Verify RLS is enabled on key tables
SELECT 'RLS STATUS ON TABLES' as check_name;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('products', 'orders', 'payments', 'coupons', 'users')
ORDER BY tablename;

-- 4. List all policies on products table
SELECT 'POLICIES ON PRODUCTS TABLE' as check_name;
SELECT policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY policyname;

-- 5. List all policies on orders table  
SELECT 'POLICIES ON ORDERS TABLE' as check_name;
SELECT policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;

-- 6. List all policies on payments table
SELECT 'POLICIES ON PAYMENTS TABLE' as check_name;
SELECT policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'payments'
ORDER BY policyname;

-- 7. List all policies on users table
SELECT 'POLICIES ON USERS TABLE' as check_name;
SELECT policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 8. Count total rows in products, orders, payments
SELECT 'DATA COUNT' as check_name;
SELECT 'products' as table_name, COUNT(*) as row_count FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'coupons', COUNT(*) FROM coupons
UNION ALL
SELECT 'users', COUNT(*) FROM users;
