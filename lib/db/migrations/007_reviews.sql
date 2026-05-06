-- Migration 007: reviews table + RLS policies

DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS reviews (
    id serial PRIMARY KEY,
    user_id text,
    guest_name text NOT NULL,
    guest_email text NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content text NOT NULL,
    approved boolean NOT NULL DEFAULT false,
    rejected boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  );
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_reviews_rejected ON reviews(rejected);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

DROP POLICY IF EXISTS "Public select approved reviews" ON reviews;
CREATE POLICY "Public select approved reviews"
  ON reviews FOR SELECT
  USING (approved = true AND rejected = false);

DROP POLICY IF EXISTS "Public insert review" ON reviews;
CREATE POLICY "Public insert review"
  ON reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    approved = false
    AND rejected = false
    AND (user_id IS NULL OR user_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Admin manage reviews" ON reviews;
CREATE POLICY "Admin manage reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users u
      WHERE u.supabase_id = auth.uid()::text
        AND u.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users u
      WHERE u.supabase_id = auth.uid()::text
        AND u.role IN ('admin', 'staff')
    )
  );
