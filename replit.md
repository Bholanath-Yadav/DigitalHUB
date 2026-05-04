# Workspace

## Overview

Full-stack digital gaming marketplace — Digital HUB Nepal. Sell game top-ups (Free Fire, PUBG, TikTok), gift cards, subscriptions, and vouchers. Manual payment verification via QR codes (eSewa, Khalti, IME Pay). Dark gaming theme.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui (dark theme)
- **Backend**: Express 5
- **Auth**: Supabase Auth (email/password, JWT-based, custom forms)
- **Database**: PostgreSQL + Drizzle ORM (Replit-managed Postgres)
- **File Storage**: Supabase Storage (bucket: `gaming-store`, avatars under `avatars/{userId}/`)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run migrate` — run pending DB migrations
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Environment Variables / Secrets

- `VITE_SUPABASE_URL` — Supabase project URL (shared env var, used by frontend)
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key (shared env var, used by frontend)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (secret, used by API server)
- `DATABASE_URL` — Replit-managed PostgreSQL connection string

API server reads `SUPABASE_URL` or falls back to `VITE_SUPABASE_URL`.

## Database Schema (lib/db/src/schema/)

- **users** — supabaseId (UUID from Supabase Auth), email, name, phone, avatarUrl, role (user/staff/admin), isBanned
- **products** — name, description, price, category, imageUrl, tags, dynamicFields, inStock, featured
- **orders** — userId/guest info, productId, gameDetails, totalAmount, discountAmount, couponCode, status
- **payments** — orderId, screenshotUrl, paymentMethod (esewa/khalti/ime-pay), status
- **coupons** — code, discountType (percentage/fixed), discountValue, expiresAt, usageLimit, usageCount, active, applicableProductIds
- **banners** — title, subtitle, imageUrl, linkUrl, active, sortOrder
- **chat_messages** — sessionId, userId, sender (user/bot/staff), content

## Auth Middleware (artifacts/api-server/src/middlewares/supabaseAuth.ts)

- `requireAuth` — verifies JWT via `supabase.auth.getUser(token)`, loads DB profile
- `optionalAuth` — same but does not reject unauthenticated requests
- `requireAdmin` — requires role admin or staff
- `requireAdminStrict` — requires role admin only

## Auth Context (artifacts/gaming-store/src/context/auth-context.tsx)

- `AuthProvider` — wraps the app, tracks Supabase session via `onAuthStateChange`
- `useAuth()` — returns `{ session, user, isLoaded, isSignedIn, signOut, getToken }`

## API Routes (artifacts/api-server/src/routes/)

- `products.ts` — CRUD products, public listing + admin management
- `orders.ts` — Create order, list orders, status updates, my orders
- `payments.ts` — Upload screenshot, list payments (admin), verify/reject
- `coupons.ts` — CRUD coupons (admin), validate coupon code (public)
- `banners.ts` — CRUD banners (admin), list active banners (public)
- `chat.ts` — Send messages (with bot replies), get messages, list sessions (admin)
- `admin.ts` — User management (list, role update, ban, delete), dashboard stats
- `users.ts` — My profile (GET/PUT), sync user on first login (POST /users/sync)
- `payment-settings.ts` — Admin payment QR configuration

## Frontend Pages (artifacts/gaming-store/src/pages/)

- `/` — Homepage with hero, banners, featured products
- `/products` — Product listing with search + category filter
- `/products/:id` — Product detail + dynamic game fields + coupon + buy
- `/checkout/:orderId` — QR codes, payment upload, submit
- `/orders/:id` — Order status tracker
- `/profile` — My orders, profile settings (avatar via Supabase Storage)
- `/sign-in` — Custom Supabase email/password sign-in + sign-up (tabs)
- `/admin` — Dashboard with stats + charts
- `/admin/products` — Product CRUD
- `/admin/orders` — Order management
- `/admin/payments` — Payment verification
- `/admin/coupons` — Coupon management
- `/admin/banners` — Banner management
- `/admin/users` — User role management (uses supabaseId)
- `/admin/chat` — Support chat sessions
- `/admin/payment-settings` — Payment QR config
- `/admin/products/:id/variants` — Product variant management

## Features

- Supabase Auth (email/password, forgot password, inline password change)
- Guest checkout (no login required)
- Role-based access control (user / staff / admin)
- Manual payment verification via screenshot upload
- QR codes for eSewa, Khalti, IME Pay
- Coupon system (percentage or fixed discounts)
- Live chat with bot auto-replies + staff messaging
- Homepage banner carousel (admin-managed)
- Floating chat widget on all public pages
- Avatar upload directly to Supabase Storage

## Sample Data

- 10 products across all categories
- 3 homepage banners
- 2 coupons: GAMER10 (10% off), WELCOME50 (Rs.50 off)

## Important Notes

- First user to sign up gets role "user" — promote to admin via `/api/admin/users/{supabaseId}/role`
- `POST /api/users/sync` is called automatically on sign-up to create the DB profile
- Avatar uploads go directly to Supabase Storage from the frontend (bucket: `gaming-store`, path: `avatars/{userId}/{timestamp}.ext`)
- Payment screenshots stored as hosted URLs in the `payments` table

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
