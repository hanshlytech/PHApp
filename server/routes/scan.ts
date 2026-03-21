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
