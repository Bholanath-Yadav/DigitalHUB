import { Router, type IRouter } from "express";
import { db, productsTable, bannersTable } from "@workspace/db";

const router: IRouter = Router();

const PRODUCTS = [
  // ── GAME TOP-UPS ──────────────────────────────────────────────────
  {
    name: "Free Fire Diamonds",
    description: "Top up Free Fire Diamonds instantly. Enter your Player ID to receive diamonds directly in your account. Valid for Garena Free Fire Nepal servers.",
    price: "0",
    category: "game-topups" as const,
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop",
    tags: ["Hot", "Popular"],
    featured: true,
    inStock: true,
    dynamicFields: [
      { key: "player_id", label: "Player ID", type: "text", required: true, placeholder: "Enter your Free Fire Player ID" },
    ],
    variants: [
      { label: "100 Diamonds",   price: 135,  description: "Best for small purchases" },
      { label: "310 Diamonds",   price: 395,  description: "Most popular starter pack" },
      { label: "520 Diamonds",   price: 649,  description: "Mid-range top-up" },
      { label: "1060 Diamonds",  price: 1299, description: "Great value combo" },
      { label: "2180 Diamonds",  price: 2499, description: "Heavy player pack" },
      { label: "5600 Diamonds",  price: 5999, description: "Mega top-up — best value" },
    ],
  },
  {
    name: "PUBG Mobile UC",
    description: "Purchase PUBG Mobile Unknown Cash (UC) to buy skins, crates, and battle passes. Fast delivery after payment verification.",
    price: "0",
    category: "game-topups" as const,
    imageUrl: "https://images.unsplash.com/photo-1586182987320-4f376d39d787?w=400&h=400&fit=crop",
    tags: ["Hot", "Popular"],
    featured: true,
    inStock: true,
    dynamicFields: [
      { key: "player_id",  label: "PUBG Player ID",  type: "text", required: true, placeholder: "Enter your PUBG Player ID" },
      { key: "server",     label: "Server Region",   type: "select", required: true, options: ["Asia", "Europe", "North America", "South America", "KRJP"] },
    ],
    variants: [
      { label: "60 UC",    price: 149,  description: "Starter pack" },
      { label: "325 UC",   price: 699,  description: "Most popular" },
      { label: "660 UC",   price: 1349, description: "Mid-range" },
      { label: "1800 UC",  price: 3599, description: "Royale Pass friendly" },
      { label: "3850 UC",  price: 7199, description: "Power pack" },
      { label: "8100 UC",  price: 14999, description: "Ultimate bundle" },
    ],
  },
  {
    name: "Mobile Legends Diamonds",
    description: "Top up Mobile Legends: Bang Bang diamonds. Buy heroes, skins, and exclusive cosmetics. Enter your User ID and Zone ID.",
    price: "0",
    category: "game-topups" as const,
    imageUrl: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=400&h=400&fit=crop",
    tags: ["New", "Popular"],
    featured: false,
    inStock: true,
    dynamicFields: [
      { key: "user_id",  label: "User ID",  type: "text", required: true, placeholder: "Enter User ID" },
      { key: "zone_id",  label: "Zone ID",  type: "text", required: true, placeholder: "Enter Zone ID (e.g., 1234)" },
    ],
    variants: [
      { label: "86 Diamonds",   price: 175,  description: "Basic pack" },
      { label: "172 Diamonds",  price: 345,  description: "Starter" },
      { label: "257 Diamonds",  price: 515,  description: "Mid pack" },
      { label: "706 Diamonds",  price: 1299, description: "Weekly supply" },
      { label: "2195 Diamonds", price: 3999, description: "Skin hunter pack" },
      { label: "5532 Diamonds", price: 9999, description: "Whale pack" },
    ],
  },
  {
    name: "TikTok Coins",
    description: "Recharge TikTok Coins to send gifts to your favourite creators. Works on all TikTok accounts globally.",
    price: "0",
    category: "game-topups" as const,
    imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=400&fit=crop",
    tags: ["Hot"],
    featured: true,
    inStock: true,
    dynamicFields: [
      { key: "tiktok_username", label: "TikTok Username", type: "text", required: true, placeholder: "@username" },
    ],
    variants: [
      { label: "100 Coins",  price: 139,  description: "Send a small gift" },
      { label: "500 Coins",  price: 649,  description: "Popular choice" },
      { label: "1000 Coins", price: 1249, description: "Super gifter" },
      { label: "3000 Coins", price: 3599, description: "Fan support pack" },
      { label: "5000 Coins", price: 5999, description: "Creator support" },
    ],
  },
  {
    name: "Roblox Robux",
    description: "Buy Roblox Robux to unlock avatar items, game passes, and exclusive in-game content. Safe and instant delivery.",
    price: "0",
    category: "game-topups" as const,
    imageUrl: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=400&h=400&fit=crop",
    tags: ["New"],
    featured: false,
    inStock: true,
    dynamicFields: [
      { key: "roblox_username", label: "Roblox Username", type: "text", required: true, placeholder: "Enter your Roblox username" },
    ],
    variants: [
      { label: "400 Robux",   price: 599,  description: "Starter pack" },
      { label: "800 Robux",   price: 1099, description: "Popular bundle" },
      { label: "1700 Robux",  price: 2199, description: "Value pack" },
      { label: "4500 Robux",  price: 5499, description: "Premium pack" },
    ],
  },
  {
    name: "Clash of Clans Gems",
    description: "Top up Clash of Clans gems to speed up buildings, buy resources, and unlock magical items.",
    price: "0",
    category: "game-topups" as const,
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=400&fit=crop",
    tags: [],
    featured: false,
    inStock: true,
    dynamicFields: [
      { key: "player_tag", label: "Player Tag", type: "text", required: true, placeholder: "#PLAYER_TAG" },
    ],
    variants: [
      { label: "80 Gems",   price: 149,  description: "Pocket change" },
      { label: "500 Gems",  price: 799,  description: "Small bundle" },
      { label: "1200 Gems", price: 1799, description: "Builder friendly" },
      { label: "2500 Gems", price: 3499, description: "Mid pack" },
      { label: "6500 Gems", price: 8499, description: "Big spender" },
    ],
  },
  {
    name: "Valorant VP",
    description: "Buy Valorant Points to unlock agents, weapon skins, and battle passes on your Riot account.",
    price: "0",
    category: "game-topups" as const,
    imageUrl: "https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=400&h=400&fit=crop",
    tags: ["Hot"],
    featured: false,
    inStock: true,
    dynamicFields: [
      { key: "riot_id", label: "Riot ID", type: "text", required: true, placeholder: "Username#TAG" },
    ],
    variants: [
      { label: "475 VP",   price: 599,  description: "Single skin" },
      { label: "1000 VP",  price: 1199, description: "Popular pack" },
      { label: "2050 VP",  price: 2299, description: "Battle pass ready" },
      { label: "3650 VP",  price: 3999, description: "Skins bundle" },
      { label: "5350 VP",  price: 5799, description: "Premium skins" },
    ],
  },
  {
    name: "Genshin Impact Genesis Crystals",
    description: "Buy Genesis Crystals to convert to Primogems or purchase exclusive items in Genshin Impact.",
    price: "0",
    category: "game-topups" as const,
    imageUrl: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=400&h=400&fit=crop",
    tags: ["New"],
    featured: false,
    inStock: true,
    dynamicFields: [
      { key: "uid",    label: "UID",    type: "text",   required: true, placeholder: "Enter your UID" },
      { key: "server", label: "Server", type: "select", required: true, options: ["Asia", "America", "Europe", "CHTW"] },
    ],
    variants: [
      { label: "60 Crystals",   price: 149,  description: "Starter" },
      { label: "300 Crystals",  price: 699,  description: "Basic wish pack" },
      { label: "980 Crystals",  price: 2099, description: "Blessing pack" },
      { label: "1980 Crystals", price: 3999, description: "Top-up pack" },
      { label: "3280 Crystals", price: 6499, description: "Large pack" },
      { label: "6480 Crystals", price: 12499, description: "Mega pack" },
    ],
  },

  // ── GIFT CARDS ─────────────────────────────────────────────────────
  {
    name: "Google Play Gift Card",
    description: "Redeem Google Play Gift Cards to buy apps, games, movies, music, and more on Google Play Store. Works globally.",
    price: "0",
    category: "gift-cards" as const,
    imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=400&fit=crop",
    tags: ["Popular"],
    featured: true,
    inStock: true,
    dynamicFields: [
      { key: "email", label: "Google Account Email", type: "email", required: true, placeholder: "your@gmail.com" },
    ],
    variants: [
      { label: "USD 5",   price: 699,  description: "Small top-up" },
      { label: "USD 10",  price: 1349, description: "Basic pack" },
      { label: "USD 25",  price: 3299, description: "Medium pack" },
      { label: "USD 50",  price: 6499, description: "Large pack" },
      { label: "USD 100", price: 12999, description: "Mega pack" },
    ],
  },
  {
    name: "Steam Wallet Code",
    description: "Add funds to your Steam Wallet. Buy games, DLCs, in-game items, and more on Steam. Worldwide codes.",
    price: "0",
    category: "gift-cards" as const,
    imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=400&fit=crop",
    tags: ["Hot"],
    featured: true,
    inStock: true,
    dynamicFields: [
      { key: "steam_username", label: "Steam Username", type: "text", required: true, placeholder: "Enter your Steam username" },
    ],
    variants: [
      { label: "USD 5",   price: 749,  description: "Indie games" },
      { label: "USD 10",  price: 1449, description: "Mid-range games" },
      { label: "USD 20",  price: 2799, description: "Triple-A games" },
      { label: "USD 50",  price: 6799, description: "Game bundle" },
    ],
  },
  {
    name: "iTunes / App Store Gift Card",
    description: "Redeem on Apple App Store, Apple Music, iCloud, and more. Available in USD denominations.",
    price: "0",
    category: "gift-cards" as const,
    imageUrl: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&h=400&fit=crop",
    tags: ["Popular"],
    featured: false,
    inStock: true,
    dynamicFields: [
      { key: "apple_id", label: "Apple ID Email", type: "email", required: true, placeholder: "your@icloud.com" },
    ],
    variants: [
      { label: "USD 5",   price: 699,  description: "Small apps" },
      { label: "USD 10",  price: 1399, description: "Games & apps" },
      { label: "USD 25",  price: 3299, description: "Subscriptions" },
      { label: "USD 50",  price: 6499, description: "Bundle" },
    ],
  },
  {
    name: "PlayStation Store Gift Card",
    description: "Buy PS4 & PS5 games, add-ons, PS Plus subscriptions, and avatars on PlayStation Store.",
    price: "0",
    category: "gift-cards" as const,
    imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop",
    tags: ["New"],
    featured: false,
    inStock: true,
    dynamicFields: [
      { key: "psn_id", label: "PSN ID", type: "text", required: true, placeholder: "Enter your PlayStation Network ID" },
    ],
    variants: [
      { label: "USD 10", price: 1349, description: "Starter pack" },
      { label: "USD 25", price: 3299, description: "Popular choice" },
      { label: "USD 50", price: 6499, description: "Big spender" },
    ],
  },
  {
    name: "Xbox Gift Card",
    description: "Add funds to your Microsoft / Xbox account. Buy Xbox games, Game Pass, and more.",
    price: "0",
    category: "gift-cards" as const,
    imageUrl: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&h=400&fit=crop",
    tags: [],
    featured: false,
    inStock: true,
    dynamicFields: [
      { key: "microsoft_email", label: "Microsoft Account Email", type: "email", required: true, placeholder: "your@outlook.com" },
    ],
    variants: [
      { label: "USD 5",  price: 749,  description: "Small top-up" },
      { label: "USD 10", price: 1399, description: "Basic pack" },
      { label: "USD 25", price: 3299, description: "Mid pack" },
      { label: "USD 50", price: 6599, description: "Large pack" },
    ],
  },

  // ── SUBSCRIPTIONS ──────────────────────────────────────────────────
  {
    name: "Netflix Subscription",
    description: "Premium Netflix subscription for Nepal. Watch unlimited movies, TV series, anime, and more in Full HD/4K. Shared or private accounts available.",
    price: "0",
    category: "subscriptions" as const,
    imageUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&h=400&fit=crop",
    tags: ["Hot", "Popular"],
    featured: true,
    inStock: true,
    dynamicFields: [
      { key: "email", label: "Netflix Account Email", type: "email", required: true, placeholder: "your@email.com" },
    ],
    variants: [
      { label: "1 Month Standard",  price: 749,  description: "Full HD, 2 screens" },
      { label: "3 Months Standard", price: 1999, description: "Save 11%" },
      { label: "1 Month Premium",   price: 1099, description: "4K + 4 screens" },
      { label: "3 Months Premium",  price: 2799, description: "Best value 4K" },
      { label: "6 Months Premium",  price: 5499, description: "Half-year deal" },
    ],
  },
  {
    name: "Spotify Premium",
    description: "Enjoy Spotify Premium with ad-free music, offline downloads, and unlimited skips. Individual, Duo, and Family plans available.",
    price: "0",
    category: "subscriptions" as const,
    imageUrl: "https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=400&h=400&fit=crop",
    tags: ["Popular"],
    featured: true,
    inStock: true,
    dynamicFields: [
      { key: "email", label: "Spotify Account Email", type: "email", required: true, placeholder: "your@email.com" },
    ],
    variants: [
      { label: "1 Month Individual", price: 399,  description: "1 account" },
      { label: "3 Months Individual",price: 999,  description: "Save 16%" },
      { label: "6 Months Individual",price: 1799, description: "Best value" },
      { label: "1 Month Family",     price: 699,  description: "Up to 6 accounts" },
      { label: "3 Months Family",    price: 1799, description: "Family deal" },
    ],
  },
  {
    name: "YouTube Premium",
    description: "Ad-free YouTube videos, background play, YouTube Music Premium, and access to YouTube Originals.",
    price: "0",
    category: "subscriptions" as const,
    imageUrl: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=400&fit=crop",
    tags: ["New"],
    featured: false,
    inStock: true,
    dynamicFields: [
      { key: "gmail", label: "Gmail Address", type: "email", required: true, placeholder: "your@gmail.com" },
    ],
    variants: [
      { label: "1 Month",  price: 449, description: "Ad-free" },
      { label: "3 Months", price: 999, description: "Save 26%" },
    ],
  },
  {
    name: "Disney+ Hotstar",
    description: "Stream Disney+, Marvel, Star Wars, National Geographic, and live sports on Disney+ Hotstar.",
    price: "0",
    category: "subscriptions" as const,
    imageUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=400&fit=crop",
    tags: [],
    featured: false,
    inStock: true,
    dynamicFields: [
      { key: "email", label: "Account Email", type: "email", required: true, placeholder: "your@email.com" },
    ],
    variants: [
      { label: "1 Month Super",    price: 399,  description: "Full HD" },
      { label: "1 Month Premium",  price: 699,  description: "4K + 4 screens" },
      { label: "3 Months Premium", price: 1799, description: "Quarterly deal" },
    ],
  },
  {
    name: "Canva Pro",
    description: "Unlock the full power of Canva with Pro: unlimited templates, brand kit, background remover, and premium elements.",
    price: "0",
    category: "subscriptions" as const,
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop",
    tags: [],
    featured: false,
    inStock: true,
    dynamicFields: [
      { key: "email", label: "Canva Account Email", type: "email", required: true, placeholder: "your@email.com" },
    ],
    variants: [
      { label: "1 Month",  price: 899,  description: "Full Pro access" },
      { label: "3 Months", price: 2299, description: "Save 14%" },
      { label: "1 Year",   price: 7999, description: "Best annual value" },
    ],
  },

  // ── VOUCHERS ────────────────────────────────────────────────────────
  {
    name: "eSewa Cash Voucher",
    description: "Recharge your eSewa wallet instantly. Use for online shopping, bill payments, and more across Nepal.",
    price: "0",
    category: "vouchers" as const,
    imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=400&fit=crop",
    tags: ["Popular"],
    featured: false,
    inStock: true,
    dynamicFields: [
      { key: "esewa_id", label: "eSewa ID / Mobile Number", type: "text", required: true, placeholder: "98XXXXXXXX" },
    ],
    variants: [
      { label: "Rs. 100",  price: 105,  description: "" },
      { label: "Rs. 500",  price: 520,  description: "" },
      { label: "Rs. 1000", price: 1040, description: "" },
      { label: "Rs. 2000", price: 2080, description: "" },
    ],
  },
  {
    name: "Ncell Recharge",
    description: "Instant Ncell mobile recharge for any Ncell number in Nepal. Top up talk time and data.",
    price: "0",
    category: "vouchers" as const,
    imageUrl: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=400&h=400&fit=crop",
    tags: [],
    featured: false,
    inStock: true,
    dynamicFields: [
      { key: "phone", label: "Ncell Mobile Number", type: "text", required: true, placeholder: "98XXXXXXXX" },
    ],
    variants: [
      { label: "Rs. 50",  price: 55,   description: "" },
      { label: "Rs. 100", price: 105,  description: "" },
      { label: "Rs. 200", price: 210,  description: "" },
      { label: "Rs. 500", price: 520,  description: "" },
    ],
  },
  {
    name: "NTC Top-Up",
    description: "Top up your Nepal Telecom (NTC) mobile balance instantly. Works for all NTC prepaid numbers.",
    price: "0",
    category: "vouchers" as const,
    imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=400&fit=crop",
    tags: [],
    featured: false,
    inStock: true,
    dynamicFields: [
      { key: "phone", label: "NTC Mobile Number", type: "text", required: true, placeholder: "97XXXXXXXX" },
    ],
    variants: [
      { label: "Rs. 50",  price: 55,   description: "" },
      { label: "Rs. 100", price: 105,  description: "" },
      { label: "Rs. 200", price: 210,  description: "" },
      { label: "Rs. 500", price: 520,  description: "" },
    ],
  },
  {
    name: "Amazon Gift Card",
    description: "Shop millions of products on Amazon with this gift card. Valid on Amazon.com (US). No expiry date.",
    price: "0",
    category: "vouchers" as const,
    imageUrl: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400&h=400&fit=crop",
    tags: ["New"],
    featured: false,
    inStock: true,
    dynamicFields: [
      { key: "email", label: "Amazon Account Email", type: "email", required: true, placeholder: "your@email.com" },
    ],
    variants: [
      { label: "USD 5",  price: 749,  description: "" },
      { label: "USD 10", price: 1399, description: "" },
      { label: "USD 25", price: 3299, description: "" },
      { label: "USD 50", price: 6499, description: "" },
    ],
  },
];

