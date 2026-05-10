-- Migration 105: Align admin write policies with dashboard access rules
-- Purpose:
--   The admin UI allows both admin and staff roles.
--   Some older policy sets only allowed role = 'admin', which blocks writes for staff.
--   This migration updates write policies to allow role IN ('admin','staff').

-- Products
DROP POLICY IF EXISTS "Admins insert products" ON products;
DROP POLICY IF EXISTS "Admins update products" ON products;
DROP POLICY IF EXISTS "Admins delete products" ON products;
CREATE POLICY "Admins insert products" ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  );
CREATE POLICY "Admins update products" ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  );
CREATE POLICY "Admins delete products" ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  );

-- Banners
DROP POLICY IF EXISTS "Admins insert banners" ON banners;
DROP POLICY IF EXISTS "Admins update banners" ON banners;
DROP POLICY IF EXISTS "Admins delete banners" ON banners;
CREATE POLICY "Admins insert banners" ON banners FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  );
CREATE POLICY "Admins update banners" ON banners FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  );
CREATE POLICY "Admins delete banners" ON banners FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  );

-- Coupons
DROP POLICY IF EXISTS "Admins insert coupons" ON coupons;
DROP POLICY IF EXISTS "Admins update coupons" ON coupons;
DROP POLICY IF EXISTS "Admins delete coupons" ON coupons;
CREATE POLICY "Admins insert coupons" ON coupons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  );
CREATE POLICY "Admins update coupons" ON coupons FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  );
CREATE POLICY "Admins delete coupons" ON coupons FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  );

-- Payment settings
DROP POLICY IF EXISTS "Admins insert payment_settings" ON payment_settings;
DROP POLICY IF EXISTS "Admins update payment_settings" ON payment_settings;
DROP POLICY IF EXISTS "Admins delete payment_settings" ON payment_settings;
CREATE POLICY "Admins insert payment_settings" ON payment_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  );
CREATE POLICY "Admins update payment_settings" ON payment_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  );
CREATE POLICY "Admins delete payment_settings" ON payment_settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  );

-- Orders and payments admin moderation
DROP POLICY IF EXISTS "Admins update orders" ON orders;
DROP POLICY IF EXISTS "Admins delete orders" ON orders;
CREATE POLICY "Admins update orders" ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  );
CREATE POLICY "Admins delete orders" ON orders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  );

DROP POLICY IF EXISTS "Admins update payments" ON payments;
DROP POLICY IF EXISTS "Admins delete payments" ON payments;
CREATE POLICY "Admins update payments" ON payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  );
CREATE POLICY "Admins delete payments" ON payments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.supabase_id = auth.uid()::text
        AND public.users.role IN ('admin', 'staff')
    )
  );
