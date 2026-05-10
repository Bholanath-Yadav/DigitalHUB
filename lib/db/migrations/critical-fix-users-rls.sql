-- ============================================================
-- CRITICAL FIX: Allow policies to check admin role
-- The RLS policies need to be able to read admin roles from users table
-- ============================================================

-- Drop problematic policies on users table
DROP POLICY IF EXISTS "Users read own profile" ON users;
DROP POLICY IF EXISTS "Users insert own profile" ON users;
DROP POLICY IF EXISTS "Users update own profile" ON users;
DROP POLICY IF EXISTS "Admins update users" ON users;
DROP POLICY IF EXISTS "Admins delete users" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: Allow authenticated users to READ admin/staff roles (needed for policy checks)
CREATE POLICY "Authenticated can read admin roles" ON users FOR SELECT
  TO authenticated
  USING (true);  -- Allow all reads by authenticated users

-- Users can insert their own profile
CREATE POLICY "Users insert own profile" ON users FOR INSERT
  TO authenticated
  WITH CHECK (supabase_id = auth.uid()::text);

-- Users can update their own profile
CREATE POLICY "Users update own profile" ON users FOR UPDATE
  TO authenticated
  USING (supabase_id = auth.uid()::text)
  WITH CHECK (supabase_id = auth.uid()::text);

-- Admins can update any user
CREATE POLICY "Admins update users" ON users FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff')));

-- Verify admin user exists
INSERT INTO public.users (supabase_id, email, role, name)
VALUES ('d02ff351-72b3-45dd-a7ca-474ad82aa48a', 'admin@digitalhub.com', 'admin', 'Admin')
ON CONFLICT (supabase_id) DO UPDATE SET role = 'admin';

-- Now re-verify all other policies work
SELECT 'Admin user' as check_name;
SELECT id, email, role FROM public.users WHERE role = 'admin';

SELECT 'Users table RLS' as check_name;
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';

SELECT 'Users policies' as check_name;
SELECT policyname FROM pg_policies WHERE tablename = 'users';
