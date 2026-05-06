-- Public read/write access for the browser app when using Supabase directly.
-- Run this in Supabase SQL editor after 001/002 migrations.

ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read banners" ON banners;
CREATE POLICY "Public read banners"
  ON banners FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read payment settings" ON payment_settings;
CREATE POLICY "Public read payment settings"
  ON payment_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read coupons" ON coupons;
CREATE POLICY "Public read coupons"
  ON coupons FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users read own profile" ON users;
CREATE POLICY "Users read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (supabase_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users insert own profile" ON users;
CREATE POLICY "Users insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (supabase_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users update own profile" ON users;
CREATE POLICY "Users update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (supabase_id = auth.uid()::text);

-- Chat messages: allow anyone to read messages from a specific session
DROP POLICY IF EXISTS "Public read chat messages" ON chat_messages;
CREATE POLICY "Public read chat messages"
  ON chat_messages FOR SELECT
  TO anon, authenticated
  USING (true);

-- Chat messages: allow anyone to insert messages (guest or authenticated)
DROP POLICY IF EXISTS "Public insert chat messages" ON chat_messages;
CREATE POLICY "Public insert chat messages"
  ON chat_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
