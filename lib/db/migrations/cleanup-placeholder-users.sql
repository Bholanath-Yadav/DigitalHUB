-- ============================================================
-- CLEANUP: Remove placeholder entries
-- Run this first to clean up any 'YOUR-UUID-HERE' duplicates
-- ============================================================

-- Delete the invalid placeholder entry
DELETE FROM public.users WHERE supabase_id = 'YOUR-UUID-HERE';

-- Verify it's gone
SELECT COUNT(*) as remaining_invalid_entries FROM public.users WHERE supabase_id = 'YOUR-UUID-HERE';

-- Check what admin users remain
SELECT id, supabase_id, email, role FROM public.users WHERE role = 'admin' ORDER BY created_at DESC;

-- ============================================================
-- Now proceed with proper admin setup
-- ============================================================
-- STEP 1: Get your actual UUID
-- Login to the app, open browser console (F12), paste:
-- const { data: { user } } = await supabase.auth.getUser();
-- console.log("Your UUID:", user.id);
-- Copy the UUID that appears

-- STEP 2: Use that UUID in this query (REPLACE 'ACTUAL-UUID-HERE' with your UUID):
-- Example: '12345678-1234-1234-1234-123456789abc'

-- UPDATE public.users
-- SET supabase_id = 'ACTUAL-UUID-HERE', role = 'admin'
-- WHERE email = 'admin@digitalhub.com';

-- STEP 3: Verify
-- SELECT supabase_id, email, role FROM public.users WHERE email = 'admin@digitalhub.com';
