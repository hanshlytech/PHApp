import { Router } from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

router.post('/', async (req, res) => {
  const { card_id, member_id, service_type, branch } = req.body as {
    card_id: number; member_id: number; service_type: string; branch: string;
  };

  if (!card_id || !member_id || !service_type || !branch) {
    res.status(400).json({ error: 'card_id, member_id, service_type, branch are required' });
    return;
  }

  // Verify card is active
  const { data: card } = await db
    .from('cards')
    .select('status')
    .eq('id', card_id)
    .maybeSingle();

  if (!card || card.status !== 'active') {
    res.status(403).json({ error: 'Card is not active' });
    return;
  }

  const { data: visit, error } = await db
    .from('visits')
    .insert({
      card_id,
      member_id,
      service_type,
      branch,
      receptionist_id: req.user!.user_id,
    })
    .select('id')
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json({ visit_id: visit.id });
});

export default router;
