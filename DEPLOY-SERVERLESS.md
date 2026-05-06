# Deploy to Vercel (Serverless)

**Easy setup: Frontend + Serverless API on Vercel with Supabase database.**

---

## Quick Start

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com) → **New Project**
- Region: **Singapore** (closest to Nepal)
- Save your project URL and API keys (you'll need them in 3 minutes)

### 2. Push Code to GitHub

```bash
git add -A
git commit -m "serverless: convert to Vercel functions"
git push -u origin main
```

### 3. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Select your GitHub repo
3. Vercel auto-detects `vercel.json` — click **Deploy**
4. Add environment variables from Vercel Dashboard:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Key |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key |

Done! Your app will be live in ~2 minutes ✅

---

## Important: Enable Browser Reads in Supabase

Because the storefront now reads `products`, `banners`, `payment_settings`, and `coupons` directly from the browser, Supabase must allow anonymous SELECT access on those tables.

Run this SQL in the Supabase SQL editor:

```sql
-- from lib/db/migrations/003_public_read_policies.sql
```

If you skip this step, the website can still build, but public data will not appear.

---

## Architecture

```
Vercel (your-app.vercel.app)
├─ Frontend (Static React/Vite)
│  ├─ GET  /              → index.html
│  └─ GET  /*             → index.html (SPA routing)
│
└─ Serverless API (/api)
   ├─ GET  /api/products   → list products from Supabase
   ├─ GET  /api/health     → health check
   └─ POST /api/products   → create product (admin only)
         ↓
    Supabase PostgreSQL
```

---

## Adding New API Routes

1. Create `/api/route-name.ts`:

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "./utils/supabase"; // shared client

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Your logic here
  const { data, error } = await supabase.from("table").select("*");
  
  res.status(200).json(data);
}
```

2. Redeploy: `git push origin main` — Vercel auto-builds and deploys

---

## Frontend Calls Serverless API

The frontend automatically calls `/api/*` endpoints (they're on the same domain):

```typescript
// From frontend code
const products = await fetch("/api/products").then(r => r.json());
```

---

## Troubleshooting

**API returns 500**
- Check Vercel logs: Vercel Dashboard → Deployments → click deployment → Function logs

**"Cannot find module @supabase"**
- Make sure `@supabase/supabase-js` is in `package.json`
- Run `pnpm install` locally and commit lock file

**Frontend shows blank page**
- Open DevTools → Network tab
- Check if `/api/products` request succeeds
- Look for CORS errors

---

## Redeploy After Changes

```bash
git add -A
git commit -m "describe changes"
git push origin main
```

Vercel watches your repo and auto-deploys on every push ✅

---

## Old Express Server (No Longer Used)

The old `/artifacts/api-server` (Express) is no longer deployed. You can keep it for reference or delete it. All code now uses serverless functions in `/api/*`.

---

