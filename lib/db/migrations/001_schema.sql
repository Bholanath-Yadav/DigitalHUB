-- ============================================================
-- Digital HUB Nepal — Gaming Store
-- Migration 001: Full Schema + Storage Bucket + RLS Policies
--
-- HOW TO RUN (fresh Supabase project):
--   1. Open Supabase Dashboard → SQL Editor
--   2. Paste and run this file (001_schema.sql)
--   3. Paste and run 002_seed.sql for demo data
--
-- Safe to re-run: all statements use IF NOT EXISTS / DO $$ blocks.
-- ============================================================


-- ============================================================
-- SECTION 1: ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'staff', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE product_category AS ENUM ('game-topups', 'gift-cards', 'subscriptions', 'vouchers');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'verified', 'rejected', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('esewa', 'khalti', 'ime-pay');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE chat_sender AS ENUM ('user', 'bot', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ============================================================
-- SECTION 2: TABLES
-- ============================================================

-- Users (synced from Supabase Auth on first login)
CREATE TABLE IF NOT EXISTS users (
  id           serial      PRIMARY KEY,
  supabase_id  text        NOT NULL UNIQUE,   -- auth.users.id (UUID)
  email        text        NOT NULL,
  name         text,
  phone        text,
  avatar_url   text,
  role         user_role   NOT NULL DEFAULT 'user',
  is_banned    boolean     NOT NULL DEFAULT false,
  created_at   timestamp   NOT NULL DEFAULT now(),
  updated_at   timestamp   NOT NULL DEFAULT now()
);

-- Products (game top-ups, gift cards, subscriptions, vouchers)
CREATE TABLE IF NOT EXISTS products (
  id             serial           PRIMARY KEY,
  name           text             NOT NULL,
  description    text             NOT NULL,
  price          numeric(10, 2)   NOT NULL,
  category       product_category NOT NULL,
  image_url      text,
  tags           jsonb            NOT NULL DEFAULT '[]'::jsonb,
  -- dynamic_fields: array of { label, name, type, required, placeholder?, options? }
  dynamic_fields jsonb            NOT NULL DEFAULT '[]'::jsonb,
  -- variants: array of { name, price }
  variants       jsonb            NOT NULL DEFAULT '[]'::jsonb,
  in_stock       boolean          NOT NULL DEFAULT true,
  featured       boolean          NOT NULL DEFAULT false,
  created_at     timestamp        NOT NULL DEFAULT now(),
  updated_at     timestamp        NOT NULL DEFAULT now()
);

-- Orders (supports both logged-in users and guests)
CREATE TABLE IF NOT EXISTS orders (
  id                     serial          PRIMARY KEY,
  user_id                text,           -- supabase_id, NULL for guests
  guest_name             text,
  guest_email            text,
  guest_phone            text,
  product_id             integer         NOT NULL REFERENCES products(id),
  game_details           jsonb           NOT NULL DEFAULT '{}'::jsonb,
  total_amount           numeric(10, 2)  NOT NULL,
  discount_amount        numeric(10, 2)  NOT NULL DEFAULT 0,
  coupon_code            text,
  status                 order_status    NOT NULL DEFAULT 'pending',
  payment_screenshot_url text,
  admin_note             text,
  created_at             timestamp       NOT NULL DEFAULT now(),
  updated_at             timestamp       NOT NULL DEFAULT now()
);

-- Payments (payment proof screenshots linked to orders)
CREATE TABLE IF NOT EXISTS payments (
  id             serial          PRIMARY KEY,
  order_id       integer         NOT NULL REFERENCES orders(id),
  screenshot_url text            NOT NULL,
  payment_method payment_method  NOT NULL,
  status         payment_status  NOT NULL DEFAULT 'pending',
  admin_note     text,
  created_at     timestamp       NOT NULL DEFAULT now(),
  updated_at     timestamp       NOT NULL DEFAULT now()
);

-- Coupons / discount codes
CREATE TABLE IF NOT EXISTS coupons (
  id                     serial          PRIMARY KEY,
  code                   text            NOT NULL UNIQUE,
  discount_type          discount_type   NOT NULL,
  discount_value         numeric(10, 2)  NOT NULL,
  expires_at             timestamp,
  usage_limit            integer,                       -- NULL = unlimited
  usage_count            integer         NOT NULL DEFAULT 0,
  active                 boolean         NOT NULL DEFAULT true,
  -- empty array = applies to all products
  applicable_product_ids jsonb           NOT NULL DEFAULT '[]'::jsonb,
  created_at             timestamp       NOT NULL DEFAULT now(),
  updated_at             timestamp       NOT NULL DEFAULT now()
);

-- Hero / promotional banners shown on the storefront
CREATE TABLE IF NOT EXISTS banners (
  id         serial    PRIMARY KEY,
  title      text      NOT NULL,
  subtitle   text,
  image_url  text,
  link_url   text,
  active     boolean   NOT NULL DEFAULT true,
  sort_order integer   NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- Live chat messages (customer ↔ support staff / bot)
CREATE TABLE IF NOT EXISTS chat_messages (
  id         serial      PRIMARY KEY,
  session_id text        NOT NULL,   -- UUID generated client-side
  user_id    text,                   -- supabase_id, NULL for guests
  guest_name text,
  sender     chat_sender NOT NULL,
  content    text        NOT NULL,
  read       integer     NOT NULL DEFAULT 0,
  created_at timestamp   NOT NULL DEFAULT now()
);

-- Payment method configuration (eSewa, Khalti, etc.)
CREATE TABLE IF NOT EXISTS payment_settings (
  id             serial    PRIMARY KEY,
  method         text      NOT NULL UNIQUE,
  label          text      NOT NULL,
  enabled        boolean   NOT NULL DEFAULT true,
  account_name   text,
  account_number text,
  qr_image_url   text,
  instructions   text,
  sort_order     integer   NOT NULL DEFAULT 0,
  updated_at     timestamp NOT NULL DEFAULT now()
);


-- ============================================================
-- SECTION 3: INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_chat_session_id   ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);


-- ============================================================
-- SECTION 4: STORAGE BUCKET
--
-- Creates the "gaming-store" bucket (public read, 10 MB limit).
-- This must be run as the service role (paste into SQL Editor).
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gaming-store',
  'gaming-store',
  true,
  10485760,   -- 10 MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- SECTION 5: STORAGE RLS POLICIES
--
-- The storage.objects table has RLS enabled by default in Supabase.
-- These policies control who can upload, read, and delete files
-- inside the "gaming-store" bucket.
-- ============================================================

-- 5a. Anyone (including guests) can read/view any file
DROP POLICY IF EXISTS "Public read gaming-store"      ON storage.objects;
CREATE POLICY "Public read gaming-store"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gaming-store');

-- 5b. Logged-in users can upload into their own avatars folder only
--     Path format: avatars/<supabase-user-uuid>/avatar.jpg
DROP POLICY IF EXISTS "Auth users upload own avatar"  ON storage.objects;
CREATE POLICY "Auth users upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'gaming-store'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- 5c. Logged-in users can overwrite (upsert) their own avatar
DROP POLICY IF EXISTS "Auth users update own avatar"  ON storage.objects;
CREATE POLICY "Auth users update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'gaming-store'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- 5d. Logged-in users can delete their own avatar
DROP POLICY IF EXISTS "Auth users delete own avatar"  ON storage.objects;
CREATE POLICY "Auth users delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'gaming-store'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- 5e. The API server (service_role key) has unrestricted access
--     to all files (product images, payment screenshots, banners, QR codes)
DROP POLICY IF EXISTS "Service role full access"      ON storage.objects;
CREATE POLICY "Service role full access"
  ON storage.objects FOR ALL
  TO service_role
  USING     (bucket_id = 'gaming-store')
  WITH CHECK (bucket_id = 'gaming-store');


-- ============================================================
-- DONE
-- Run 002_seed.sql next to populate demo products, banners,
-- payment methods, and coupon codes.
-- ============================================================
