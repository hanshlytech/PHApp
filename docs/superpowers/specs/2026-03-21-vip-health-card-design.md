# Prasad Hospitals VIP Health Card — POC Design Spec

**Date:** 2026-03-21
**Status:** Approved
**Scope:** POC for management presentation

---

## 1. Overview

A VIP health card management system for Prasad Hospitals. Members pay ₹4,999/year for a physical card covering 4 family members (1 primary + up to 3 dependents). The card has a QR code that reception staff scan at the counter to verify eligibility and log service visits. An admin portal allows hospital staff to create and manage cards.

---

## 2. Product Rules (from business spec)

- **Annual fee:** ₹4,999 · **Validity:** 1 year from date of issue
- **Capacity:** 1 primary + up to 3 dependents per card
- **Benefits:**
  - Unlimited OPD (no consultation fee) across all departments and all 3 branches
  - 100% scan waiver: MRI, CT Scan, X-Ray, Ultrasound
  - Priority staff assistance
- **Exclusions:** Surgery, IPD, Pharmacy, Vaccines, Labs, Emergency Department
- **Scan rule:** Scans valid only when prescribed by a Prasad Hospitals consultant (internal prescription only)
- **Policy:** Non-refundable, non-transferable. No outside prescriptions accepted.
- **Identity:** Verified via Aadhaar number and VIP card ID

---

## 3. Users & Roles

| Role | Access | Description |
|------|--------|-------------|
| **Reception staff** | `/vip/*` only | Scans cards at the counter, logs visits |
| **Admin** | `/admin/*` only | Creates cards, manages members, views visit history |

Both roles log in with username + password. JWT token (24h). No self-registration — accounts created by a super-admin (out of scope for POC, seed via script).

---

## 4. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS (extend existing app) |
| Routing | React Router DOM v7 (already in project) |
| Backend | Node.js + Express (new server) |
| Database | SQLite via `better-sqlite3` (single file, zero config) |
| QR scanning | `html5-qrcode` (camera) + keyboard input listener (hardware scanner) |
| QR generation | `qrcode` npm package |
| Auth | JWT (`jsonwebtoken`) — separate tokens for reception and admin roles |

Backend runs as a separate process alongside the Vite dev server. In production, deployed as a separate service (e.g. Railway free tier).

---

## 5. Database Schema

### `cards`
```sql
id            INTEGER PRIMARY KEY AUTOINCREMENT
card_number   TEXT UNIQUE NOT NULL        -- formatted ID: PH-{YEAR}-{4 alphanumeric uppercase}, e.g. PH-2025-A8X3
                                          -- this is also what the QR code encodes — no separate qr_code column
aadhaar_last4 TEXT NOT NULL               -- exactly 4 numeric digits (validated on input: /^\d{4}$/)
issued_date   TEXT NOT NULL               -- ISO date
expiry_date   TEXT NOT NULL               -- ISO date (issued + 1 year)
status        TEXT DEFAULT 'active'       -- active | expired | suspended
branch        TEXT NOT NULL               -- one of: 'Kukatpally' | 'Ameerpet' | 'Miyapur'
created_at    TEXT DEFAULT CURRENT_TIMESTAMP
```

### `members`
```sql
id          INTEGER PRIMARY KEY AUTOINCREMENT
card_id     INTEGER NOT NULL REFERENCES cards(id)
name        TEXT NOT NULL
relation    TEXT NOT NULL   -- primary | spouse | child | parent
dob         TEXT            -- ISO date, optional
is_primary  INTEGER DEFAULT 0   -- 1 for primary member
```

### `visits`
```sql
id               INTEGER PRIMARY KEY AUTOINCREMENT
card_id          INTEGER NOT NULL REFERENCES cards(id)
member_id        INTEGER NOT NULL REFERENCES members(id)   -- required; receptionist must select a member
service_type     TEXT NOT NULL   -- OPD | MRI | CT | XRAY | USG
branch           TEXT NOT NULL
receptionist_id  INTEGER NOT NULL REFERENCES users(id)     -- populated from JWT payload user_id
visited_at       TEXT DEFAULT CURRENT_TIMESTAMP
```

### `users` (seed only for POC)
```sql
id            INTEGER PRIMARY KEY AUTOINCREMENT
username      TEXT UNIQUE NOT NULL
password_hash TEXT NOT NULL
role          TEXT NOT NULL   -- admin | reception
-- note: no branch column — multi-branch ACL is out of scope for POC
```

---

## 6. Backend API

Base URL: `http://localhost:3001/api` (all routes below are relative to this base)

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | `{ username, password }` → `{ token, role, user_id }` |

JWT payload includes `{ user_id, role, branch }`. Frontend stores token in `localStorage` and clears it on logout (explicit logout button on both portals).

