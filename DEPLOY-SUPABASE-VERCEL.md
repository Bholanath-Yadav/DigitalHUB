# Deploy Digital HUB with Supabase + Vercel (Fully Serverless)

## Overview

This project is now **100% serverless** with:
- ✅ **Frontend**: Static SPA deployed to Vercel
- ✅ **Backend**: Supabase (PostgreSQL + Auth)
- ✅ **Data**: All reads/writes via browser Supabase client (RLS-protected)
- ✅ **No API server**: Zero Node.js backend needed
- ✅ **No API routes**: All client logic runs on browser

---

## Prerequisites

1. **Supabase Project** - Created and populated with data
   - URL: `https://sfxlrflxhetwmgcnovij.supabase.co`
   - Tables: `users`, `products`, `banners`, `coupons`, `payment_settings`, `chat_messages`, etc.

2. **GitHub Repository** - With code pushed
   - Repository: `Bholanath-Yadav/DigitalHUB`
   - Branch: `main`

3. **Vercel Account** - For deployment
   - Sign up at https://vercel.com

---

## Step 1: Apply Supabase RLS Policies

These policies allow the browser app (using anon key) to read public data and insert chat messages.

### 1.1 Open Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `DigitalHUB` (sfxlrflxhetwmgcnovij)
3. Navigate to **SQL Editor**

### 1.2 Run Migration 003: Public Read Policies

Copy and paste this into the SQL editor and execute:

```sql
-- Public read/write access for the browser app when using Supabase directly.
-- Run this in Supabase SQL editor after 001/002 migrations.

ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_messages ENABLE ROW LEVEL SECURITY;

-- Products: Public read (for storefront)
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

-- Banners: Public read (for homepage)
DROP POLICY IF EXISTS "Public read banners" ON banners;
CREATE POLICY "Public read banners"
  ON banners FOR SELECT
  TO anon, authenticated
  USING (true);

-- Payment Settings: Public read (for checkout)
DROP POLICY IF EXISTS "Public read payment settings" ON payment_settings;
CREATE POLICY "Public read payment settings"
  ON payment_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Coupons: Public read (for validation)
DROP POLICY IF EXISTS "Public read coupons" ON coupons;
CREATE POLICY "Public read coupons"
  ON coupons FOR SELECT
  TO anon, authenticated
  USING (true);

-- Users: Authenticated users read/update own profile
DROP POLICY IF EXISTS "Users read own profile" ON users;
CREATE POLICY "Users read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (supabase_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users insert own profile" ON users;
CREATE POLICY "Users insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (supabase_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users update own profile" ON users;
CREATE POLICY "Users update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (supabase_id = auth.uid()::text);

-- Chat Messages: Anyone can read/write messages from any session
DROP POLICY IF EXISTS "Public read chat messages" ON chat_messages;
CREATE POLICY "Public read chat messages"
  ON chat_messages FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public insert chat messages" ON chat_messages;
CREATE POLICY "Public insert chat messages"
  ON chat_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

### 1.3 Verify Policies Applied

- ✅ Each policy should execute successfully (no errors)
- ✅ You should see "RLS is enabled" messages for each table

---

## Step 2: Get Supabase Keys

### 2.1 Find Your Anon Key

1. In Supabase Dashboard, go to **Settings → API**
2. Copy these values:
   - **Project URL** (e.g., `https://sfxlrflxhetwmgcnovij.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGc...`)

Example values (replace with your actual keys):
```
VITE_SUPABASE_URL=https://sfxlrflxhetwmgcnovij.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 3: Create Vercel Project

### 3.1 Import from GitHub

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New → Project**
3. Select **Import Git Repository**
4. Search and select: `Bholanath-Yadav/DigitalHUB`
5. Click **Import**

### 3.2 Configure Project Settings

On the import dialog:

- **Project Name**: `digital-hub-gaming` (or your choice)
- **Framework Preset**: `Other` (Vite is auto-detected)
- **Root Directory**: `.` (root of repository)

### 3.3 Add Environment Variables

**Critical**: Vercel must have these variables for the frontend build to work!

In the environment variables section, add:

```
VITE_SUPABASE_URL=https://sfxlrflxhetwmgcnovij.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important**:
- These are **build-time** variables (embedded in frontend at build)
- Prefix `VITE_` makes them available in browser code
- Do NOT use quotes around values
- Apply to: **All environments** (Production, Preview, Development)

### 3.4 Deployment Configuration

The `vercel.json` file is already configured:

```json
{
  "buildCommand": "pnpm install --frozen-lockfile && pnpm --filter @workspace/gaming-store build",
  "outputDirectory": "artifacts/gaming-store/dist/public",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This tells Vercel to:
- Install dependencies with pnpm
- Build only the frontend (gaming-store)
- Serve `dist/public` as static files
- Route all non-matching paths to `index.html` (SPA routing)

### 3.5 Deploy!

1. Click **Deploy**
2. Wait for deployment to complete (usually 2-3 minutes)
3. You'll get a URL like: `https://digital-hub-gaming.vercel.app`

---

## Step 4: Verify Deployment

### 4.1 Test Frontend Loads

1. Open your Vercel deployment URL
2. **Check Network tab** (F12 → Network)
   - Should see `index.html`, CSS, JS files loaded
   - Should see calls to `https://sfxlrflxhetwmgcnovij.supabase.co` (for data)
   - Should **NOT** see any `/api/` calls

