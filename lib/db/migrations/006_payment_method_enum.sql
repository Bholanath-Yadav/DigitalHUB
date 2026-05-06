-- Extend payment_method enum to support all checkout methods used by the app.
-- Run this in Supabase SQL editor after the base schema has been applied.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'payment_method'
      AND e.enumlabel = 'connectips'
  ) THEN
    ALTER TYPE payment_method ADD VALUE 'connectips';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'payment_method'
      AND e.enumlabel = 'bank'
  ) THEN
    ALTER TYPE payment_method ADD VALUE 'bank';
  END IF;
END $$;
