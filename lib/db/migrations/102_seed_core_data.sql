-- ============================================================
-- Migration 102: CORE SEED DATA (FRESH DB)
-- ============================================================
-- Run after 101_fresh_schema_and_rls.sql
-- ============================================================

INSERT INTO public.products (id, name, description, price, category, image_url, tags, dynamic_fields, variants, in_stock, featured)
VALUES
  (
    1,
    'Free Fire Diamonds',
    'Top up your Free Fire account instantly with diamonds. Fast delivery, best rates in Nepal.',
    199.00, 'gaming',
    'https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=400',
    '["free fire","diamonds","garena"]',
    '[{"label":"Player ID","name":"playerId","type":"text","required":true,"placeholder":"Enter your Free Fire UID"},{"label":"Server","name":"server","type":"select","required":true,"options":["IND","BD","MENA","SEA"]}]',
    '[{"name":"100 Diamonds","price":199},{"name":"310 Diamonds","price":549},{"name":"520 Diamonds","price":899},{"name":"1060 Diamonds","price":1749},{"name":"2180 Diamonds","price":3299}]',
    true, true
  ),
  (
    2,
    'PUBG Mobile UC',
    'Purchase Unknown Cash (UC) for PUBG Mobile. Unlock skins, crates, and Battle Pass.',
    299.00, 'gaming',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
    '["pubg","uc","tencent"]',
    '[{"label":"Player ID","name":"playerId","type":"text","required":true,"placeholder":"Enter your PUBG Player ID"},{"label":"Season","name":"season","type":"text","required":false,"placeholder":"Current season (optional)"}]',
    '[{"name":"60 UC","price":299},{"name":"325 UC","price":1199},{"name":"660 UC","price":2299},{"name":"1800 UC","price":5999},{"name":"3850 UC","price":12499}]',
    true, true
  ),
  (
    3,
    'Spotify Premium',
    'Spotify Premium subscription - ad-free music, offline listening, unlimited skips.',
    599.00, 'streaming',
    'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=400',
    '["spotify","music","subscription"]',
    '[{"label":"Spotify Email","name":"email","type":"email","required":true,"placeholder":"your@spotify.com"}]',
    '[{"name":"1 Month","price":599},{"name":"3 Months","price":1599},{"name":"6 Months","price":2999}]',
    true, true
  ),
  (
    4,
    'Steam Wallet Code',
    'Steam wallet code for purchasing games, DLCs, and items on Steam.',
    999.00, 'gift-cards',
    'https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?w=400',
    '["steam","valve","pc gaming","wallet"]',
    '[{"label":"Delivery Email","name":"email","type":"email","required":true,"placeholder":"your@email.com"}]',
    '[{"name":"$5 USD","price":699},{"name":"$10 USD","price":1349},{"name":"$20 USD","price":2699}]',
    true, false
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  tags = EXCLUDED.tags,
  dynamic_fields = EXCLUDED.dynamic_fields,
  variants = EXCLUDED.variants,
  in_stock = EXCLUDED.in_stock,
  featured = EXCLUDED.featured,
  updated_at = now();

INSERT INTO public.banners (id, title, subtitle, image_url, link_url, active, sort_order)
VALUES
  (
    1,
    'Dominate Every Game',
    'Top up Free Fire, PUBG and more - instant delivery, best prices in Nepal.',
    'https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=1200',
    '/products?category=gaming',
    true,
    0
  ),
  (
    2,
    'Streaming Subscriptions',
    'Spotify and premium subscriptions delivered instantly.',
    'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=1200',
    '/products?category=streaming',
    true,
    1
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  image_url = EXCLUDED.image_url,
  link_url = EXCLUDED.link_url,
  active = EXCLUDED.active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

INSERT INTO public.payment_settings (method, label, enabled, account_name, account_number, instructions, sort_order)
VALUES
  (
    'esewa', 'eSewa', true,
    'Digital HUB Nepal', '9826749317',
    'Send payment to this eSewa number, then upload receipt screenshot on order page.',
    0
  ),
  (
    'khalti', 'Khalti', true,
    'Digital HUB Nepal', '9826749317',
    'Send payment to this Khalti number, then upload receipt screenshot on order page.',
    1
  ),
  (
    'connectips', 'ConnectIPS', true,
    'Digital HUB Nepal', '1234567890',
    'Transfer through ConnectIPS and upload transaction screenshot.',
    2
  )
ON CONFLICT (method) DO UPDATE SET
  label = EXCLUDED.label,
  enabled = EXCLUDED.enabled,
  account_name = EXCLUDED.account_name,
  account_number = EXCLUDED.account_number,
  instructions = EXCLUDED.instructions,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

INSERT INTO public.coupons (code, discount_type, discount_value, expires_at, usage_limit, active, applicable_product_ids)
VALUES
  ('WELCOME10', 'percentage', 10.00, now() + interval '90 days', 100, true, '[]'),
  ('PUBG20', 'percentage', 20.00, now() + interval '60 days', 30, true, '[]')
ON CONFLICT (code) DO UPDATE SET
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  expires_at = EXCLUDED.expires_at,
  usage_limit = EXCLUDED.usage_limit,
  active = EXCLUDED.active,
  applicable_product_ids = EXCLUDED.applicable_product_ids,
  updated_at = now();

SELECT 'SEED_READY' AS status;
