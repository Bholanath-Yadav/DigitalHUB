-- ============================================================
-- ADMIN SETUP GUIDE AND SCRIPT
-- ============================================================
-- Follow these steps to fix admin access:

-- STEP 1: Run diagnostic to understand current state
-- Copy/run the contents of diagnostic-complete.sql in Supabase SQL Editor
-- This will show you:
--   - Which RLS policies are enabled
--   - How many admins exist in the database
--   - The supabase_id of each admin

-- STEP 2: Get your current user's UUID
-- When you log in with Supabase Auth, copy this code and paste in browser console:
-- const { data: { user } } = await supabase.auth.getUser();
-- console.log(user.id); // This is your UUID - keep it handy

-- STEP 3: Update the admin user in the database
-- ⚠️  IMPORTANT: Replace 'YOUR-UUID-HERE' with the actual UUID from Step 2
-- Example: If your UUID is '12345678-1234-1234-1234-123456789abc', the query becomes:
-- UPDATE public.users SET supabase_id = '12345678-1234-1234-1234-123456789abc', role = 'admin' WHERE email = 'admin@digitalhub.com';

-- FIRST: Check if there's an invalid placeholder entry to delete
DELETE FROM public.users WHERE supabase_id = 'YOUR-UUID-HERE';

-- THEN: Run this AFTER replacing 'YOUR-UUID-HERE' with your actual UUID from Step 2:
UPDATE public.users
SET supabase_id = 'YOUR-UUID-HERE', role = 'admin'
WHERE email = 'admin@digitalhub.com';

-- Verify the update worked:
SELECT supabase_id, email, role FROM public.users WHERE email = 'admin@digitalhub.com';

-- STEP 4: Test permissions
-- Try to update an order status from the admin dashboard
-- If it fails, run the diagnostic again and check:
--   1. Is supabase_id set correctly?
--   2. Is role set to 'admin'?
--   3. Are RLS policies enabled on all tables?

-- STEP 5: If still failing, check the actual RLS policy
-- The policy checks:
--   EXISTS (SELECT 1 FROM public.users 
--     WHERE supabase_id = auth.uid()::text AND role IN ('admin', 'staff'))
-- This means:
--   - Your auth.uid() (UUID from login) must match supabase_id in users table
--   - Your role must be 'admin' or 'staff'
--   - The users table must have your entry

-- ============================================================
-- TROUBLESHOOTING COMMON ISSUES
-- ============================================================

-- Issue 1: "Policy with check violation" when updating orders
-- Cause: supabase_id doesn't match your actual auth.uid()
-- Fix: Run diagnostic to get your current UUID and update it

-- Issue 2: Multiple admin users exist
-- Solution: Keep only ONE admin with the correct UUID
DELETE FROM public.users
WHERE role = 'admin' 
  AND supabase_id NOT IN ('KEEP-THIS-UUID-ONLY')
  AND email != 'PRIMARY-ADMIN-EMAIL@example.com';

-- Issue 3: No admin users in database at all
-- Solution: Make sure at least one user is set as admin:
UPDATE public.users SET role = 'admin' WHERE email = 'YOUR-EMAIL@example.com';

-- Issue 4: Users table is empty
-- Solution: Insert your admin user manually
INSERT INTO public.users (supabase_id, email, role, name)
VALUES ('YOUR-UUID-HERE', 'YOUR-EMAIL@example.com', 'admin', 'Admin Name')
ON CONFLICT (supabase_id) DO UPDATE SET role = 'admin';

-- ============================================================
-- ADVANCED: Reset all admin policies if completely broken
-- ============================================================
-- Only run this if everything is broken and you need a fresh start

-- 1. First, backup the existing setup by running diagnostic
-- 2. Drop all existing policies (be careful!)
DROP POLICY IF EXISTS "Products: Public read" ON products;
DROP POLICY IF EXISTS "Products: Admins insert" ON products;
DROP POLICY IF EXISTS "Products: Admins update" ON products;
DROP POLICY IF EXISTS "Products: Admins delete" ON products;
-- ... (continue for all tables)

-- 3. Re-run the 010_comprehensive-rls-fix.sql migration
-- 4. Make sure admin user is set up correctly
-- 5. Test again

-- ============================================================
-- VERIFICATION CHECKLIST
-- ============================================================
-- Before reporting a bug, verify:
-- ☐ You ran the 010_comprehensive-rls-fix.sql migration
-- ☐ You ran the diagnostic and confirmed admin user exists
-- ☐ Your supabase_id in users table matches your auth.uid()
-- ☐ Your role is set to 'admin' or 'staff'
-- ☐ RLS is enabled on orders and payments tables
-- ☐ You are logged in with Supabase Auth (not as anonymous)
-- ☐ Your browser console shows no CORS or auth errors
