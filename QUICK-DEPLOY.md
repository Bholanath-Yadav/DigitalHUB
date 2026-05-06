# Quick Start: Deploy to Vercel

## ✅ What's Done

- ✅ Frontend: React SPA with Vite
- ✅ Backend: 100% Supabase (PostgreSQL)
- ✅ Chat: Direct browser → Supabase
- ✅ Products/Banners/Coupons: Direct browser → Supabase
- ✅ Auth: Supabase Auth (email/password)
- ✅ No `/api/` calls or Node.js backend needed!
- ✅ All code committed to GitHub (main branch)
- ✅ Frontend builds successfully (dist/public ready)

## 🚀 Deploy in 5 Minutes

### 1. Apply RLS Policies (2 min)
- Go to: https://app.supabase.com/project/sfxlrflxhetwmgcnovij/sql/new
- Paste: The SQL from `DEPLOY-SUPABASE-VERCEL.md` (Step 1.2)
- Execute ✓

### 2. Deploy to Vercel (3 min)
- Go to: https://vercel.com/new
- Import: `Bholanath-Yadav/DigitalHUB`
- Add env vars:
  ```
  VITE_SUPABASE_URL=https://sfxlrflxhetwmgcnovij.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- Click: **Deploy**

### 3. Test (Get your URL from Vercel)
- Open: Your Vercel URL
- Should see: Products, banners, chat widget
- Try: Sending a chat message (should save to Supabase)

## 📝 Full Guide
See: `DEPLOY-SUPABASE-VERCEL.md` for complete steps, troubleshooting, and security notes.

## 🔧 Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Hosting**: Vercel (static)
- **Chat**: Browser → Supabase direct

## 📊 What Data Flows Where
```
User Browser
    ↓
    ├─ Reads: products, banners, coupons (via Supabase)
    ├─ Writes: chat messages (via Supabase)
    └─ Auth: Sign up/login (via Supabase Auth)
    ↓
Supabase PostgreSQL
    ↓
    ├─ RLS policies protect each table
    ├─ Anon key can only read public tables
    └─ Auth required for user profiles
```

## ⚠️ Important
- Replace `VITE_SUPABASE_ANON_KEY` with your actual key from Supabase
- Make sure `VITE_SUPABASE_URL` ends with `.supabase.co` (no trailing slash)
- RLS policies MUST be applied or data won't show

## ✨ Done!
Your app is 100% serverless with Supabase as the complete backend. Zero API server needed!
