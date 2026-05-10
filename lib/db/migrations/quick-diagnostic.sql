-- Quick diagnostic to find the exact issue

-- 1. Check admin user exists
SELECT 'Admin Users' as check;
SELECT id, supabase_id, email, role FROM public.users WHERE role = 'admin';

-- 2. Check all users
SELECT 'All Users' as check;
SELECT id, supabase_id, email, role FROM public.users;

-- 3. Check RLS enabled on products
SELECT 'RLS on products' as check;
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'products';

-- 4. Count policies on products table
SELECT 'Policies on products' as check;
SELECT COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'products';

-- 5. List product policies
SELECT policyname, roles FROM pg_policies WHERE tablename = 'products' LIMIT 10;
