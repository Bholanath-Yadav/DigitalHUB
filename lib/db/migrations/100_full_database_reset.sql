-- ============================================================
-- Migration 100: FULL APP DATABASE RESET (PUBLIC SCHEMA OBJECTS)
-- ============================================================
-- What this resets:
--   - All app tables in public schema
--   - All custom enum types used by the app
--   - App helper functions in public schema
--   - App storage bucket data for gaming-store
--
-- What this does NOT reset:
--   - auth.users accounts (Supabase Auth users remain)
--   - other Supabase system schemas
-- ============================================================

-- Optional: reset app bucket using Storage API functions (direct DELETE is blocked)
DO $$
BEGIN
	IF to_regprocedure('storage.empty_bucket(text)') IS NOT NULL THEN
		PERFORM storage.empty_bucket('gaming-store');
	END IF;

	IF to_regprocedure('storage.delete_bucket(text)') IS NOT NULL THEN
		PERFORM storage.delete_bucket('gaming-store');
	END IF;
EXCEPTION WHEN OTHERS THEN
	-- Ignore bucket cleanup failures so schema reset can still continue.
	NULL;
END $$;

-- Drop app tables (CASCADE removes dependent policies/triggers/indexes)
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.banners CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.payment_settings CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;

-- Drop helper functions if present
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_or_staff() CASCADE;

-- Drop app enum types
DROP TYPE IF EXISTS public.chat_sender CASCADE;
DROP TYPE IF EXISTS public.discount_type CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;
DROP TYPE IF EXISTS public.payment_method CASCADE;
DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.product_category CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

SELECT 'RESET_COMPLETE' AS status;
