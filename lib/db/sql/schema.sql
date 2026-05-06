-- ============================================================
-- Gaming Store — Full Database Schema
-- Run this in the Supabase SQL Editor to set up your database.
-- Safe to re-run: uses IF NOT EXISTS / DO $$ blocks throughout.
-- ============================================================

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE "user_role" AS ENUM ('user', 'staff', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "product_category" AS ENUM ('game-topups', 'gift-cards', 'subscriptions', 'vouchers');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "order_status" AS ENUM ('pending', 'verified', 'rejected', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "payment_method" AS ENUM ('esewa', 'khalti', 'ime-pay', 'connectips', 'bank');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "payment_status" AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "discount_type" AS ENUM ('percentage', 'fixed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "chat_sender" AS ENUM ('user', 'bot', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- TABLES
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "users" (
  "id"           serial PRIMARY KEY,
  "supabase_id"  text NOT NULL UNIQUE,
  "email"        text NOT NULL,
  "name"         text,
  "phone"        text,
  "avatar_url"   text,
  "role"         user_role NOT NULL DEFAULT 'user',
  "is_banned"    boolean NOT NULL DEFAULT false,
  "created_at"   timestamp NOT NULL DEFAULT now(),
  "updated_at"   timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "products" (
  "id"             serial PRIMARY KEY,
  "name"           text NOT NULL,
  "description"    text NOT NULL,
  "price"          numeric(10, 2) NOT NULL,
  "category"       product_category NOT NULL,
  "image_url"      text,
  "tags"           jsonb NOT NULL DEFAULT '[]'::jsonb,
  "dynamic_fields" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "variants"       jsonb NOT NULL DEFAULT '[]'::jsonb,
  "in_stock"       boolean NOT NULL DEFAULT true,
  "featured"       boolean NOT NULL DEFAULT false,
  "created_at"     timestamp NOT NULL DEFAULT now(),
  "updated_at"     timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "orders" (
  "id"                     serial PRIMARY KEY,
  "user_id"                text,
  "guest_name"             text,
  "guest_email"            text,
  "guest_phone"            text,
  "product_id"             integer NOT NULL REFERENCES "products"("id"),
  "game_details"           jsonb NOT NULL DEFAULT '{}'::jsonb,
  "total_amount"           numeric(10, 2) NOT NULL,
  "discount_amount"        numeric(10, 2) NOT NULL DEFAULT 0,
  "coupon_code"            text,
  "status"                 order_status NOT NULL DEFAULT 'pending',
  "payment_screenshot_url" text,
  "admin_note"             text,
  "created_at"             timestamp NOT NULL DEFAULT now(),
  "updated_at"             timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "payments" (
  "id"             serial PRIMARY KEY,
  "order_id"       integer NOT NULL REFERENCES "orders"("id"),
  "screenshot_url" text NOT NULL,
  "payment_method" payment_method NOT NULL,
  "status"         payment_status NOT NULL DEFAULT 'pending',
  "admin_note"     text,
  "created_at"     timestamp NOT NULL DEFAULT now(),
  "updated_at"     timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "coupons" (
  "id"                    serial PRIMARY KEY,
  "code"                  text NOT NULL UNIQUE,
  "discount_type"         discount_type NOT NULL,
  "discount_value"        numeric(10, 2) NOT NULL,
  "expires_at"            timestamp,
  "usage_limit"           integer,
  "usage_count"           integer NOT NULL DEFAULT 0,
  "active"                boolean NOT NULL DEFAULT true,
  "applicable_product_ids" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at"            timestamp NOT NULL DEFAULT now(),
  "updated_at"            timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "banners" (
  "id"         serial PRIMARY KEY,
  "title"      text NOT NULL,
  "subtitle"   text,
  "image_url"  text,
  "link_url"   text,
  "active"     boolean NOT NULL DEFAULT true,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id"          serial PRIMARY KEY,
  "session_id"  text NOT NULL,
  "user_id"     text,
  "guest_name"  text,
  "sender"      chat_sender NOT NULL,
  "content"     text NOT NULL,
  "read"        integer NOT NULL DEFAULT 0,
  "created_at"  timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "payment_settings" (
  "id"             serial PRIMARY KEY,
  "method"         text NOT NULL UNIQUE,
  "label"          text NOT NULL,
  "enabled"        boolean NOT NULL DEFAULT true,
  "account_name"   text,
  "account_number" text,
  "qr_image_url"   text,
  "instructions"   text,
  "sort_order"     integer NOT NULL DEFAULT 0,
  "updated_at"     timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "reviews" (
  "id"           serial PRIMARY KEY,
  "user_id"      text,
  "guest_name"   text NOT NULL,
  "guest_email"  text NOT NULL,
  "rating"       integer NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
  "content"      text NOT NULL,
  "approved"     boolean NOT NULL DEFAULT false,
  "rejected"     boolean NOT NULL DEFAULT false,
  "created_at"   timestamp NOT NULL DEFAULT now(),
  "updated_at"   timestamp NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- INDEXES (optional but recommended for performance)
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS "idx_orders_user_id"    ON "orders"("user_id");
CREATE INDEX IF NOT EXISTS "idx_orders_status"     ON "orders"("status");
CREATE INDEX IF NOT EXISTS "idx_orders_product_id" ON "orders"("product_id");
CREATE INDEX IF NOT EXISTS "idx_payments_order_id" ON "payments"("order_id");
CREATE INDEX IF NOT EXISTS "idx_chat_session_id"   ON "chat_messages"("session_id");
CREATE INDEX IF NOT EXISTS "idx_products_category" ON "products"("category");
CREATE INDEX IF NOT EXISTS "idx_products_featured" ON "products"("featured");