const BANNERS = [
  {
    title: "Free Fire Mega Sale",
    description: "Get up to 20% bonus diamonds this weekend only! Limited time offer.",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=400&fit=crop",
    linkUrl: "/products?category=game-topups",
    active: true,
    sortOrder: 1,
  },
  {
    title: "Netflix Premium — Best Deals",
    description: "3-month Netflix Premium subscription at the lowest price in Nepal.",
    imageUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1200&h=400&fit=crop",
    linkUrl: "/products?category=subscriptions",
    active: true,
    sortOrder: 2,
  },
  {
    title: "Google Play Gift Cards",
    description: "Buy Google Play gift cards and get your favourite apps & games instantly.",
    imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop",
    linkUrl: "/products?category=gift-cards",
    active: true,
    sortOrder: 3,
  },
];

router.post("/seed", async (req, res) => {
  try {
    // Clear existing data
    await db.delete(productsTable);

    // Insert products
    const inserted = await db.insert(productsTable).values(
      PRODUCTS.map(p => ({
        ...p,
        updatedAt: new Date(),
      }))
    ).returning();

    // Seed banners if empty
    const existingBanners = await db.select().from(bannersTable);
    let bannersInserted = 0;
    if (existingBanners.length === 0) {
      await db.insert(bannersTable).values(BANNERS);
      bannersInserted = BANNERS.length;
    }

    res.json({
      message: "Seed complete",
      products: inserted.length,
      banners: bannersInserted,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Seed failed", details: err.message });
  }
});

export default router;
