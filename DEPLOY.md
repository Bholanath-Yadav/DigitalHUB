# Deploying Digital HUB — Vercel + Supabase

Full step-by-step guide for deploying this app to Vercel (frontend + API) with Supabase as the PostgreSQL database.

---

## Database Migrations (How They Work)

This project uses **Drizzle ORM** with proper SQL migration files (not direct schema push).

| File/Folder | Purpose |
|---|---|
| `lib/db/migrations/*.sql` | Version-controlled SQL migration files |
| `lib/db/src/migrate.ts` | Programmatic migration runner |
| `lib/db/drizzle.config.ts` | Drizzle config (schema + migrations folder) |

### Migration workflow

```
Schema change?
     │
     ▼
pnpm --filter @workspace/db run generate   ← creates new .sql file in migrations/
     │
     ▼
commit the new .sql file to git
     │
     ▼
push to GitHub → Vercel auto-deploys → migrations run automatically
```

**Vercel runs migrations automatically on every deploy** (before starting the API).
Drizzle tracks which migrations have already been applied in the `__drizzle_migrations` table, so re-running is always safe.

### Manual migration (run from Replit shell)

```bash
DATABASE_URL="your-supabase-url" pnpm --filter @workspace/db run migrate
```

### Generate a new migration after schema changes

```bash
pnpm --filter @workspace/db run generate
# → creates lib/db/migrations/000X_some_name.sql
# commit that file to git
```

---

## 1. Set up Supabase (Database)

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a region — **Singapore** (`ap-southeast-1`) is closest to Nepal
3. Set a strong database password and save it
4. Once ready: **Settings → Database → Connection string → Transaction pooler** (port **6543**)
5. Copy the URI and ensure it ends with `?sslmode=require`

Your `DATABASE_URL` will look like:
```
postgresql://postgres.xxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
```

> **Use port 6543 (Transaction pooler), not 5432.** Vercel serverless functions are short-lived and need a connection pooler.

---

## 2. Set up Clerk (Production Instance)

1. Go to [clerk.com](https://clerk.com) → your app → **"Switch to Production"**
2. Under **API Keys**, copy:
   - Publishable key → starts with `pk_live_`
   - Secret key → starts with `sk_live_`
3. Under **Domains**, add your Vercel URL: `https://your-app.vercel.app`
4. Re-configure any OAuth providers (Google, etc.) using the production callback URLs Clerk shows

---

## 3. Deploy to Vercel

### 3a. Push the code to GitHub first
From the Replit shell:
```bash
git remote add origin https://github.com/YOUR_USERNAME/digital-hub.git
git branch -M main
git push -u origin main
```

### 3b. Import into Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Vercel auto-detects `vercel.json` — no framework preset needed

### 3c. Configure project settings
- **Framework Preset:** Other
- **Root Directory:** `.` (repo root)
- **Build / Install commands:** leave blank (taken from `vercel.json`)

### 3d. Add environment variables

Go to **Settings → Environment Variables** and add:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | Supabase connection string (port 6543) | Runtime + Build |
| `CLERK_PUBLISHABLE_KEY` | `pk_live_...` | Runtime |
| `CLERK_SECRET_KEY` | `sk_live_...` | Runtime |
| `VITE_CLERK_PUBLISHABLE_KEY` | Same as `CLERK_PUBLISHABLE_KEY` | **Build-time** — Vite reads this at build |
| `ALLOWED_ORIGIN` | `https://your-app.vercel.app` | Runtime |
| `NODE_ENV` | `production` | Runtime |

> `VITE_CLERK_PUBLISHABLE_KEY` must be added as a Vercel env var — not just a secret — because Vite bakes it into the static JS bundle at build time.

### 3e. Deploy
Click **Deploy**. On every deploy Vercel will:
1. `pnpm install`
2. `pnpm --filter @workspace/db run migrate` — applies pending migrations to Supabase
3. Bundle the API with esbuild → `api/vercel.mjs`
4. Build the Vite frontend → `artifacts/gaming-store/dist/public`
5. Serve everything: static files at `/`, serverless API at `/api/*`

---

## 4. After First Deploy

### Update ALLOWED_ORIGIN
Once you know your Vercel URL (e.g. `https://digitalhub.vercel.app`), set `ALLOWED_ORIGIN` to exactly that URL and redeploy.

### Custom domain (optional)
In **Vercel → Settings → Domains**, add your domain (e.g. `digitalhub.com.np`).
Then update `ALLOWED_ORIGIN` and add it to your Clerk production instance's allowed domains.

---

## Render Deployment

You can also deploy this project on Render with two services:

- Backend: `@workspace/api-server` as a Render web service
- Frontend: `@workspace/gaming-store` as a Render static site

The repo now includes a `render.yaml` blueprint that matches this split. Import the repo into Render and then set the secret env vars in the Render dashboard.

### Backend env vars on Render

- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key
- `ALLOWED_ORIGIN` = the final frontend URL on Render

### Frontend env vars on Render

- `VITE_API_BASE_URL` = the public backend URL on Render
- `VITE_SUPABASE_URL` = your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` = your Supabase anon/public key

### What changed for Render support

- The frontend API client can now use `VITE_API_BASE_URL` when deployed separately.
- Without that variable, it still falls back to same-origin development behavior.

---

## Environment Variables — Quick Reference

| Variable | Required by | When used |
|---|---|---|
| `DATABASE_URL` | DB migrations + API | Build + Runtime |
| `CLERK_PUBLISHABLE_KEY` | API (Clerk middleware) | Runtime |
| `CLERK_SECRET_KEY` | API (Clerk JWT verify) | Runtime |
| `VITE_CLERK_PUBLISHABLE_KEY` | Frontend bundle | Build time only |
| `ALLOWED_ORIGIN` | API (CORS) | Runtime |
| `NODE_ENV` | API | Runtime |
