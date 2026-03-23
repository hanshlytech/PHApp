# Next.js Migration — Prasad Hospitals

**Date:** 2026-03-23
**Status:** Approved
**Scope:** Merge Express backend + Vite/React frontend into a single Next.js App Router project

## Context

- **Frontend:** React 19 + Vite + React Router v7, deployed to Vercel (SPA)
- **Backend:** Express + TypeScript, targeting Railway (migrating to Vercel)
- **Database:** Supabase (PostgreSQL) — no change
- **Auth:** JWT with bcrypt, 2 roles (admin, reception) — keeping, modernizing middleware

## Goals

1. Single Vercel project — one deploy, one URL, zero CORS
2. Server Components for read-heavy admin pages (no loading spinners)
3. Server Actions for mutations (create card, log visit, update status)
4. shadcn/ui + dark mode for admin dashboard
5. Desktop layouts for admin (sidebar + top header) and reception (sidebar)
6. Mobile pages (landing, booking, review) stay 480px max-width

## Route Structure

```
app/
├── layout.tsx              — Geist fonts, ThemeProvider
├── page.tsx                — Landing (branch selection, mobile)
├── home/page.tsx           — Home (mobile)
├── book/page.tsx           — Booking flow (mobile)
├── review/page.tsx         — Review flow (mobile)
├── vip/
│   ├── layout.tsx          — Reception sidebar: Scan Card, Log Visit
│   ├── login/page.tsx      — Login (no sidebar)
│   ├── scan/page.tsx       — QR scan (default landing)
│   ├── member/page.tsx     — Select member
│   ├── service/page.tsx    — Select service
│   └── confirm/page.tsx    — Confirm + log visit
├── admin/
│   ├── layout.tsx          — Sidebar (Dashboard, Cards) + top header (role badge, logout)
│   ├── login/page.tsx      — Login (no sidebar)
│   ├── page.tsx            — Stats dashboard (Server Component)
│   ├── cards/page.tsx      — Card list (Server Component)
│   ├── cards/new/page.tsx  — Create card (Client Component)
│   └── cards/[id]/page.tsx — Card detail (Server Component)
└── api/
    ├── auth/login/route.ts
    ├── cards/route.ts
    ├── cards/[id]/route.ts
    ├── cards/[id]/qr/route.ts
    ├── scan/[qrCode]/route.ts
    ├── visits/route.ts
    └── stats/route.ts
```

## Server-Side Architecture

### lib/
- `lib/db.ts` — Supabase client (unchanged)
- `lib/auth.ts` — JWT sign/verify helpers, cookie-based token for Server Components
- `lib/cardNumber.ts` — Card number generator (unchanged)

### Middleware
- `middleware.ts` — Protects `/admin/*` and `/vip/*` (except login pages). Reads JWT from cookie, validates, redirects to login if invalid.

### API Routes
Kept for: login (sets HTTP-only cookie), QR code generation. Admin/reception pages use Server Components + Server Actions directly.

### Server Actions
- `actions/cards.ts` — createCard, updateCardStatus
- `actions/visits.ts` — logVisit

## Auth Flow

- Login API sets HTTP-only cookie (`vip_token`) instead of localStorage
- Middleware reads cookie, validates JWT, adds user info to request headers
- Server Components read user from cookies
- Client Components use a `useAuth` hook that reads from a context populated server-side

## UI Design

### Admin (desktop, dark mode)
- **Sidebar (left, 240px):** Logo, nav links (Dashboard, Cards), collapsible on mobile
- **Top header:** Branch selector dropdown, role badge, logout button
- **Content:** Full-width, max-w-6xl centered
- shadcn components: sidebar, card, table, badge, button, dialog, dropdown-menu, skeleton, tabs

### Reception (desktop, dark mode)
- **Sidebar (left, 200px):** Logo, nav links (Scan Card, Log Visit)
- **Content:** Centered, focused workflow
- shadcn components: card, button, input, badge, select

### Mobile pages (patients)
- 480px max-width, light mode
- Keep existing Tailwind color palette as CSS variables
- Lucide icons (already used)

## Tech Stack

- Next.js (App Router), TypeScript, Tailwind CSS v4
- shadcn/ui, Geist Sans + Mono
- @supabase/supabase-js, jsonwebtoken, bcryptjs, qrcode, html5-qrcode
- Lucide React icons

## What Gets Deleted

- `server/` directory (Express backend) — fully replaced by Next.js API routes + Server Actions
- `prasad-hospitals-app/` directory (Vite SPA) — fully replaced by Next.js app
- Railway deployment config (Procfile already removed)

## Environment Variables

Same as current, minus CORS-related ones:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `NODE_ENV` (auto-set by Vercel)
