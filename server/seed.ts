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
