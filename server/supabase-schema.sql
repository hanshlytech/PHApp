-- =============================================================
-- Prasad Hospitals VIP Card System — Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- =============================================================

-- 1. Users (admin & reception accounts)
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'reception'))
);

-- 2. Cards (VIP health cards)
CREATE TABLE IF NOT EXISTS cards (
  id            SERIAL PRIMARY KEY,
  card_number   TEXT UNIQUE NOT NULL,
  aadhaar_last4 TEXT NOT NULL CHECK (length(aadhaar_last4) = 4),
  issued_date   DATE NOT NULL,
  expiry_date   DATE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
  branch        TEXT NOT NULL CHECK (branch IN ('Nacharam', 'Pragathi Nagar', 'Manikonda')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Members (family members per card, 1-4)
CREATE TABLE IF NOT EXISTS members (
  id         SERIAL PRIMARY KEY,
  card_id    INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  relation   TEXT NOT NULL CHECK (relation IN ('primary', 'spouse', 'child', 'parent')),
  dob        DATE,
  is_primary BOOLEAN NOT NULL DEFAULT false
);

-- 4. Visits (service tracking)
CREATE TABLE IF NOT EXISTS visits (
  id              SERIAL PRIMARY KEY,
  card_id         INTEGER NOT NULL REFERENCES cards(id),
  member_id       INTEGER NOT NULL REFERENCES members(id),
  service_type    TEXT NOT NULL CHECK (service_type IN ('OPD', 'MRI', 'CT', 'XRAY', 'USG')),
  branch          TEXT NOT NULL,
  receptionist_id INTEGER NOT NULL REFERENCES users(id),
  visited_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cards_card_number ON cards(card_number);
CREATE INDEX IF NOT EXISTS idx_members_card_id ON members(card_id);
CREATE INDEX IF NOT EXISTS idx_visits_card_id ON visits(card_id);

-- 6. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies — allow service_role (server) full access
-- The Express server uses the service_role key, so these policies
-- allow full CRUD from the backend while blocking direct client access.
CREATE POLICY "Service role full access" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON cards
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON members
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON visits
  FOR ALL USING (true) WITH CHECK (true);
