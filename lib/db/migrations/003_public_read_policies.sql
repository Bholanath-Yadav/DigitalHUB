-- Public read/write access for the browser app when using Supabase directly.
-- Run this in Supabase SQL editor after 001/002 migrations.

ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
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

DROP POLICY IF EXISTS "Public read orders" ON orders;
CREATE POLICY "Public read orders"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public insert orders" ON orders;
CREATE POLICY "Public insert orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

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

DROP POLICY IF EXISTS "Public read payments" ON payments;
CREATE POLICY "Public read payments"
  ON payments FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public insert payments" ON payments;
CREATE POLICY "Public insert payments"
  ON payments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Chat messages: allow anyone to insert messages (guest or authenticated)
DROP POLICY IF EXISTS "Public insert chat messages" ON chat_messages;
CREATE POLICY "Public insert chat messages"
  ON chat_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Storage uploads used by the browser app
DROP POLICY IF EXISTS "Public upload payment screenshots" ON storage.objects;
CREATE POLICY "Public upload payment screenshots"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'gaming-store'
    AND (storage.foldername(name))[1] = 'payment-screenshots'
  );

DROP POLICY IF EXISTS "Auth upload content images" ON storage.objects;
CREATE POLICY "Auth upload content images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'gaming-store'
    AND (storage.foldername(name))[1] IN ('product-images', 'banner-images', 'qr-codes')
  );
