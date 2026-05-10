-- ============================================================
-- ROOT CAUSE: Check if users table RLS is blocking policy checks
-- ============================================================

-- Check RLS status on users table
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';

-- Check policies on users table
SELECT policyname, permissive, roles, qual FROM pg_policies WHERE tablename = 'users';

-- Try to read users table directly (as admin would see it)
SELECT id, supabase_id, email, role FROM public.users LIMIT 5;

-- Check if admin user exists
SELECT COUNT(*) as admin_count FROM public.users WHERE role = 'admin';
