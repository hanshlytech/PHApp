import { Router } from 'express';
import QRCode from 'qrcode';
import db from '../db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { generateCardNumber } from '../utils/cardNumber.js';

const router = Router();
router.use(verifyToken, requireRole('admin'));

// List all cards with primary name
router.get('/', (_req, res) => {
  const cards = db.prepare(`
    SELECT c.*,
      (SELECT COUNT(*) FROM members WHERE card_id = c.id) AS member_count,
      (SELECT COUNT(*) FROM visits WHERE card_id = c.id) AS visit_count,
      (SELECT name FROM members WHERE card_id = c.id AND is_primary = 1 LIMIT 1) AS primary_name
    FROM cards c ORDER BY c.created_at DESC
  `).all();
  res.json(cards);
});

// Create card + members
router.post('/', (req, res) => {
  const { aadhaar_last4, branch, issued_date, members } = req.body as {
    aadhaar_last4: string;
    branch: string;
    issued_date?: string;
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

  res.json({ ...card as object, members, visits });
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
