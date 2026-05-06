-- Public read access for storefront data when using Supabase directly from the browser.
-- Run this in Supabase SQL editor after 001/002 migrations.

ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_settings ENABLE ROW LEVEL SECURITY;

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
