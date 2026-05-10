-- ============================================================
-- DIAGNOSTIC SCRIPT: Check RLS configuration and admin status
-- Run this to diagnose issues
-- ============================================================

SELECT '📋 === DIAGNOSTIC REPORT ===' as header;

-- Check 1: RLS enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('products', 'orders', 'payments', 'coupons', 'banners', 'payment_settings', 'users', 'chat_messages', 'reviews')
ORDER BY tablename;

-- Check 2: Policy count per table
SELECT '📊 Policies per table:' as check_header;
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Check 3: Admin users in database
SELECT '👤 Admin users in database:' as check_header;
SELECT 
  id,
  supabase_id,
  email,
  role,
  name,
  created_at
FROM public.users
WHERE role IN ('admin', 'staff')
ORDER BY created_at DESC;

-- Check 4: Total users
SELECT 
  COUNT(*) as total_users,
  SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
  SUM(CASE WHEN role = 'staff' THEN 1 ELSE 0 END) as staff_count,
  SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as user_count
FROM public.users;

-- Check 5: List all policies for orders table
SELECT '🔐 Order UPDATE/DELETE policies:' as check_header;
SELECT 
  policyname,
  qual as condition,
  with_check
FROM pg_policies
WHERE tablename = 'orders'
  AND cmd IN ('UPDATE', 'DELETE')
ORDER BY policyname;

-- Check 6: Orders and Payments count
SELECT 
  (SELECT COUNT(*) FROM orders) as total_orders,
  (SELECT COUNT(*) FROM payments) as total_payments,
  (SELECT COUNT(*) FROM products) as total_products;
