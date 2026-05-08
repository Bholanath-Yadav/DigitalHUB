-- ============================================================
-- Digital HUB Nepal — Gaming Store
-- Migration 002: Seed / Demo Data
--
-- HOW TO RUN:
--   Run this AFTER 001_schema.sql in the Supabase SQL Editor.
--   Safe to re-run: uses ON CONFLICT DO NOTHING / DO UPDATE.
-- ============================================================


-- ============================================================
-- PRODUCTS
-- ============================================================

INSERT INTO products (name, description, price, category, image_url, tags, dynamic_fields, variants, in_stock, featured)
VALUES
  (
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
    'Mobile Legends Diamonds',
    'Recharge your Mobile Legends: Bang Bang account with diamonds. Instant top-up.',
    149.00, 'gaming',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    '["mobile legends","mlbb","diamonds"]',
    '[{"label":"User ID","name":"userId","type":"text","required":true,"placeholder":"Enter your MLBB User ID"},{"label":"Zone ID","name":"zoneId","type":"text","required":true,"placeholder":"Enter your Zone ID"}]',
    '[{"name":"56 Diamonds","price":149},{"name":"172 Diamonds","price":449},{"name":"257 Diamonds","price":649},{"name":"706 Diamonds","price":1699},{"name":"2195 Diamonds","price":4999}]',
    true, false
  ),
  (
    'TikTok Coins',
    'Buy TikTok coins to send gifts to your favourite creators. Instant delivery.',
    199.00, 'gaming',
    'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400',
    '["tiktok","coins","social"]',
    '[{"label":"TikTok Username","name":"username","type":"text","required":true,"placeholder":"@yourusername"}]',
    '[{"name":"100 Coins","price":199},{"name":"500 Coins","price":899},{"name":"1000 Coins","price":1749},{"name":"5000 Coins","price":8499}]',
    true, false
  ),
  (
    'Call of Duty Mobile CP',
    'Top up COD Points for Call of Duty Mobile. Buy operators, blueprints and Battle Pass.',
    399.00, 'gaming',
    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400',
    '["cod","codm","cp","activision"]',
    '[{"label":"Activision ID","name":"activisionId","type":"text","required":true,"placeholder":"Name#1234567"}]',
    '[{"name":"80 CP","price":399},{"name":"400 CP","price":1799},{"name":"800 CP","price":3499},{"name":"2000 CP","price":8499}]',
    true, false
  ),
  (
    'Netflix Gift Card',
    'Nepal Netflix gift card. Redeemable on any Netflix account. No expiry.',
    1500.00, 'gift-cards',
    'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400',
    '["netflix","streaming","gift card"]',
    '[{"label":"Delivery Email","name":"email","type":"email","required":true,"placeholder":"your@email.com"}]',
    '[{"name":"NPR 1,500","price":1500},{"name":"NPR 3,000","price":3000},{"name":"NPR 5,000","price":5000}]',
    true, true
  ),
  (
    'Spotify Premium',
    'Spotify Premium subscription — ad-free music, offline listening, unlimited skips.',
    599.00, 'streaming',
    'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=400',
    '["spotify","music","subscription"]',
    '[{"label":"Spotify Email","name":"email","type":"email","required":true,"placeholder":"your@spotify.com"}]',
    '[{"name":"1 Month","price":599},{"name":"3 Months","price":1599},{"name":"6 Months","price":2999},{"name":"12 Months","price":5499}]',
    true, true
  ),
  (
    'YouTube Premium',
    'YouTube Premium — no ads, background play, YouTube Music included.',
    499.00, 'streaming',
    'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400',
    '["youtube","premium","subscription","google"]',
    '[{"label":"Google Account Email","name":"email","type":"email","required":true,"placeholder":"your@gmail.com"}]',
    '[{"name":"1 Month","price":499},{"name":"3 Months","price":1399},{"name":"6 Months","price":2699}]',
    true, false
  ),
  (
    'Steam Wallet Code',
    'Steam wallet code for purchasing games, DLCs, and items on Steam.',
    999.00, 'gift-cards',
    'https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?w=400',
    '["steam","valve","pc gaming","wallet"]',
    '[{"label":"Delivery Email","name":"email","type":"email","required":true,"placeholder":"your@email.com"}]',
    '[{"name":"$5 USD","price":699},{"name":"$10 USD","price":1349},{"name":"$20 USD","price":2699},{"name":"$50 USD","price":6699}]',
    true, false
  ),
  (
    'Razer Gold',
    'Razer Gold — the gaming currency accepted across 3,500+ games worldwide.',
    499.00, 'gift-cards',
    'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400',
    '["razer","gold","gaming","voucher"]',
    '[{"label":"Razer ID / Email","name":"razerId","type":"email","required":true,"placeholder":"your@razer.com"}]',
    '[{"name":"$5 Gold","price":699},{"name":"$10 Gold","price":1349},{"name":"$25 Gold","price":3299}]',
    true, false
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- BANNERS
-- ============================================================

INSERT INTO banners (title, subtitle, image_url, link_url, active, sort_order)
VALUES
  (
    'Dominate Every Game',
    'Top up Free Fire, PUBG, MLBB and more — instant delivery, best prices in Nepal.',
    'https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=1200',
    '/products?category=gaming',
    true, 0
  ),
  (
    'Gift Cards Now Available',
    'Netflix, Spotify, YouTube Premium and more. Delivered instantly to your inbox.',
    'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200',
    '/products?category=gift-cards',
    true, 1
  ),
  (
    'Exclusive Member Discounts',
    'Sign up today and get special coupon codes on your first order.',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200',
    '/signup',
    true, 2
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- PAYMENT SETTINGS
-- ============================================================

INSERT INTO payment_settings (method, label, enabled, account_name, account_number, instructions, sort_order)
VALUES
  (
    'esewa', 'eSewa', true,
    'Digital HUB Nepal', '9826749317',
    'Send payment to the eSewa number above. Screenshot your receipt and upload it on the order page.',
    0
  ),
  (
    'khalti', 'Khalti', true,
    'Digital HUB Nepal', '9826749317',
    'Send payment to the Khalti number above. Screenshot your receipt and upload it on the order page.',
    1
  ),
  (
    'connectips', 'ConnectIPS', true,
    'Digital HUB Nepal', '1234567890',
    'Transfer via ConnectIPS and upload your transaction screenshot on the order page.',
    2
  ),
  (
    'bank', 'Bank Transfer', true,
    'Digital HUB Nepal', 'NIC Asia – 1234567890123',
    'Transfer to our NIC Asia account and upload the receipt on the order page. Include your order ID in the remarks.',
    3
  )
ON CONFLICT (method) DO UPDATE SET
  label          = EXCLUDED.label,
  enabled        = EXCLUDED.enabled,
  account_name   = EXCLUDED.account_name,
  account_number = EXCLUDED.account_number,
  instructions   = EXCLUDED.instructions,
  sort_order     = EXCLUDED.sort_order;


-- ============================================================
-- COUPONS (demo — update codes/dates before going live)
-- ============================================================

INSERT INTO coupons (code, discount_type, discount_value, expires_at, usage_limit, active, applicable_product_ids)
VALUES
  ('WELCOME10', 'percentage', 10.00, NOW() + INTERVAL '90 days', 100, true, '[]'),
  ('FREESHIP',  'fixed',      50.00, NOW() + INTERVAL '30 days',  50, true, '[]'),
  ('PUBG20',    'percentage', 20.00, NOW() + INTERVAL '60 days',  30, true, '[]')
ON CONFLICT (code) DO NOTHING;


-- ============================================================
-- ADMIN USER (optional — replace with real Supabase Auth UUID)
--
-- After creating your admin user in Supabase Auth dashboard,
-- find their UUID (auth.users.id) and run:
--
--   INSERT INTO users (supabase_id, email, name, role)
--   VALUES ('<your-auth-uuid>', 'admin@yourdomain.com', 'Admin', 'admin')
--   ON CONFLICT (supabase_id) DO UPDATE SET role = 'admin';
--
-- ============================================================
