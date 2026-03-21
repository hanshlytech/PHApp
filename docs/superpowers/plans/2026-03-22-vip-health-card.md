# VIP Health Card POC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a VIP health card management POC for Prasad Hospitals — QR-based card tracking with a reception scan wizard and admin portal.

**Architecture:** Extend the existing React/Vite/Tailwind frontend with new `/vip/*` and `/admin/*` routes. A new standalone Node/Express/SQLite backend runs alongside. Frontend communicates with the backend via a thin API client. Wizard state (scanned card data) flows through React context between the 3-step reception flow.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind CSS, React Router DOM v7, Node.js, Express, better-sqlite3, jsonwebtoken, bcryptjs, qrcode, html5-qrcode

---

## Parallel Execution Map

```
Phase 1 (parallel):
  Task 1 — Backend foundation (schema + auth + all API routes)
  Task 2 — Frontend foundation (routing + auth hooks + API client + login screens)

Phase 2 (parallel, after Phase 1):
  Task 3 — Admin portal (cards list + create card + card detail)
  Task 4 — Reception wizard (scan + member + service + confirm steps)

Phase 3 (sequential, after Phase 2):
  Task 5 — Seed data + integration polish + deployment config
```

---

## File Map

### New Backend (`server/`)
```
server/
  package.json              — backend dependencies (express, better-sqlite3, jsonwebtoken, bcryptjs, qrcode, cors)
  tsconfig.json             — backend TS config
  index.ts                  — Express app, CORS, route mounting, port 3001
  db.ts                     — SQLite connection, schema creation (CREATE TABLE IF NOT EXISTS)
  seed.ts                   — Insert default admin + reception users (run once)
  middleware/
    auth.ts                 — verifyToken middleware, attaches req.user = { user_id, role }
  routes/
    auth.ts                 — POST /api/auth/login
    cards.ts                — GET/POST /api/cards, GET/PATCH /api/cards/:id, GET /api/cards/:id/qr
    scan.ts                 — GET /api/scan/:qrCode, POST /api/visits
    stats.ts                — GET /api/stats
  utils/
    cardNumber.ts           — generateCardNumber() → "PH-{YEAR}-{4 ALPHANUM}"
```

### New Frontend (`src/`)
```
src/
  api/
    client.ts               — base fetch wrapper (sets Authorization header, base URL)
    auth.ts                 — login(username, password), logout
    cards.ts                — getCards, createCard, getCard, patchCardStatus, getCardQr
    scan.ts                 — scanQr(qrCode), logVisit(body)
    stats.ts                — getStats
  hooks/
    useAuth.ts              — JWT storage (localStorage), { user, token, login, logout, isAdmin, isReception }
  context/
    VipWizardContext.tsx    — wizard state { card, members, selectedMember, selectedService }, actions
  pages/
    vip/
      VipLogin.tsx          — reception login form
      ScanStep.tsx          — Step 1: html5-qrcode camera + hardware input
      MemberStep.tsx        — Step 2: card status badge + member tiles
      ServiceStep.tsx       — Step 3: service selector + log visit button
      ConfirmStep.tsx       — success screen + "Scan Next" reset
    admin/
      AdminLogin.tsx        — admin login form
      CardsList.tsx         — searchable table + stats row + New Card button
      CreateCard.tsx        — form for primary + up to 3 dependents
      CardDetail.tsx        — banner + tabs (visit history / per member)
  components/
    vip/
      StatusBadge.tsx       — ACTIVE / EXPIRED / INVALID badge
      MemberTile.tsx        — clickable member card
      ServiceOption.tsx     — clickable service button
    admin/
      StatsRow.tsx          — { total, active, expired, suspended } counts
      CardRow.tsx           — single row in cards table
      MemberChip.tsx        — compact member name+relation chip
  App.tsx                   — MODIFY: add /vip/* and /admin/* route groups
```

---

## Task 1: Backend Foundation

