-- Admin write policies: allow authenticated users who are admin to INSERT/UPDATE/DELETE on admin tables
-- Run this after 001/003 migrations in Supabase SQL editor.

-- Helper condition: authenticated user is admin
-- We use EXISTS to check users table for a matching supabase_id with role = 'admin'.

-- Products
DROP POLICY IF EXISTS "Admins modify products" ON products;
CREATE POLICY "Admins insert products" ON products FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'));
CREATE POLICY "Admins update products" ON products FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'));
CREATE POLICY "Admins delete products" ON products FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'));

-- Banners
DROP POLICY IF EXISTS "Admins modify banners" ON banners;
CREATE POLICY "Admins insert banners" ON banners FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'));
CREATE POLICY "Admins update banners" ON banners FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'));
CREATE POLICY "Admins delete banners" ON banners FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'));

-- Coupons
DROP POLICY IF EXISTS "Admins modify coupons" ON coupons;
CREATE POLICY "Admins insert coupons" ON coupons FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'));
CREATE POLICY "Admins update coupons" ON coupons FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'));
CREATE POLICY "Admins delete coupons" ON coupons FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'));

-- Payment settings
DROP POLICY IF EXISTS "Admins modify payment_settings" ON payment_settings;
CREATE POLICY "Admins insert payment_settings" ON payment_settings FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'));
CREATE POLICY "Admins update payment_settings" ON payment_settings FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'));
CREATE POLICY "Admins delete payment_settings" ON payment_settings FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'));

-- Orders: allow admins to update/delete (customers can insert)
DROP POLICY IF EXISTS "Admins update orders" ON orders;
CREATE POLICY "Admins update orders" ON orders FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'));
DROP POLICY IF EXISTS "Admins delete orders" ON orders;
CREATE POLICY "Admins delete orders" ON orders FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'));

-- Payments: allow admins to update/delete (customers can insert)
DROP POLICY IF EXISTS "Admins update payments" ON payments;
CREATE POLICY "Admins update payments" ON payments FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'));
DROP POLICY IF EXISTS "Admins delete payments" ON payments;
CREATE POLICY "Admins delete payments" ON payments FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'));

-- Users: allow admins to update/delete other users (keeps existing users own policies)
DROP POLICY IF EXISTS "Admins update users" ON users;
CREATE POLICY "Admins update users" ON users FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'));
DROP POLICY IF EXISTS "Admins delete users" ON users;
CREATE POLICY "Admins delete users" ON users FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE public.users.supabase_id = auth.uid()::text AND public.users.role = 'admin'));

-- End of admin write policies
