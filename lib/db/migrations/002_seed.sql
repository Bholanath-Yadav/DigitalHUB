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
  (
    'Google Play Gift Card',
    'Download apps, games, movies, and books on Google Play. Instant code delivery.',
    500.00, 'gift-cards',
    'https://images.unsplash.com/photo-1512941691920-25bde4e32ae1?w=400',
    '["google play","android","apps","games"]',
    '[{"label":"Email Address","name":"email","type":"email","required":true,"placeholder":"your@email.com"}]',
    '[{"name":"NPR 500","price":500},{"name":"NPR 1,000","price":1000},{"name":"NPR 2,500","price":2500},{"name":"NPR 5,000","price":5000}]',
    true, false
  ),
  (
    'PSN Store Credit',
    'PlayStation Network store credit for games, DLC, and subscriptions.',
    2000.00, 'gaming',
    'https://images.unsplash.com/photo-1556994212-d5682f35c67c?w=400',
    '["psn","playstation","ps5","ps4"]',
    '[{"label":"PSN Email","name":"psn_email","type":"email","required":true,"placeholder":"your@psn.com"}]',
    '[{"name":"$10 USD","price":1349},{"name":"$20 USD","price":2699},{"name":"$50 USD","price":6699}]',
    true, false
  ),
  (
    'Xbox Game Pass',
    'Access 100+ games on Xbox and PC. Play new releases day one.',
    3000.00, 'streaming',
    'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400',
    '["xbox","game pass","microsoft","gaming"]',
    '[{"label":"Microsoft Email","name":"ms_email","type":"email","required":true,"placeholder":"your@outlook.com"}]',
    '[{"name":"1 Month","price":3000},{"name":"3 Months","price":8500},{"name":"12 Months","price":29999}]',
    true, false
  ),
  (
    'Amazon Prime Video',
    'Stream movies, TV shows, and exclusive original series. Ad-free viewing.',
    999.00, 'streaming',
    'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400',
    '["amazon","prime video","streaming","movies"]',
    '[{"label":"Amazon Email","name":"amazon_email","type":"email","required":true,"placeholder":"your@amazon.com"}]',
    '[{"name":"1 Month","price":999},{"name":"3 Months","price":2799},{"name":"Annual","price":9999}]',
    true, false
  ),
  (
    'Discord Nitro',
    'Discord Nitro — higher quality streams, custom emojis, priority support.',
    499.00, 'streaming',
    'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=400',
    '["discord","nitro","gaming","streaming"]',
    '[{"label":"Discord Email","name":"discord_email","type":"email","required":true,"placeholder":"your@discord.com"}]',
    '[{"name":"1 Month","price":499},{"name":"3 Months","price":1399},{"name":"Annual","price":4999}]',
    true, false
  ),
  (
    'TikTok Creator Fund Support',
    'Boost your TikTok presence. Get verified, increase followers organically.',
    999.00, 'social-boost',
    'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400',
    '["tiktok","followers","social media","boost"]',
    '[{"label":"TikTok Username","name":"tiktok_username","type":"text","required":true,"placeholder":"@yourusername"}]',
    '[{"name":"Starter Plan","price":999},{"name":"Pro Plan","price":2499},{"name":"Elite Plan","price":4999}]',
    true, false
  ),
  (
    'Instagram Engagement Pack',
    'Increase followers, likes, and engagement on Instagram naturally.',
    1499.00, 'social-boost',
    'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=400',
    '["instagram","followers","likes","social media","boost"]',
    '[{"label":"Instagram Username","name":"ig_username","type":"text","required":true,"placeholder":"yourusername"}]',
    '[{"name":"Starter Pack","price":1499},{"name":"Pro Pack","price":2999},{"name":"Elite Pack","price":5499}]',
    true, false
  ),
  (
    'YouTube Channel Growth',
    'Boost your YouTube channel with subscribers, views, and engagement.',
    1999.00, 'social-boost',
    'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400',
    '["youtube","subscribers","views","channel growth","boost"]',
    '[{"label":"YouTube Channel URL","name":"yt_url","type":"text","required":true,"placeholder":"https://youtube.com/@yourchannel"}]',
    '[{"name":"Growth Pack 100","price":1999},{"name":"Growth Pack 500","price":4999},{"name":"Growth Pack 1000","price":8999}]',
    true, false
  ),
  (
    'Microsoft Windows License',
    'Genuine Windows 10/11 Professional license. Lifetime activation.',
    2999.00, 'digital-tools',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    '["windows","license","microsoft","pro"]',
    '[{"label":"Email Address","name":"email","type":"email","required":true,"placeholder":"your@email.com"}]',
    '[{"name":"Windows 11 Pro","price":2999},{"name":"Windows 11 Home","price":1999}]',
    true, false
  ),
  (
    'Microsoft Office 365',
    'One year subscription to Office 365 — Word, Excel, PowerPoint, OneDrive.',
    1799.00, 'digital-tools',
    'https://images.unsplash.com/photo-1516321318423-f06f70504cff?w=400',
    '["office","microsoft","productivity","subscription"]',
    '[{"label":"Microsoft Email","name":"ms_email","type":"email","required":true,"placeholder":"your@outlook.com"}]',
    '[{"name":"1 Year Office 365","price":1799}]',
    true, false
  ),
  (
    'Norton Antivirus 360',
    'Norton Antivirus 360 — real-time protection for your PC. 1 year license.',
    1299.00, 'digital-tools',
    'https://images.unsplash.com/photo-1516321318423-f06f70504cff?w=400',
    '["antivirus","norton","security","protection"]',
    '[{"label":"Email Address","name":"email","type":"email","required":true,"placeholder":"your@email.com"}]',
    '[{"name":"1 Year License","price":1299},{"name":"2 Year License","price":2299}]',
    true, false
  ),
  (
    'ExpressVPN Premium',
    'ExpressVPN — secure, anonymous browsing. 30+ countries available.',
    2499.00, 'vpn-privacy',
    'https://images.unsplash.com/photo-1549887534-7da96e5b3446?w=400',
    '["vpn","expressvpn","privacy","security"]',
    '[{"label":"Email Address","name":"email","type":"email","required":true,"placeholder":"your@email.com"}]',
    '[{"name":"1 Month","price":499},{"name":"6 Months","price":2499},{"name":"12 Months","price":4499}]',
    true, false
  ),
  (
    'NordVPN Subscription',
    'NordVPN — fast VPN with military-grade encryption. 60+ countries.',
    1999.00, 'vpn-privacy',
    'https://images.unsplash.com/photo-1549887534-7da96e5b3446?w=400',
    '["vpn","nordvpn","privacy","security","encrypted"]',
    '[{"label":"Email Address","name":"email","type":"email","required":true,"placeholder":"your@email.com"}]',
    '[{"name":"1 Month","price":399},{"name":"1 Year","price":1999},{"name":"2 Years","price":3299}]',
    true, false
  ),
  (
    'Surfshark VPN',
    'Surfshark VPN — unlimited simultaneous connections. Unblock anything.',
    1499.00, 'vpn-privacy',
    'https://images.unsplash.com/photo-1549887534-7da96e5b3446?w=400',
    '["vpn","surfshark","privacy","security","streaming"]',
    '[{"label":"Email Address","name":"email","type":"email","required":true,"placeholder":"your@email.com"}]',
    '[{"name":"1 Month","price":299},{"name":"1 Year","price":1499},{"name":"2 Years","price":2299}]',
    true, false
  ),
  (
    'ProtonVPN Plus',
    'ProtonVPN Plus — Swiss privacy, no-logs VPN. Secure core servers.',
    1799.00, 'vpn-privacy',
    'https://images.unsplash.com/photo-1549887534-7da96e5b3446?w=400',
    '["vpn","protonvpn","privacy","security","swiss"]',
    '[{"label":"Email Address","name":"email","type":"email","required":true,"placeholder":"your@email.com"}]',
    '[{"name":"1 Month","price":499},{"name":"1 Year","price":1799},{"name":"2 Years","price":2999}]',
    true, false
  ),
  (
    'Adobe Creative Cloud',
    'Adobe Creative Cloud — Photoshop, Illustrator, Premiere Pro & more. 1 year.',
    4999.00, 'digital-tools',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
    '["adobe","creative cloud","photoshop","design"]',
    '[{"label":"Adobe Email","name":"adobe_email","type":"email","required":true,"placeholder":"your@adobe.com"}]',
    '[{"name":"Creative Cloud 1 Year","price":4999}]',
    true, false
  ),
  (
    'Valorant Points Bundle',
    'Valorant Points for your Riot account. Buy agents, skins, and battle pass.',
    799.00, 'gaming',
    'https://images.unsplash.com/photo-1614613534308-eb5ec670a36a?w=400',
    '["valorant","riot","vp","points"]',
    '[{"label":"Riot ID","name":"riot_id","type":"text","required":true,"placeholder":"YourName#123"}]',
    '[{"name":"475 VP","price":399},{"name":"1000 VP","price":799},{"name":"2000 VP","price":1549}]',
    true, false
  ),
  (
    'Dota 2 Battle Pass',
    'Dota 2 Battle Pass — unlock cosmetics, battles, and exclusive rewards.',
    1299.00, 'gaming',
    'https://images.unsplash.com/photo-1538481143235-a9d08266d8b8?w=400',
    '["dota 2","steam","battle pass","valve"]',
    '[{"label":"Steam Account Email","name":"steam_email","type":"email","required":true,"placeholder":"your@steam.com"}]',
    '[{"name":"Battle Pass Level 1","price":799},{"name":"Battle Pass Level 10","price":1299}]',
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