**Working directory:** `/Users/srikanthananthula/Projects/Google-review`

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/db.ts`
- Create: `server/utils/cardNumber.ts`
- Create: `server/middleware/auth.ts`
- Create: `server/routes/auth.ts`
- Create: `server/routes/cards.ts`
- Create: `server/routes/scan.ts`
- Create: `server/routes/stats.ts`
- Create: `server/index.ts`
- Create: `server/seed.ts`

- [ ] **Step 1: Create server directory and package.json**

```bash
mkdir -p server/middleware server/routes server/utils
```

Create `server/package.json`:
```json
{
  "name": "prasad-hospitals-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "seed": "tsx seed.ts"
  },
  "dependencies": {
    "better-sqlite3": "^9.4.3",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "express": "^4.18.3",
    "jsonwebtoken": "^9.0.2",
    "qrcode": "^1.5.3"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/better-sqlite3": "^7.6.8",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/qrcode": "^1.5.5",
    "tsx": "^4.7.1",
    "typescript": "~5.9.3"
  }
}
```

- [ ] **Step 2: Create server/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "outDir": "dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Install backend dependencies**

```bash
cd server && npm install
```

Expected: `node_modules` created, no errors.

- [ ] **Step 4: Create server/db.ts — SQLite schema**

```typescript
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'prasad-vip.db');

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL CHECK(role IN ('admin', 'reception'))
  );

  CREATE TABLE IF NOT EXISTS cards (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    card_number   TEXT UNIQUE NOT NULL,
    aadhaar_last4 TEXT NOT NULL CHECK(length(aadhaar_last4) = 4),
    issued_date   TEXT NOT NULL,
    expiry_date   TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'expired', 'suspended')),
    branch        TEXT NOT NULL CHECK(branch IN ('Kukatpally', 'Ameerpet', 'Miyapur')),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS members (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id    INTEGER NOT NULL REFERENCES cards(id),
    name       TEXT NOT NULL,
    relation   TEXT NOT NULL CHECK(relation IN ('primary', 'spouse', 'child', 'parent')),
    dob        TEXT,
    is_primary INTEGER NOT NULL DEFAULT 0 CHECK(is_primary IN (0, 1))
  );

  CREATE TABLE IF NOT EXISTS visits (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id          INTEGER NOT NULL REFERENCES cards(id),
    member_id        INTEGER NOT NULL REFERENCES members(id),
    service_type     TEXT NOT NULL CHECK(service_type IN ('OPD', 'MRI', 'CT', 'XRAY', 'USG')),
    branch           TEXT NOT NULL,
    receptionist_id  INTEGER NOT NULL REFERENCES users(id),
    visited_at       TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export default db;
```

- [ ] **Step 5: Create server/utils/cardNumber.ts**

```typescript
import db from '../db.js';

export function generateCardNumber(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix: string;
  let candidate: string;

  do {
    suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    candidate = `PH-${year}-${suffix}`;
    const existing = db.prepare('SELECT id FROM cards WHERE card_number = ?').get(candidate);
    if (!existing) return candidate;
  } while (true);
}
```

- [ ] **Step 6: Create server/middleware/auth.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'prasad-vip-secret-dev';

export interface AuthPayload {
  user_id: number;
  role: 'admin' | 'reception';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(role: 'admin' | 'reception') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
```

- [ ] **Step 7: Create server/routes/auth.ts**

```typescript
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) {
    res.status(400).json({ error: 'username and password required' });
    return;
  }

  const user = db.prepare('SELECT id, password_hash, role FROM users WHERE username = ?').get(username) as
    | { id: number; password_hash: string; role: 'admin' | 'reception' }
    | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signToken({ user_id: user.id, role: user.role });
  res.json({ token, role: user.role, user_id: user.id });
});

export default router;
```

- [ ] **Step 8: Create server/routes/cards.ts**

```typescript
import { Router } from 'express';
import QRCode from 'qrcode';
import db from '../db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { generateCardNumber } from '../utils/cardNumber.js';

const router = Router();
router.use(verifyToken, requireRole('admin'));

// List all cards
router.get('/', (_req, res) => {
  const cards = db.prepare(`
    SELECT c.*,
      (SELECT COUNT(*) FROM members WHERE card_id = c.id) AS member_count,
      (SELECT COUNT(*) FROM visits WHERE card_id = c.id) AS visit_count
    FROM cards c ORDER BY c.created_at DESC
  `).all();
  res.json(cards);
});

// Create card + members
router.post('/', (req, res) => {
  const { aadhaar_last4, branch, issued_date, members } = req.body as {
    aadhaar_last4: string;
    branch: string;
    issued_date: string;
    members: Array<{ name: string; relation: string; dob?: string; is_primary: number }>;
  };

  if (!/^\d{4}$/.test(aadhaar_last4)) {
    res.status(400).json({ error: 'aadhaar_last4 must be 4 digits' });
    return;
  }
  if (!members?.length || members.length > 4) {
    res.status(400).json({ error: 'Between 1 and 4 members required' });
    return;
  }

  const card_number = generateCardNumber();
  const issuedDate = issued_date || new Date().toISOString().split('T')[0];
  const expiryDate = new Date(issuedDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  const insertCard = db.prepare(
    'INSERT INTO cards (card_number, aadhaar_last4, issued_date, expiry_date, branch) VALUES (?, ?, ?, ?, ?)'
  );
  const insertMember = db.prepare(
    'INSERT INTO members (card_id, name, relation, dob, is_primary) VALUES (?, ?, ?, ?, ?)'
  );

  const createCard = db.transaction(() => {
    const result = insertCard.run(card_number, aadhaar_last4, issuedDate, expiryDate.toISOString().split('T')[0], branch);
    const card_id = result.lastInsertRowid as number;
    for (const m of members) {
      insertMember.run(card_id, m.name, m.relation, m.dob || null, m.is_primary);
    }
    return card_id;
  });

  const card_id = createCard();
  res.status(201).json({ card_id, card_number });
});

// Get single card with members and visits
router.get('/:id', (req, res) => {
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
  if (!card) { res.status(404).json({ error: 'Card not found' }); return; }

  const members = db.prepare('SELECT * FROM members WHERE card_id = ? ORDER BY is_primary DESC').all(req.params.id);
  const visits = db.prepare(`
    SELECT v.*, m.name as member_name
    FROM visits v JOIN members m ON v.member_id = m.id
    WHERE v.card_id = ? ORDER BY v.visited_at DESC
  `).all(req.params.id);

  res.json({ ...card, members, visits });
});

// Update card status
router.patch('/:id', (req, res) => {
  const { status } = req.body as { status: string };
  if (!['active', 'suspended'].includes(status)) {
    res.status(400).json({ error: 'status must be active or suspended' });
    return;
  }
  db.prepare('UPDATE cards SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true });
});

// Generate QR code
router.get('/:id/qr', async (req, res) => {
  const card = db.prepare('SELECT card_number FROM cards WHERE id = ?').get(req.params.id) as
    | { card_number: string } | undefined;
  if (!card) { res.status(404).json({ error: 'Card not found' }); return; }

  const dataUrl = await QRCode.toDataURL(card.card_number, { width: 300, margin: 2 });
  res.json({ qr: dataUrl, card_number: card.card_number });
});

export default router;
```

- [ ] **Step 9: Create server/routes/scan.ts and server/routes/visits.ts**

`server/routes/scan.ts` — handles `GET /api/scan/:qrCode`:

```typescript
import { Router } from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// Look up card by QR code
router.get('/:qrCode', (req, res) => {
  const card = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(req.params.qrCode) as
    | { id: number; card_number: string; status: string; expiry_date: string; branch: string } | undefined;

  if (!card) {
    res.status(404).json({ error: 'Card not found', status: 'INVALID' });
    return;
  }

  // Auto-expire if past expiry date
  const isExpired = new Date(card.expiry_date) < new Date();
  if (isExpired && card.status === 'active') {
    db.prepare("UPDATE cards SET status = 'expired' WHERE id = ?").run(card.id);
    card.status = 'expired';
  }

  const members = db.prepare('SELECT * FROM members WHERE card_id = ? ORDER BY is_primary DESC').all(card.id);
  res.json({ ...card, members });
});

export default router;
```

`server/routes/visits.ts` — handles `POST /api/visits` (separate router to avoid double-mount issue):

```typescript
import { Router } from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

router.post('/', (req, res) => {
  const { card_id, member_id, service_type, branch } = req.body as {
    card_id: number; member_id: number; service_type: string; branch: string;
  };

  if (!card_id || !member_id || !service_type || !branch) {
    res.status(400).json({ error: 'card_id, member_id, service_type, branch are required' });
    return;
  }

  // Verify card is active
  const card = db.prepare("SELECT status FROM cards WHERE id = ?").get(card_id) as { status: string } | undefined;
  if (!card || card.status !== 'active') {
    res.status(403).json({ error: 'Card is not active' });
    return;
  }

  const result = db.prepare(
    'INSERT INTO visits (card_id, member_id, service_type, branch, receptionist_id) VALUES (?, ?, ?, ?, ?)'
  ).run(card_id, member_id, service_type, branch, req.user!.user_id);

  res.status(201).json({ visit_id: result.lastInsertRowid });
});

export default router;
```

- [ ] **Step 10: Create server/routes/stats.ts**

```typescript
import { Router } from 'express';
import db from '../db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken, requireRole('admin'));

router.get('/', (_req, res) => {
  const total = (db.prepare('SELECT COUNT(*) as n FROM cards').get() as { n: number }).n;
  const active = (db.prepare("SELECT COUNT(*) as n FROM cards WHERE status = 'active'").get() as { n: number }).n;
  const expired = (db.prepare("SELECT COUNT(*) as n FROM cards WHERE status = 'expired'").get() as { n: number }).n;
  const suspended = (db.prepare("SELECT COUNT(*) as n FROM cards WHERE status = 'suspended'").get() as { n: number }).n;
  res.json({ total, active, expired, suspended });
});

export default router;
```

- [ ] **Step 11: Create server/index.ts**

```typescript
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import cardsRouter from './routes/cards.js';
import scanRouter from './routes/scan.js';
import visitsRouter from './routes/visits.js';
import statsRouter from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173', process.env.FRONTEND_URL || ''].filter(Boolean) }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/cards', cardsRouter);
app.use('/api/scan', scanRouter);
app.use('/api/visits', visitsRouter);  // separate router for POST /api/visits
app.use('/api/stats', statsRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
```

- [ ] **Step 12: Create server/seed.ts**

```typescript
import bcrypt from 'bcryptjs';
import db from './db.js';

const users = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'reception', password: 'reception123', role: 'reception' },
];

const insert = db.prepare('INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)');

for (const u of users) {
  const hash = bcrypt.hashSync(u.password, 10);
  insert.run(u.username, hash, u.role);
  console.log(`Seeded user: ${u.username} (${u.role})`);
}

// Seed 3 demo cards for management presentation
const insertCard = db.prepare('INSERT OR IGNORE INTO cards (card_number, aadhaar_last4, issued_date, expiry_date, branch) VALUES (?, ?, ?, ?, ?)');
const insertMember = db.prepare('INSERT OR IGNORE INTO members (card_id, name, relation, dob, is_primary) VALUES (?, ?, ?, ?, ?)');

const demoCards = [
  {
    card_number: 'PH-2025-DEMO1',
    aadhaar_last4: '1234',
    issued_date: '2025-03-15',
    expiry_date: '2026-03-15',
    branch: 'Kukatpally',
    members: [
      { name: 'Ravi Kumar', relation: 'primary', dob: '1980-05-10', is_primary: 1 },
      { name: 'Priya Kumar', relation: 'spouse', dob: '1983-08-22', is_primary: 0 },
      { name: 'Arjun Kumar', relation: 'child', dob: '2010-01-15', is_primary: 0 },
    ],
  },
  {
    card_number: 'PH-2025-DEMO2',
    aadhaar_last4: '5678',
    issued_date: '2025-01-10',
    expiry_date: '2026-01-10',
    branch: 'Ameerpet',
    members: [
      { name: 'Meena Iyer', relation: 'primary', dob: '1975-11-30', is_primary: 1 },
      { name: 'Suresh Iyer', relation: 'spouse', dob: '1972-04-18', is_primary: 0 },
    ],
  },
  {
    card_number: 'PH-2024-EXPR1',
    aadhaar_last4: '9012',
    issued_date: '2024-01-01',
    expiry_date: '2025-01-01',
    branch: 'Miyapur',
    members: [
      { name: 'Suresh Nair', relation: 'primary', dob: '1968-07-04', is_primary: 1 },
    ],
  },
];

const seedCards = db.transaction(() => {
  for (const c of demoCards) {
    const r = insertCard.run(c.card_number, c.aadhaar_last4, c.issued_date, c.expiry_date, c.branch);
    const card_id = r.lastInsertRowid as number;
    if (card_id) {
      for (const m of c.members) insertMember.run(card_id, m.name, m.relation, m.dob, m.is_primary);
    }
  }
});

seedCards();
console.log('Seeded demo cards');
```

- [ ] **Step 13: Run seed and verify server starts**

```bash
cd server && npm run seed
```
Expected: `Seeded user: admin`, `Seeded user: reception`, `Seeded demo cards`

```bash
cd server && npm run dev
```
Expected: `Server running on http://localhost:3001`

Test:
```bash
curl http://localhost:3001/api/health
# → {"ok":true}

curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# → {"token":"...", "role":"admin", "user_id":1}
```

- [ ] **Step 14: Commit backend**

```bash
cd /Users/srikanthananthula/Projects/Google-review
git add server/
git commit -m "feat: add VIP card backend — Express + SQLite, auth, cards, scan, stats APIs"
```

---

## Task 2: Frontend Foundation

**Working directory:** `/Users/srikanthananthula/Projects/Google-review/prasad-hospitals-app`

**Files:**
- Create: `src/api/client.ts`
- Create: `src/api/auth.ts`
- Create: `src/api/cards.ts`
- Create: `src/api/scan.ts`
- Create: `src/api/stats.ts`
- Create: `src/hooks/useAuth.ts`
- Create: `src/context/VipWizardContext.tsx`
- Create: `src/pages/vip/VipLogin.tsx`
- Create: `src/pages/admin/AdminLogin.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Install frontend dependencies**

```bash
cd prasad-hospitals-app && npm install html5-qrcode
```

- [ ] **Step 2: Create src/api/client.ts**

```typescript
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('vip_token');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
```

- [ ] **Step 3: Create src/api/auth.ts**

```typescript
import { apiFetch } from './client';

export interface LoginResponse {
  token: string;
  role: 'admin' | 'reception';
  user_id: number;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}
```

- [ ] **Step 4: Create src/api/cards.ts**

```typescript
import { apiFetch } from './client';

export interface Member {
  id: number;
  card_id: number;
  name: string;
  relation: string;
  dob?: string;
  is_primary: number;
}

export interface Card {
  id: number;
  card_number: string;
  aadhaar_last4: string;
  issued_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'suspended';
  branch: string;
  created_at: string;
  member_count?: number;
  visit_count?: number;
}

export interface Visit {
  id: number;
  card_id: number;
  member_id: number;
  member_name: string;
  service_type: string;
  branch: string;
  visited_at: string;
}

export interface CardDetail extends Card {
  members: Member[];
  visits: Visit[];
}

export interface CreateCardBody {
  aadhaar_last4: string;
  branch: string;
  issued_date?: string;
  members: Array<{ name: string; relation: string; dob?: string; is_primary: number }>;
}

export const getCards = () => apiFetch<Card[]>('/api/cards');
export const createCard = (body: CreateCardBody) => apiFetch<{ card_id: number; card_number: string }>('/api/cards', { method: 'POST', body: JSON.stringify(body) });
export const getCard = (id: number) => apiFetch<CardDetail>(`/api/cards/${id}`);
export const patchCardStatus = (id: number, status: 'active' | 'suspended') => apiFetch(`/api/cards/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const getCardQr = (id: number) => apiFetch<{ qr: string; card_number: string }>(`/api/cards/${id}/qr`);
```

- [ ] **Step 5: Create src/api/scan.ts**

```typescript
import { apiFetch } from './client';
import type { Member } from './cards';

export interface ScannedCard {
  id: number;
  card_number: string;
  status: 'active' | 'expired' | 'suspended';
  expiry_date: string;
  branch: string;
  members: Member[];
}

export const scanQr = (qrCode: string) => apiFetch<ScannedCard>(`/api/scan/${encodeURIComponent(qrCode)}`);

export const logVisit = (body: { card_id: number; member_id: number; service_type: string; branch: string }) =>
  apiFetch<{ visit_id: number }>('/api/visits', { method: 'POST', body: JSON.stringify(body) });
```

- [ ] **Step 6: Create src/api/stats.ts**

```typescript
import { apiFetch } from './client';

export interface Stats { total: number; active: number; expired: number; suspended: number; }
export const getStats = () => apiFetch<Stats>('/api/stats');
```

- [ ] **Step 7: Create src/hooks/useAuth.ts**

```typescript
import { useState, useCallback } from 'react';
import { login as apiLogin } from '../api/auth';

const TOKEN_KEY = 'vip_token';
const USER_KEY = 'vip_user';

export interface AuthUser { user_id: number; role: 'admin' | 'reception'; }

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    localStorage.setItem(TOKEN_KEY, res.token);
    const u: AuthUser = { user_id: res.user_id, role: res.role };
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
    return res.role;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return { user, login, logout, isAdmin: user?.role === 'admin', isReception: user?.role === 'reception' };
}
```

- [ ] **Step 8: Create src/context/VipWizardContext.tsx**

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';
import type { ScannedCard } from '../api/scan';
import type { Member } from '../api/cards';

interface WizardState {
  card: ScannedCard | null;
  selectedMember: Member | null;
  selectedService: string | null;
}

interface WizardContextValue extends WizardState {
  setCard: (card: ScannedCard) => void;
  setSelectedMember: (m: Member) => void;
  setSelectedService: (s: string) => void;
  reset: () => void;
}

const VipWizardContext = createContext<WizardContextValue | null>(null);

const INITIAL: WizardState = { card: null, selectedMember: null, selectedService: null };

export function VipWizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(INITIAL);

  return (
    <VipWizardContext.Provider value={{
      ...state,
      setCard: (card) => setState(s => ({ ...s, card })),
      setSelectedMember: (selectedMember) => setState(s => ({ ...s, selectedMember })),
      setSelectedService: (selectedService) => setState(s => ({ ...s, selectedService })),
      reset: () => setState(INITIAL),
    }}>
      {children}
    </VipWizardContext.Provider>
  );
}

export function useVipWizard() {
  const ctx = useContext(VipWizardContext);
  if (!ctx) throw new Error('useVipWizard must be used inside VipWizardProvider');
  return ctx;
}
```

- [ ] **Step 9: Create src/pages/vip/VipLogin.tsx**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function VipLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const role = await login(username, password);
      if (role === 'reception') navigate('/vip/scan');
      else setError('Not a reception account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Prasad Hospitals</h1>
          <p className="text-sky-400 text-sm mt-1 tracking-widest uppercase">VIP Card Scanner</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Username</label>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500"
              placeholder="reception"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 10: Create src/pages/admin/AdminLogin.tsx**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const role = await login(username, password);
      if (role === 'admin') navigate('/admin/cards');
      else setError('Not an admin account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Prasad Hospitals</h1>
          <p className="text-violet-400 text-sm mt-1 tracking-widest uppercase">Admin Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Username</label>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 11: Modify src/App.tsx — add VIP and Admin routes**

Read the current `src/App.tsx` first, then add the new route groups. The existing routes must remain intact.

Add imports at top:
```tsx
import { VipWizardProvider } from './context/VipWizardContext';
import VipLogin from './pages/vip/VipLogin';
import AdminLogin from './pages/admin/AdminLogin';
// Lazy imports for remaining pages (added in Tasks 3 & 4):
// import { lazy, Suspense } from 'react';
// const ScanStep = lazy(() => import('./pages/vip/ScanStep'));
// ... etc
```

Add routes inside the Router (alongside existing routes):
```tsx
<Route path="/vip/login" element={<VipLogin />} />
<Route path="/vip/*" element={
  <VipWizardProvider>
    <Routes>
      {/* Steps added in Task 4 */}
    </Routes>
  </VipWizardProvider>
} />
<Route path="/admin/login" element={<AdminLogin />} />
<Route path="/admin/*" element={
  <Routes>
    {/* Admin pages added in Task 3 */}
  </Routes>
} />
```

- [ ] **Step 12: Add VITE_API_URL to .env.local**

Create `prasad-hospitals-app/.env.local`:
```
VITE_API_URL=http://localhost:3001
```

- [ ] **Step 13: Verify dev server starts without TypeScript errors**

```bash
cd prasad-hospitals-app && npm run dev
```
Expected: Vite server starts, no TS errors. Open http://localhost:5173/vip/login — should show the reception login form. Open http://localhost:5173/admin/login — should show the admin login form.

- [ ] **Step 14: Commit frontend foundation**

```bash
cd /Users/srikanthananthula/Projects/Google-review
git add prasad-hospitals-app/
git commit -m "feat: frontend foundation — API client, auth hook, wizard context, login screens"
```

---

## Task 3: Admin Portal

**Depends on:** Task 1 (backend running), Task 2 (frontend foundation complete)

**Files:**
- Create: `src/components/admin/StatsRow.tsx`
- Create: `src/components/admin/CardRow.tsx`
- Create: `src/components/admin/MemberChip.tsx`
- Create: `src/pages/admin/CardsList.tsx`
- Create: `src/pages/admin/CreateCard.tsx`
- Create: `src/pages/admin/CardDetail.tsx`
- Modify: `src/App.tsx` — wire admin routes

- [ ] **Step 1: Create src/components/admin/StatsRow.tsx**

```tsx
import type { Stats } from '../../api/stats';

export default function StatsRow({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Total Cards', value: stats.total, color: 'text-sky-400', border: 'border-sky-900' },
        { label: 'Active', value: stats.active, color: 'text-green-400', border: 'border-green-900' },
        { label: 'Expired', value: stats.expired, color: 'text-red-400', border: 'border-red-900' },
        { label: 'Suspended', value: stats.suspended, color: 'text-yellow-400', border: 'border-yellow-900' },
      ].map(({ label, value, color, border }) => (
        <div key={label} className={`bg-slate-900 border ${border} rounded-lg p-3 text-center`}>
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
          <div className="text-slate-500 text-xs mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/admin/MemberChip.tsx**

```tsx
import type { Member } from '../../api/cards';

export default function MemberChip({ member }: { member: Member }) {
  return (
    <span className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-md px-2 py-0.5 text-xs text-slate-300">
      <span className="font-medium">{member.name}</span>
      <span className="text-slate-500 capitalize">· {member.relation}</span>
    </span>
  );
}
```

- [ ] **Step 3: Create src/components/admin/CardRow.tsx**

```tsx
import { useNavigate } from 'react-router-dom';
import type { Card } from '../../api/cards';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-900/60 text-green-300',
  expired: 'bg-red-900/60 text-red-300',
  suspended: 'bg-yellow-900/60 text-yellow-300',
};

export default function CardRow({ card }: { card: Card }) {
  const navigate = useNavigate();
  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors"
      onClick={() => navigate(`/admin/cards/${card.id}`)}>
      <td className="px-4 py-3">
        <div className="text-sm font-semibold text-white">{/* primary member name fetched in parent */}Card #{card.id}</div>
        <div className="text-xs text-slate-500">{card.member_count} members</div>
      </td>
      <td className="px-4 py-3 font-mono text-sm text-slate-300">{card.card_number}</td>
      <td className="px-4 py-3 text-sm text-slate-400">{card.expiry_date}</td>
      <td className="px-4 py-3 text-sm text-slate-400">{card.branch}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_STYLES[card.status] || ''}`}>
          {card.status}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-sky-400">{card.visit_count} visits</td>
    </tr>
  );
}
```

NOTE: The `GET /api/cards` response doesn't include primary member name. Update `server/routes/cards.ts` GET / query to include it:
```sql
SELECT c.*,
  (SELECT COUNT(*) FROM members WHERE card_id = c.id) AS member_count,
  (SELECT COUNT(*) FROM visits WHERE card_id = c.id) AS visit_count,
  (SELECT name FROM members WHERE card_id = c.id AND is_primary = 1 LIMIT 1) AS primary_name
FROM cards c ORDER BY c.created_at DESC
```
Update `Card` interface in `src/api/cards.ts` to add `primary_name?: string`. Update `CardRow.tsx` to use `card.primary_name || card.card_number`.

- [ ] **Step 4: Create src/pages/admin/CardsList.tsx**

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCards } from '../../api/cards';
import { getStats } from '../../api/stats';
import { useAuth } from '../../hooks/useAuth';
import StatsRow from '../../components/admin/StatsRow';
import CardRow from '../../components/admin/CardRow';
import type { Card } from '../../api/cards';
import type { Stats } from '../../api/stats';

export default function CardsList() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, expired: 0, suspended: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getCards(), getStats()])
      .then(([c, s]) => { setCards(c); setStats(s); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = cards.filter(c => {
    const matchesSearch = !search ||
      (c as any).primary_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.card_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">VIP Cards</h1>
            <p className="text-slate-500 text-sm">Prasad Hospitals Admin</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/admin/cards/new')}
              className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              + New Card
            </button>
            <button onClick={logout}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-3 py-2 rounded-lg transition-colors">
              Logout
            </button>
          </div>
        </div>

        <StatsRow stats={stats} />

        <div className="flex gap-3 mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or card ID..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-violet-500">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {loading && <div className="text-slate-500 text-sm py-8 text-center">Loading...</div>}
        {error && <div className="text-red-400 text-sm py-4">{error}</div>}
        {!loading && !error && (
          <div className="bg-slate-900 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Card Holder', 'Card ID', 'Expires', 'Branch', 'Status', 'Visits'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => <CardRow key={c.id} card={c} />)}
                {!filtered.length && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">No cards found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create src/pages/admin/CreateCard.tsx**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCard } from '../../api/cards';

const BRANCHES = ['Kukatpally', 'Ameerpet', 'Miyapur'];
const RELATIONS = ['spouse', 'child', 'parent'];

interface MemberForm { name: string; relation: string; dob: string; }

export default function CreateCard() {
  const navigate = useNavigate();
  const [primary, setPrimary] = useState({ name: '', dob: '' });
  const [aadhaar, setAadhaar] = useState('');
  const [branch, setBranch] = useState('Kukatpally');
  const [dependents, setDependents] = useState<MemberForm[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function addDependent() {
    if (dependents.length < 3) setDependents(d => [...d, { name: '', relation: 'spouse', dob: '' }]);
  }

  function updateDependent(i: number, field: keyof MemberForm, value: string) {
    setDependents(d => d.map((dep, idx) => idx === i ? { ...dep, [field]: value } : dep));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^\d{4}$/.test(aadhaar)) { setError('Aadhaar last 4 must be exactly 4 digits'); return; }
    if (!primary.name.trim()) { setError('Primary member name is required'); return; }

    setLoading(true);
    try {
      const members = [
        { name: primary.name, relation: 'primary', dob: primary.dob || undefined, is_primary: 1 },
        ...dependents.filter(d => d.name.trim()).map(d => ({ name: d.name, relation: d.relation, dob: d.dob || undefined, is_primary: 0 })),
      ];
      const res = await createCard({ aadhaar_last4: aadhaar, branch, members });
      navigate(`/admin/cards/${res.card_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create card');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/admin/cards')} className="text-slate-500 text-sm mb-6 hover:text-slate-300">← Back to Cards</button>
        <h1 className="text-2xl font-bold text-white mb-6">New VIP Card</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card details */}
          <div className="bg-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Card Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Aadhaar Last 4 Digits</label>
                <input value={aadhaar} onChange={e => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234" maxLength={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Branch</label>
                <select value={branch} onChange={e => setBranch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500">
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Primary member */}
          <div className="bg-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Primary Member</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
                <input value={primary.name} onChange={e => setPrimary(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ravi Kumar"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Date of Birth</label>
                <input type="date" value={primary.dob} onChange={e => setPrimary(p => ({ ...p, dob: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
              </div>
            </div>
          </div>

          {/* Dependents */}
          <div className="bg-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Dependents ({dependents.length}/3)</h2>
              {dependents.length < 3 && (
                <button type="button" onClick={addDependent} className="text-violet-400 text-sm hover:text-violet-300">+ Add Dependent</button>
              )}
            </div>
            {dependents.map((dep, i) => (
              <div key={i} className="grid grid-cols-3 gap-3 pb-3 border-b border-slate-700 last:border-0">
                <input value={dep.name} onChange={e => updateDependent(i, 'name', e.target.value)}
                  placeholder="Full name"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
                <select value={dep.relation} onChange={e => updateDependent(i, 'relation', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500">
                  {RELATIONS.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                </select>
                <input type="date" value={dep.dob} onChange={e => updateDependent(i, 'dob', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
              </div>
            ))}
            {!dependents.length && <p className="text-slate-500 text-sm">No dependents added yet.</p>}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/admin/cards')}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
              {loading ? 'Creating...' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create src/pages/admin/CardDetail.tsx**

```tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCard, getCardQr, patchCardStatus } from '../../api/cards';
import MemberChip from '../../components/admin/MemberChip';
import type { CardDetail as CardDetailType } from '../../api/cards';

const SERVICE_COLORS: Record<string, string> = {
  OPD: 'text-green-400', MRI: 'text-sky-400', CT: 'text-violet-400', XRAY: 'text-yellow-400', USG: 'text-orange-400',
};

export default function CardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [card, setCard] = useState<CardDetailType | null>(null);
  const [tab, setTab] = useState<'history' | 'per-member'>('history');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getCard(Number(id))
      .then(setCard)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handlePrintQr() {
    if (!id) return;
    const { qr, card_number } = await getCardQr(Number(id));
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>QR Code - ${card_number}</title>
      <style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fff;}
      h2{font-size:16px;margin-bottom:8px;} p{font-size:13px;color:#666;margin:4px 0;}</style></head>
      <body>
        <h2>Prasad Hospitals VIP Card</h2>
        <p>${card_number}</p>
        <img src="${qr}" width="250" height="250" />
        <p style="margin-top:12px;font-size:11px;color:#999;">Valid for 4 members · 1 year</p>
        <script>window.print();</script>
      </body></html>
    `);
    win.document.close();
  }

  async function toggleStatus() {
    if (!card || !id) return;
    const newStatus = card.status === 'active' ? 'suspended' : 'active';
    await patchCardStatus(Number(id), newStatus);
    setCard(c => c ? { ...c, status: newStatus } : c);
  }

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>;
  if (error || !card) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400">{error || 'Not found'}</div>;

  const primaryMember = card.members.find(m => m.is_primary) || card.members[0];
  const STATUS_BANNER: Record<string, string> = {
    active: 'from-slate-800 to-slate-900 border-green-900',
    expired: 'from-slate-800 to-red-950 border-red-900',
    suspended: 'from-slate-800 to-yellow-950 border-yellow-900',
  };
  const STATUS_BADGE: Record<string, string> = {
    active: 'bg-green-900/60 text-green-300',
    expired: 'bg-red-900/60 text-red-300',
    suspended: 'bg-yellow-900/60 text-yellow-300',
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/admin/cards')} className="text-slate-500 text-sm mb-4 hover:text-slate-300">← Back to Cards</button>

        {/* Banner */}
        <div className={`bg-gradient-to-r ${STATUS_BANNER[card.status]} border rounded-xl p-5 mb-5`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-white">{primaryMember?.name}</h1>
              <p className="text-slate-400 text-sm font-mono mt-0.5">{card.card_number} · Aadhaar ****{card.aadhaar_last4}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${STATUS_BADGE[card.status]}`}>{card.status}</span>
              {card.status !== 'expired' && (
                <button onClick={toggleStatus} className="text-xs text-slate-400 hover:text-white border border-slate-600 px-2.5 py-1 rounded-lg transition-colors">
                  {card.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {card.members.map(m => <MemberChip key={m.id} member={m} />)}
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div><span className="text-slate-500">Issued</span> <span className="text-slate-300 ml-1">{card.issued_date}</span></div>
            <div><span className="text-slate-500">Expires</span> <span className={`ml-1 ${card.status === 'expired' ? 'text-red-400' : 'text-green-400'}`}>{card.expiry_date}</span></div>
            <div><span className="text-slate-500">Branch</span> <span className="text-slate-300 ml-1">{card.branch}</span></div>
            <button onClick={handlePrintQr} className="ml-auto bg-violet-700 hover:bg-violet-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
              ⬇ Print QR
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {(['history', 'per-member'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === t ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              {t === 'history' ? 'Visit History' : 'Per Member'}
            </button>
          ))}
        </div>

        {tab === 'history' && (
          <div className="bg-slate-900 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-slate-800">
                {['Member', 'Service', 'Branch', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {card.visits.map(v => (
                  <tr key={v.id} className="border-b border-slate-800 last:border-0">
                    <td className="px-4 py-3 text-sm text-slate-300">{v.member_name}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${SERVICE_COLORS[v.service_type] || 'text-slate-300'}`}>{v.service_type}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{v.branch}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{v.visited_at.split('T')[0]}</td>
                  </tr>
                ))}
                {!card.visits.length && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">No visits recorded yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'per-member' && (
          <div className="grid grid-cols-2 gap-3">
            {card.members.map(m => {
              const memberVisits = card.visits.filter(v => v.member_id === m.id);
              const last = memberVisits[0];
              return (
                <div key={m.id} className="bg-slate-900 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {m.name[0]}
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold">{m.name}</div>
                      <div className="text-slate-500 text-xs capitalize">{m.relation}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-300 mb-0.5">{memberVisits.length}</div>
                  <div className="text-slate-500 text-xs">total visits</div>
                  {last && <div className="text-slate-400 text-xs mt-2">Last: {last.service_type} · {last.visited_at.split('T')[0]}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Wire admin routes in src/App.tsx**

Add imports and routes for CardsList, CreateCard, CardDetail inside the `/admin/*` Routes block added in Task 2.

- [ ] **Step 8: Verify admin portal end-to-end**

1. Start both servers (`npm run dev` in `server/` and `prasad-hospitals-app/`)
2. Open http://localhost:5173/admin/login — log in with `admin` / `admin123`
3. Verify cards list shows the 3 seeded demo cards with stats
4. Click New Card — create a test card with 2 members
5. Verify redirect to card detail, banner shows correct info
6. Click Visit History tab — no visits yet
7. Click Print QR — verify new tab opens with QR code and triggers print dialog

- [ ] **Step 9: Commit admin portal**

```bash
git add prasad-hospitals-app/src/components/admin prasad-hospitals-app/src/pages/admin prasad-hospitals-app/src/App.tsx
git commit -m "feat: admin portal — cards list, create card, card detail with visit history"
```

---

## Task 4: Reception Wizard

**Depends on:** Task 1 (backend running), Task 2 (frontend foundation complete)

**Files:**
- Create: `src/components/vip/StatusBadge.tsx`
- Create: `src/components/vip/MemberTile.tsx`
- Create: `src/components/vip/ServiceOption.tsx`
- Create: `src/pages/vip/ScanStep.tsx`
- Create: `src/pages/vip/MemberStep.tsx`
- Create: `src/pages/vip/ServiceStep.tsx`
- Create: `src/pages/vip/ConfirmStep.tsx`
- Modify: `src/App.tsx` — wire /vip/* routes

- [ ] **Step 1: Create src/components/vip/StatusBadge.tsx**

```tsx
type Status = 'active' | 'expired' | 'suspended' | 'INVALID';

const STYLES: Record<Status, string> = {
  active: 'bg-green-900/60 text-green-300 border-green-800',
  expired: 'bg-red-900/60 text-red-300 border-red-800',
  suspended: 'bg-yellow-900/60 text-yellow-300 border-yellow-800',
  INVALID: 'bg-red-900/60 text-red-300 border-red-800',
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${STYLES[status] || STYLES.INVALID}`}>
      {status}
    </span>
  );
}
```

- [ ] **Step 2: Create src/components/vip/MemberTile.tsx**

```tsx
import type { Member } from '../../api/cards';

interface Props { member: Member; selected: boolean; onClick: () => void; }

export default function MemberTile({ member, selected, onClick }: Props) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
        selected ? 'border-sky-500 bg-sky-950/40' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
      }`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${selected ? 'bg-sky-700 text-white' : 'bg-slate-700 text-slate-300'}`}>
        {member.name[0]}
      </div>
      <div>
        <div className="text-white font-semibold text-sm">{member.name}</div>
        <div className="text-slate-400 text-xs capitalize">{member.relation}</div>
      </div>
      {selected && <div className="ml-auto text-sky-400">✓</div>}
    </button>
  );
}
```

- [ ] **Step 3: Create src/components/vip/ServiceOption.tsx**

```tsx
interface Props { label: string; code: string; selected: boolean; onClick: () => void; }

const COLORS: Record<string, string> = {
  OPD: 'border-green-700 bg-green-950/30 text-green-300',
  MRI: 'border-sky-700 bg-sky-950/30 text-sky-300',
  CT: 'border-violet-700 bg-violet-950/30 text-violet-300',
  XRAY: 'border-yellow-700 bg-yellow-950/30 text-yellow-300',
  USG: 'border-orange-700 bg-orange-950/30 text-orange-300',
};
const SELECTED: Record<string, string> = {
  OPD: 'ring-2 ring-green-500', MRI: 'ring-2 ring-sky-500', CT: 'ring-2 ring-violet-500',
  XRAY: 'ring-2 ring-yellow-500', USG: 'ring-2 ring-orange-500',
};

export default function ServiceOption({ label, code, selected, onClick }: Props) {
  return (
    <button onClick={onClick}
      className={`p-4 rounded-xl border-2 text-center font-semibold text-sm transition-all ${COLORS[code] || 'border-slate-700 text-slate-300'} ${selected ? SELECTED[code] : 'opacity-70 hover:opacity-100'}`}>
      {label}
      {selected && <div className="text-xs mt-1 opacity-70">Selected ✓</div>}
    </button>
  );
}
```

- [ ] **Step 4: Create src/pages/vip/ScanStep.tsx**

```tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { scanQr } from '../../api/scan';
import { useVipWizard } from '../../context/VipWizardContext';
import { useAuth } from '../../hooks/useAuth';

export default function ScanStep() {
  const { setCard } = useVipWizard();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const cameraRef = useRef<Html5Qrcode | null>(null);
  // Single ref for the visible input — hardware scanner sends keystrokes here
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the visible input focused so hardware scanner keystrokes are captured
  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const qr = new Html5Qrcode('qr-reader');
    cameraRef.current = qr;
    qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decodedText) => { handleScan(decodedText); },
      () => {}
    ).catch(() => {}); // Camera may not be available — silent fail

    return () => { qr.stop().catch(() => {}); };
  }, []);

  async function handleScan(code: string) {
    if (scanning) return;
    setScanning(true);
    setError('');
    try {
      const result = await scanQr(code.trim());
      setCard(result);
      navigate('/vip/member');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Card not found');
      setScanning(false);
    }
  }

  function handleHardwareInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && manualInput.trim()) {
      handleScan(manualInput.trim());
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div>
          <h1 className="text-white font-bold">Prasad Hospitals</h1>
          <p className="text-sky-400 text-xs tracking-widest uppercase">VIP Card Scanner</p>
        </div>
        <button onClick={logout} className="text-slate-500 text-xs hover:text-slate-300">Logout</button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 py-4">
        {[1, 2, 3].map(n => (
          <div key={n} className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${n === 1 ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-500'}`}>{n}</div>
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pb-6 max-w-md mx-auto w-full">
        <h2 className="text-white font-semibold text-lg mb-1">Scan QR Code</h2>
        <p className="text-slate-500 text-sm mb-4 text-center">Point camera at the VIP card, or use the scanner</p>

        {/* Camera */}
        <div id="qr-reader" className="w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-700 mb-4" style={{ minHeight: '240px' }} />

        {/* Divider */}
        <div className="flex items-center gap-3 w-full mb-4">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-slate-600 text-xs">or type card ID</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Manual input (also captures hardware scanner) */}
        <input
          ref={inputRef}
          value={manualInput}
          onChange={e => setManualInput(e.target.value.toUpperCase())}
          onKeyDown={handleHardwareInput}
          placeholder="PH-2025-XXXX"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-sky-500 mb-3"
        />

        <button onClick={() => manualInput.trim() && handleScan(manualInput.trim())}
          disabled={!manualInput.trim() || scanning}
          className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors mb-3">
          {scanning ? 'Looking up...' : 'Look Up Card'}
        </button>

        {/* NOTE: inputRef is on the visible input above (not a hidden one).
            Hardware scanners send keystrokes to whatever input is focused.
            The visible input is focused on mount and re-focused after each scan.
            No hidden input needed. */}

        {error && (
          <div className="w-full bg-red-950/50 border border-red-800 rounded-xl p-3 text-red-300 text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
```

NOTE: `html5-qrcode` must be imported correctly. The package exports `Html5Qrcode` as a named export. Verify with: `import { Html5Qrcode } from 'html5-qrcode';`

- [ ] **Step 5: Create src/pages/vip/MemberStep.tsx**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVipWizard } from '../../context/VipWizardContext';
import StatusBadge from '../../components/vip/StatusBadge';
import MemberTile from '../../components/vip/MemberTile';
import type { Member } from '../../api/cards';

export default function MemberStep() {
  const { card, setSelectedMember, reset } = useVipWizard();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Member | null>(null);

  if (!card) { navigate('/vip/scan'); return null; }

  const isBlocked = card.status !== 'active';

  function handleContinue() {
    if (!selected) return;
    setSelectedMember(selected);
    navigate('/vip/service');
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div>
          <h1 className="text-white font-bold">Prasad Hospitals</h1>
          <p className="text-sky-400 text-xs tracking-widest uppercase">VIP Card Scanner</p>
        </div>
        <button onClick={() => { reset(); navigate('/vip/scan'); }} className="text-slate-500 text-xs hover:text-slate-300">Re-scan</button>
      </div>

      <div className="flex items-center justify-center gap-2 py-4">
        {[1, 2, 3].map(n => (
          <div key={n} className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${n === 2 ? 'bg-sky-600 text-white' : n < 2 ? 'bg-sky-900 text-sky-400' : 'bg-slate-800 text-slate-500'}`}>{n}</div>
        ))}
      </div>

      <div className="flex-1 px-6 pb-6 max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold text-lg">Who is visiting?</h2>
            <p className="text-slate-500 text-xs font-mono mt-0.5">{card.card_number}</p>
          </div>
          <StatusBadge status={card.status as any} />
        </div>

        {isBlocked ? (
          <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 text-red-300 text-sm text-center">
            <div className="text-base font-bold mb-1">Card {card.status.toUpperCase()}</div>
            <div>This card cannot be used for visits.</div>
            <button onClick={() => { reset(); navigate('/vip/scan'); }}
              className="mt-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-lg transition-colors">
              Scan Another Card
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-6">
              {card.members.map(m => (
                <MemberTile key={m.id} member={m} selected={selected?.id === m.id} onClick={() => setSelected(m)} />
              ))}
            </div>
            <button onClick={handleContinue} disabled={!selected}
              className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors">
              Continue →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create src/pages/vip/ServiceStep.tsx**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logVisit } from '../../api/scan';
import { useVipWizard } from '../../context/VipWizardContext';
import ServiceOption from '../../components/vip/ServiceOption';

const SERVICES = [
  { code: 'OPD', label: 'OPD Visit' },
  { code: 'MRI', label: 'MRI Scan' },
  { code: 'CT', label: 'CT Scan' },
  { code: 'XRAY', label: 'X-Ray' },
  { code: 'USG', label: 'Ultrasound' },
];

// POC: branch hardcoded. Per spec, multi-branch ACL and per-user branch assignment
// are explicitly out of scope. The users table has no branch column intentionally.
const BRANCH = 'Kukatpally';

export default function ServiceStep() {
  const { card, selectedMember, setSelectedService, reset } = useVipWizard();
  const navigate = useNavigate();
  const [service, setService] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!card || !selectedMember) { navigate('/vip/scan'); return null; }

  async function handleLog() {
    if (!service) return;
    setLoading(true);
    setError('');
    try {
      await logVisit({ card_id: card!.id, member_id: selectedMember!.id, service_type: service, branch: BRANCH });
      setSelectedService(service);
      navigate('/vip/confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log visit');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div>
          <h1 className="text-white font-bold">Prasad Hospitals</h1>
          <p className="text-sky-400 text-xs tracking-widest uppercase">VIP Card Scanner</p>
        </div>
        <button onClick={() => { reset(); navigate('/vip/scan'); }} className="text-slate-500 text-xs hover:text-slate-300">Re-scan</button>
      </div>

      <div className="flex items-center justify-center gap-2 py-4">
        {[1, 2, 3].map(n => (
          <div key={n} className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${n === 3 ? 'bg-sky-600 text-white' : 'bg-sky-900 text-sky-400'}`}>{n}</div>
        ))}
      </div>

      <div className="flex-1 px-6 pb-6 max-w-md mx-auto w-full">
        <h2 className="text-white font-semibold text-lg mb-1">Select Service</h2>
        <p className="text-slate-500 text-sm mb-4">Visit for <span className="text-white font-medium">{selectedMember.name}</span></p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {SERVICES.map(s => (
            <ServiceOption key={s.code} code={s.code} label={s.label} selected={service === s.code} onClick={() => setService(s.code)} />
          ))}
        </div>

        {error && <div className="bg-red-950/50 border border-red-800 rounded-xl p-3 text-red-300 text-sm text-center mb-3">{error}</div>}

        <button onClick={handleLog} disabled={!service || loading}
          className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-colors text-base">
          {loading ? 'Logging visit...' : 'Log Visit ✓'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create src/pages/vip/ConfirmStep.tsx**

```tsx
import { useNavigate } from 'react-router-dom';
import { useVipWizard } from '../../context/VipWizardContext';

const SERVICE_LABELS: Record<string, string> = {
  OPD: 'OPD Visit', MRI: 'MRI Scan', CT: 'CT Scan', XRAY: 'X-Ray', USG: 'Ultrasound',
};

export default function ConfirmStep() {
  const { card, selectedMember, selectedService, reset } = useVipWizard();
  const navigate = useNavigate();

  if (!card || !selectedMember || !selectedService) { navigate('/vip/scan'); return null; }

  const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Visit Logged</h2>
        <p className="text-green-400 text-sm mb-6">Successfully recorded</p>

        <div className="bg-slate-800 rounded-xl p-5 text-left space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Member</span>
            <span className="text-white text-sm font-semibold">{selectedMember.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Service</span>
            <span className="text-white text-sm font-semibold">{SERVICE_LABELS[selectedService] || selectedService}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Card</span>
            <span className="text-slate-300 text-sm font-mono">{card.card_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Time</span>
            <span className="text-slate-300 text-sm">{now}</span>
          </div>
        </div>

        <button onClick={() => { reset(); navigate('/vip/scan'); }}
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 rounded-xl transition-colors">
          Scan Next Card
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Wire reception routes in src/App.tsx**

Add imports and routes for ScanStep, MemberStep, ServiceStep, ConfirmStep inside the `/vip/*` Routes block.

- [ ] **Step 9: Verify reception wizard end-to-end**

1. Open http://localhost:5173/vip/login — log in with `reception` / `reception123`
2. Step 1 (Scan): type `PH-2025-DEMO1` into the manual input and press Enter
3. Step 2 (Member): verify 3 member tiles appear with ACTIVE badge. Select "Ravi Kumar"
4. Step 3 (Service): select "OPD Visit", click "Log Visit"
5. Confirm screen: verify member name, service, time are shown
6. Click "Scan Next Card" — verify wizard resets to Step 1
7. Test expired card: type `PH-2024-EXPR1` — verify EXPIRED badge and blocked state at Step 2

- [ ] **Step 10: Commit reception wizard**

```bash
git add prasad-hospitals-app/src/components/vip prasad-hospitals-app/src/pages/vip prasad-hospitals-app/src/App.tsx
git commit -m "feat: reception wizard — 3-step QR scan, member select, service log, confirm"
```

---

## Task 5: Integration Polish + Deployment Config

**Depends on:** Tasks 3 and 4 complete

**Files:**
- Modify: `prasad-hospitals-app/vite.config.ts` — proxy /api to backend in dev
- Modify: `prasad-hospitals-app/vercel.json` — add rewrites for SPA + env
- Create: `server/Procfile` (for Railway/Render)
- Modify: root `package.json` (if exists) or create a simple `dev.sh` script

- [ ] **Step 1: Add API proxy to vite.config.ts**

```typescript
// prasad-hospitals-app/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

With this proxy, the frontend can use `/api/*` paths directly in dev without needing `VITE_API_URL`. Update `src/api/client.ts` to use `''` as the base URL (empty string, so paths resolve to the same origin):

```typescript
// src/api/client.ts — change BASE_URL:
const BASE_URL = import.meta.env.VITE_API_URL || '';
```

- [ ] **Step 2: Update prasad-hospitals-app/vercel.json for SPA + API URL**

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "VITE_API_URL": "@vip-api-url"
  }
}
```

Set the Vercel environment variable `vip-api-url` to the Railway/Render backend URL via `vercel env add VITE_API_URL`.

- [ ] **Step 3: Create server/Procfile for Railway/Render**

```
web: node dist/index.js
```

Also add a `build` step in `server/package.json` that compiles TS:
```json
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js",
  "dev": "tsx watch index.ts",
  "seed": "tsx seed.ts"
}
```

- [ ] **Step 4: Add `.gitignore` entries**

In `server/`:
```
node_modules/
dist/
*.db
```

In root `.gitignore` (if present) add `.superpowers/`.

- [ ] **Step 5: Add a `dev.sh` convenience script at project root**

```bash
#!/bin/bash
# Start backend and frontend in parallel
cd server && npm run dev &
cd prasad-hospitals-app && npm run dev &
wait
```

```bash
chmod +x dev.sh
```

- [ ] **Step 6: Full end-to-end smoke test**

1. `./dev.sh` — both servers start
2. Admin flow: create a new card with 4 members, download QR, verify print preview
3. Reception flow: scan `PH-2025-DEMO1`, log an MRI visit for "Priya Kumar"
4. Admin flow: open the card, verify the MRI visit appears in Visit History under "Priya Kumar"
5. Admin: suspend the card. Reception: scan the same card — verify SUSPENDED status blocks the wizard at Step 2
6. Verify the 3 seeded cards are visible in admin list with correct stats

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "feat: vip card POC complete — integration polish, dev proxy, deployment config"
```