### Cards (admin only)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cards` | List all cards (with member count, visit count, status) |
| POST | `/api/cards` | Create card + members |
| GET | `/api/cards/:id` | Card detail with members and visit history |
| GET | `/api/cards/:id/qr` | Returns QR code as base64 PNG (generated on-demand from `card_number`) |
| PATCH | `/api/cards/:id` | Update card `status` only — body: `{ status: "active" \| "suspended" }` |

### Scan (reception)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/scan/:qrCode` | Look up card by QR code → returns card + members + status |
| POST | `/api/visits` | Log a visit `{ card_id, member_id, service_type, branch }` — all fields required. `branch` is submitted by the client (hardcoded to the receptionist's branch for POC) |

### Stats (admin)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/stats` | Returns `{ total, active, expired, suspended }` counts |

---

## 7. Frontend Routes

### Reception Portal
| Route | Component | Description |
|-------|-----------|-------------|
| `/vip/login` | `ReceptionLogin` | PIN/password login |
| `/vip/scan` | `ScanStep` | Step 1 — camera or hardware scanner |
| `/vip/member` | `MemberStep` | Step 2 — select which member is visiting |
| `/vip/service` | `ServiceStep` | Step 3 — select service type + log visit |
| `/vip/confirm` | `ConfirmStep` | Visit logged confirmation screen |

### Admin Portal
| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/login` | `AdminLogin` | Username/password login |
| `/admin/cards` | `CardsList` | Searchable table of all cards + stats row |
| `/admin/cards/new` | `CreateCard` | Form: primary member + up to 3 dependents |
| `/admin/cards/:id` | `CardDetail` | Banner + tabs (visit history / per member) |

---

## 8. Key UI Decisions

### Reception — 3-Step Wizard
- **Step 1 (Scan):** Camera view via `html5-qrcode` with a focused `<input>` that captures hardware scanner keystrokes ending in Enter. Both methods call `GET /api/scan/:qrCode`. On any error (network failure, invalid QR, card not found) the user stays on `/vip/scan` with an inline error message. A "Re-scan" action is always available from any later step to return to step 1.
- **Step 2 (Member):** Shows card status badge (ACTIVE in green / EXPIRED in red / INVALID in red). Lists all members as selectable tiles. If card is EXPIRED or INVALID, show a clear error — no further steps.
- **Step 3 (Service):** Five options: OPD, MRI, CT Scan, X-Ray, Ultrasound. Large tap targets. "Log Visit" button calls `POST /visits`. Redirects to confirm screen.
- **Confirm screen:** Full-screen success state with member name, service, branch, time. "Scan Next" button resets the wizard.

### Admin — Cards List
- Table columns: Card Holder, Card ID, Members, Expires, Status, Actions
- Search filters by name or card ID (client-side)
- Status filter dropdown: All / Active / Expired / Suspended
- Stats row at top: Total · Active · Expired counts
- `+ New Card` button top-right

### Admin — Card Detail
- Coloured banner: name, card ID (`PH-YYYY-XXXX`), Aadhaar last-4, member chips, issued/expiry dates, branch, **Print QR** button — clicking it fetches `GET /api/cards/:id/qr`, renders the base64 PNG in a new browser tab sized for print, and triggers `window.print()`
- Tabs:
  - **Visit History:** table (member, service, branch, date) — newest first
  - **Per Member:** visit count and last visit per member

### Card ID Format
`PH-{YEAR}-{4 random alphanumeric uppercase}` — e.g. `PH-2025-A8X3`
QR code encodes the same string. Generated server-side on card creation.

---

## 9. QR Code & Scanning

- The QR code encodes `card_number` (e.g. `PH-2025-A8X3`) — no separate field stored in the DB
- QR image generated on-demand server-side via `GET /api/cards/:id/qr` using the `qrcode` package, returned as base64 PNG
- Displayed in card detail for admin to print
- Hardware scanner (USB/BT) sends keystrokes ending in `Enter` — captured by a focused `<input>` on the scan page that auto-submits on Enter
- Camera scanning uses `html5-qrcode` — auto-detects QR, calls the same `GET /api/scan/:qrCode` lookup endpoint

---

## 10. Out of Scope (POC)

- Aadhaar API verification (store last-4 digits only, no API call)
- Photo / ID document upload
- Card renewal or payment flow
- SMS / email notifications
- Multi-branch access control (all admin users see all branches)
- Audit log
- Card printing template (Print QR shows the QR image; actual card design is separate)

---

## 11. Deployment (POC)

| Component | Where |
|-----------|-------|
| Frontend (React/Vite) | Vercel (already configured) |
| Backend (Express + SQLite) | Railway free tier or Render free tier |
| Database | SQLite file on backend server (sufficient for POC) |

---

## 12. Success Criteria for POC

1. Admin can create a VIP card with up to 4 members and download/print the QR code
2. Reception staff can scan a QR code (camera + hardware scanner) and see member details within 2 seconds
3. Reception staff can log a visit (OPD or scan type) in under 10 seconds total
4. Expired/invalid cards show a clear error at step 2 — no visit can be logged
5. Admin can view full visit history for any card
6. The UI looks polished and professional for a management presentation
