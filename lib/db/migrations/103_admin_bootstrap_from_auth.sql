-- ============================================================
-- Migration 103: ADMIN BOOTSTRAP FROM AUTH USER
-- ============================================================
-- Run after 101 and 102
-- Replace the email below if needed.
-- This script guarantees one clean admin row mapped to auth.users.id.
-- ============================================================

-- 1) Remove obvious placeholder/bad rows
DELETE FROM public.users
WHERE supabase_id IN ('YOUR-UUID-HERE', '00000000-0000-0000-0000-000000000000');

-- 2) Upsert admin row from auth.users
INSERT INTO public.users (supabase_id, email, name, role, is_banned)
SELECT
  au.id::text,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  'admin'::public.user_role,
  false
FROM auth.users au
WHERE lower(au.email) = lower('admin@digitalhub.com')
ON CONFLICT (supabase_id) DO UPDATE
SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = 'admin'::public.user_role,
  is_banned = false,
  updated_at = now();

-- 3) Remove duplicate rows by same email with wrong supabase_id
DELETE FROM public.users u
WHERE lower(u.email) = lower('admin@digitalhub.com')
  AND u.supabase_id <> (
    SELECT au.id::text
    FROM auth.users au
    WHERE lower(au.email) = lower('admin@digitalhub.com')
    ORDER BY au.created_at DESC
    LIMIT 1
  );

-- 4) Verify
SELECT id, supabase_id, email, role
FROM public.users
WHERE lower(email) = lower('admin@digitalhub.com');

SELECT id, email
FROM auth.users
WHERE lower(email) = lower('admin@digitalhub.com');