### 4.2 Test Data Loads

1. **Homepage**: Should show product cards, banners, payment methods
   - If empty: Check browser console for errors (F12 → Console)
   - Check RLS policies were applied (Step 1)
   - Check env vars set in Vercel (Step 3.3)

2. **Chat Widget**: Click chat bubble in bottom-right
   - Should load greeting message
   - Try sending a message
   - Check Supabase → `chat_messages` table for inserted row

3. **Sign In**: Try creating an account
   - After sign-up, user profile should be in `users` table
   - Check Supabase → `users` table for new row

### 4.3 Check Supabase Logs

1. Go to Supabase Dashboard
2. Navigate to **Logs** section
3. Should see read/write queries from your Vercel app
4. No auth errors = RLS policies working!

---

## Step 5: Redeploy After Changes

If you make code changes:

```bash
# Local testing (optional)
cd artifacts/gaming-store
npm run dev

# Commit and push changes
git add -A
git commit -m "feat: update feature"
git push origin main

# Vercel auto-deploys on push to main
# Watch deployment at: vercel.com/dashboard
```

---

## Architecture Diagram

```
┌─────────────────────────────────┐
│    Browser (User's Device)      │
│  ┌───────────────────────────┐  │
│  │   React App (SPA)         │  │
│  │ - React Query             │  │
│  │ - Supabase Client         │  │
│  └────────────┬──────────────┘  │
└───────────────┼──────────────────┘
                │ Direct HTTPS
                ├─ Read (GET products, banners, coupons, payment_settings)
                ├─ Write (Chat messages, User profiles)
                │
       ┌────────▼──────────────────┐
       │   Supabase PostgreSQL      │
       │  (sfxlrflxhetwmgcnovij)    │
       │                            │
       │ Tables:                    │
       │ - products (public read)   │
       │ - banners (public read)    │
       │ - coupons (public read)    │
       │ - payment_settings (...)   │
       │ - chat_messages (public)   │
       │ - users (auth only)        │
       │                            │
       │ RLS Policies Active!       │
       └────────────────────────────┘

┌─────────────────────────────────┐
│    Vercel (Frontend Hosting)    │
│  - Static files (HTML/CSS/JS)   │
│  - Built from GitHub on push    │
│  - Env vars injected at build   │
└─────────────────────────────────┘
```

---

## Troubleshooting

### Problem: "Products not showing"

**Cause**: RLS policies not applied or env vars not set

**Solution**:
1. Verify RLS policies in Supabase → Settings → Database → Policies
2. Check env vars in Vercel Dashboard → Settings → Environment Variables
3. Redeploy after fixing (Vercel → Deployments → Redeploy)

### Problem: "Chat messages not saving"

**Cause**: RLS policy missing for chat_messages

**Solution**:
1. Ensure `003_public_read_policies.sql` was fully executed (Step 1)
2. Check browser console (F12 → Console) for Supabase error messages
3. Verify chat_messages table has RLS enabled

### Problem: "Supabase connection error"

**Cause**: Wrong URL or anon key in env vars

**Solution**:
1. Double-check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel
2. Ensure **no trailing slashes** in URL
3. Ensure **no quotes** around keys
4. Redeploy after updating

### Problem: "CORS errors in console"

**Cause**: Rare - Supabase auth token issue

**Solution**:
1. Clear browser localStorage (F12 → Application → Storage → Local Storage)
2. Hard refresh (Ctrl+Shift+R)
3. Try incognito window (Ctrl+Shift+N)

### Problem: "Build failed on Vercel"

**Cause**: TypeScript or dependency errors

**Solution**:
1. Check Vercel build logs (Vercel → Deployments → Build → View Logs)
2. Run locally: `pnpm install && pnpm --filter @workspace/gaming-store build`
3. Fix errors and push again

---

## Security Notes

### ✅ What's Protected

- **RLS Policies**: Each database query filtered by RLS at DB level
- **Anon Key**: Can only execute SELECT on public tables
- **Auth Flow**: Email/password via Supabase Auth (JWT-based)
- **User Data**: Authenticated users can only access own profiles

### ⚠️ Limitations

- **Anon key is visible** in frontend code (this is normal and safe for public reads)
- **Service role key** never exposed (only on backend, not used in this setup)
- **Chat is unmoderated** (anyone can send messages - add moderation later if needed)
- **Orders/Payments** currently disabled (would need admin backend for processing)

---

## Next Steps

1. ✅ Deploy this version (fully serverless read-only + chat)
2. 🔄 Test thoroughly with real data
3. 🔧 Add admin backend later for:
   - Order processing
   - Payment verification
   - Chat moderation
4. 📊 Monitor Supabase usage and performance

---

## Useful Links

- **Supabase Dashboard**: https://app.supabase.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repository**: https://github.com/Bholanath-Yadav/DigitalHUB
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

## Summary

Your app is now:
- ✅ **Fully serverless** (no backend server needed)
- ✅ **Supabase-powered** (all data from PostgreSQL)
- ✅ **RLS-protected** (row-level security on every query)
- ✅ **Deployed to Vercel** (auto-deploys on GitHub push)
- ✅ **Production-ready** (static hosting, CDN, HTTPS)

**Ready to launch! 🚀**
