-- Migration 106: Fix serial sequences after manual imports/resets
-- Symptom:
--   duplicate key value violates unique constraint "products_pkey" (23505)
-- Cause:
--   The sequence behind serial PKs is behind MAX(id), so nextval() returns an existing ID.
--
-- Safe to run multiple times.

SELECT setval(
  pg_get_serial_sequence('public.products', 'id'),
  COALESCE((SELECT MAX(id) FROM public.products), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('public.banners', 'id'),
  COALESCE((SELECT MAX(id) FROM public.banners), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('public.orders', 'id'),
  COALESCE((SELECT MAX(id) FROM public.orders), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('public.payments', 'id'),
  COALESCE((SELECT MAX(id) FROM public.payments), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('public.coupons', 'id'),
  COALESCE((SELECT MAX(id) FROM public.coupons), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('public.users', 'id'),
  COALESCE((SELECT MAX(id) FROM public.users), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('public.chat_messages', 'id'),
  COALESCE((SELECT MAX(id) FROM public.chat_messages), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('public.payment_settings', 'id'),
  COALESCE((SELECT MAX(id) FROM public.payment_settings), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('public.reviews', 'id'),
  COALESCE((SELECT MAX(id) FROM public.reviews), 0) + 1,
  false
);

SELECT 'SEQUENCES_RESYNCED' AS status;
