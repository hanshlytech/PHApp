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
