-- ============================================================
-- Digital HUB Nepal — Gaming Store
-- Migration 008: Update Product Categories (for existing databases)
--
-- HOW TO RUN:
--   Run this AFTER all other migrations (001-007) if upgrading an existing database.
--   For fresh databases, skip this — 001_schema.sql already includes new categories.
--   This migration updates the product_category enum and converts existing data.
--
-- WHAT IT DOES:
--   1. Creates a new product_category_new enum with updated categories
--   2. Updates products table to use new enum
--   3. Converts old category values to new ones
--   4. Drops old enum type
--   5. Renames new enum to replace old one
--
-- CATEGORY MAPPING:
--   game-topups   → gaming
--   gift-cards    → gift-cards (unchanged)
--   subscriptions → streaming
--   vouchers      → gift-cards
--   (adds new: digital-tools, social-boost, vpn-privacy)
-- ============================================================

-- Step 1: Create new enum type with updated categories
DO $$ BEGIN
  CREATE TYPE product_category_new AS ENUM (
    'digital-tools',
    'gaming',
    'gift-cards',
    'social-boost',
    'streaming',
    'vpn-privacy'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Step 2: Alter products table to use TEXT temporarily (to allow conversion)
ALTER TABLE products ALTER COLUMN category TYPE text;

-- Step 3: Update old category values to new ones
UPDATE products
SET category = CASE
  WHEN category = 'game-topups' THEN 'gaming'
  WHEN category = 'subscriptions' THEN 'streaming'
  WHEN category = 'vouchers' THEN 'gift-cards'
  ELSE category
END
WHERE category IN ('game-topups', 'subscriptions', 'vouchers');

-- Step 4: Convert back to new enum type
ALTER TABLE products ALTER COLUMN category TYPE product_category_new USING category::product_category_new;

-- Step 5: Drop old product_category enum if it exists
DO $$ BEGIN
  DROP TYPE IF EXISTS product_category;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Step 6: Rename new enum to replace old one
ALTER TYPE product_category_new RENAME TO product_category;

-- Step 7: Update banner links that reference old categories
UPDATE banners
SET link_url = REPLACE(link_url, '/products?category=game-topups', '/products?category=gaming')
WHERE link_url LIKE '%/products?category=game-topups%';

UPDATE banners
SET link_url = REPLACE(link_url, '/products?category=subscriptions', '/products?category=streaming')
WHERE link_url LIKE '%/products?category=subscriptions%';

UPDATE banners
SET link_url = REPLACE(link_url, '/products?category=vouchers', '/products?category=gift-cards')
WHERE link_url LIKE '%/products?category=vouchers%';

-- Step 8: Verify migration success
-- Run this query to check all products have valid categories
SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category;

-- Verify banners
SELECT link_url FROM banners WHERE link_url LIKE '%/products?category=%' ORDER BY link_url;
