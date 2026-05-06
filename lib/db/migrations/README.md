# Database Migrations

Run these files in order in the **Supabase SQL Editor** to set up a fresh database or a live production project.

## Files

| File | What it does |
|------|-------------|
| `001_schema.sql` | Creates all enums, tables, indexes, the storage bucket, and all RLS policies |
| `002_seed.sql` | Inserts demo products, banners, payment methods, and coupon codes |
| `003_public_read_policies.sql` | Enables browser reads/writes needed by the Vercel frontend |
| `004_production_seed.sql` | Idempotent production seed data for the live Supabase project |

---

## Step-by-step setup

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com) → New project.

### 2. Run the schema migration
- Open **SQL Editor** in your Supabase dashboard
- Paste the contents of `001_schema.sql` and click **Run**

### 3. Apply browser RLS policies
- Paste the contents of `003_public_read_policies.sql` and click **Run**
- This enables the public storefront to read products, banners, payment settings, and chat messages

### 4. Seed production data
- Paste the contents of `004_production_seed.sql` and click **Run**
- This is safe to re-run and will upsert the production product catalog, banners, payment methods, and coupon codes

### 5. Create your admin user
- Go to **Authentication → Users → Invite user** (or Add user)
- Create a user with your admin email and set a password
- Copy their **UUID** from the users list
- Run this in the SQL Editor (replace the placeholders):

```sql
INSERT INTO users (supabase_id, email, name, role)
VALUES ('<paste-uuid-here>', 'admin@yourdomain.com', 'Admin', 'admin')
ON CONFLICT (supabase_id) DO UPDATE SET role = 'admin';
```

### 6. Configure your environment variables

Add these to your Replit Secrets (or `.env` file):

| Variable | Where to find it |
|----------|-----------------|
| `SUPABASE_DB_URL` | Project Settings → Database → Connection string → **Transaction pooler** (port 6543) |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` key |
| `VITE_SUPABASE_URL` | Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Project Settings → API → `anon` / `public` key |

> **Important:** Use the **Transaction pooler** connection string (port 6543), not the direct connection (port 5432). Direct connections are often blocked in hosted environments.

---

## What the schema creates

### Tables
| Table | Purpose |
|-------|---------|
| `users` | Synced from Supabase Auth on first login via browser Supabase client |
| `products` | Game top-ups, gift cards, subscriptions, vouchers |
| `orders` | Customer orders — supports both logged-in users and guests |
| `payments` | Payment proof screenshots linked to orders |
| `coupons` | Discount codes (percentage or fixed amount) |
| `banners` | Hero / promotional banners on the storefront |
| `chat_messages` | Live chat between customers and support staff |
| `payment_settings` | eSewa, Khalti, ConnectIPS, Bank Transfer config |

### Storage bucket: `gaming-store`
Stores all uploaded files — product images, payment screenshots, banner images, QR codes, and user avatars.

### Storage RLS policies
| Policy | Who | Path |
|--------|-----|------|
| Public read | Everyone | Any file |
| Upload own avatar | Authenticated users | `avatars/<user-uuid>/` only |
| Update own avatar | Authenticated users | `avatars/<user-uuid>/` only |
| Delete own avatar | Authenticated users | `avatars/<user-uuid>/` only |
| Full access | Service role (API server) | All files |

### User roles
| Role | Access |
|------|--------|
| `user` | Browse, order, manage own profile |
| `staff` | All admin endpoints except user management |
| `admin` | Full access including user management |
