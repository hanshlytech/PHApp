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
