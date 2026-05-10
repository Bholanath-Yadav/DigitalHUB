-- ============================================================
-- Migration 104: ADMIN FLOW DIAGNOSTIC
-- ============================================================
-- Run after 103 to verify everything needed by admin dashboard.
-- ============================================================

-- RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users','products','orders','payments','coupons','banners','payment_settings','reviews','chat_messages')
ORDER BY tablename;

-- Policy counts
SELECT tablename, count(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Admin mapping validity
SELECT
  u.id,
  u.supabase_id,
  u.email,
  u.role,
  (u.supabase_id IN (SELECT au.id::text FROM auth.users au)) AS exists_in_auth
FROM public.users u
WHERE u.role IN ('admin', 'staff')
ORDER BY u.created_at DESC;

-- Required statuses present in enums
SELECT unnest(enum_range(NULL::public.order_status)) AS order_status_values;
SELECT unnest(enum_range(NULL::public.payment_status)) AS payment_status_values;

-- Basic table health
SELECT
  (SELECT count(*) FROM public.products) AS products,
  (SELECT count(*) FROM public.orders) AS orders,
  (SELECT count(*) FROM public.payments) AS payments,
  (SELECT count(*) FROM public.users) AS users,
  (SELECT count(*) FROM public.coupons) AS coupons,
  (SELECT count(*) FROM public.banners) AS banners;

SELECT 'DIAGNOSTIC_COMPLETE' AS status;
