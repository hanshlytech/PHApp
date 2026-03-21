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
