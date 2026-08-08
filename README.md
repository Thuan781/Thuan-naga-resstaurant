# Thuan Naga Restaurant — Online Ordering Platform

A full-stack food ordering & delivery platform for **Thuan Naga Restaurant, Tamenglong, Manipur** —
the Phase 1 MVP of the project brief: authentication, menu browsing with customisations, cart,
COD checkout, live order tracking, reviews, and a complete admin panel.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS v4 + Prisma + PostgreSQL + Zustand**.

## Demo accounts

Login is **email + OTP** (no passwords). Enter the email and use the 6-digit code shown on screen
(no email service is connected yet, so the code is displayed instead of emailed).

| Role     | Email               |
| -------- | ------------------- |
| Admin    | kthuan781@gmail.com |
| Customer | demo@thuannaga.com  |

## Getting started

The app uses **PostgreSQL** (free hosted options: Neon, Supabase, Vercel Postgres).

```bash
npm install
cp .env.example .env    # then paste your DATABASE_URL into .env
npx prisma db push      # create the database tables
npm run db:seed         # seed menu, users, sample orders, settings
npm run dev             # http://localhost:3000
```


## Deploying to Vercel

1. Push this project to a GitHub repository.
2. Sign in at [vercel.com](https://vercel.com) → **Add New → Project** → import the repo (Vercel auto-detects Next.js).
3. In **Settings → Environment Variables**, add `DATABASE_URL` = your PostgreSQL connection string (same one from `.env`).
4. Deploy. The `vercel-build` script syncs the database schema automatically on every deploy —
   it never re-runs the seed, so live orders are preserved.

## Google sign-in (optional)

The login pages (customer and staff) show a **Continue with Google** button once Google OAuth keys are configured:

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create/select a project → **APIs & Services → Credentials → Create Credentials → OAuth client ID** (type: Web application).
2. Add an **Authorized redirect URI**: `https://YOUR-DOMAIN/auth/google/callback` (for local testing, `http://localhost:3000/auth/google/callback`).
3. Copy the client ID and secret into `.env` (and into Vercel **Settings → Environment Variables**):
   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Restart the dev server, and the button appears.
4. Customers signing in with Google get an account automatically. Staff signing in with Google can access the admin panel only if their email was added in **Admin → Settings → Admin access**.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm start` — production build & serve
- `npm run db:push` — sync Prisma schema to the database
- `npm run db:seed` — (re)seed demo data
- `npm run db:studio` — browse the database in Prisma Studio

## What's included (Phase 1 MVP)

**Customer**
- Register / login with bcrypt-hashed passwords and secure cookie sessions
- Menu with categories, search, veg/spice/price filters, trending section
- Dish detail with add-ons, quantity, and special instructions
- Cart with promo codes (WELCOME10, SPICY15, THUAN20) and live totals
- Checkout with saved addresses, COD-only payments, and store-status gating
- Order tracking timeline (Confirmed → Preparing → Ready → Out for Delivery → Delivered)
  with auto-refresh, plus order history, one-click reorder, and reviews/ratings

**Admin (`/admin`)**
- Dashboard: today's revenue, order counts, top items, payment split
- Menu management: add / edit / delete items and categories
- Order management: filter, advance status, cancel with reason
- Store settings: open/limited/closed status, operating hours per day,
  delivery fees & minimum order, COD toggles and limits

## Project structure

```
prisma/schema.prisma   # data model (users, sessions, menu, orders, settings, promos)
prisma/seed.ts         # demo data
src/app/               # routes (customer + /admin)
src/components/        # shared UI
src/actions/           # server actions (auth, orders, admin)
src/lib/               # prisma client, auth, validation, status logic
src/store/cart.ts      # Zustand cart with localStorage persistence
```

## Photo credits

Dish photos in `public/food/` are placeholder stock photography for development:

- Most dishes: [TheMealDB](https://www.themealdb.com/) meal photos (free for non-commercial use).
- Naga Thali, Ginger Honey Lemonade, Naga Black Tea, Fresh Lime Soda: [Wikimedia Commons](https://commons.wikimedia.org/)
  (CC BY-SA / CC BY licensed; credits recorded in `prisma/seed.ts` by file number).

Replace these with real photos of the restaurant's dishes before launch.

## Roadmap (later phases from the brief)

- Phase 2: Razorpay (UPI / cards / wallets) + payment status & refunds
- Phase 3: real-time socket updates, delivery-partner tracking with maps
- Phase 4: Google/Apple OAuth, 3D product views (Three.js/Spline)
- Phase 5: referrals, loyalty points, analytics dashboards
