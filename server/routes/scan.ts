import { Router } from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// Look up card by QR code
router.get('/:qrCode', async (req, res) => {
  const { data: card, error } = await db
    .from('cards')
    .select('*')
    .eq('card_number', req.params.qrCode)
    .maybeSingle();

  if (error || !card) {
    res.status(404).json({ error: 'Card not found', status: 'INVALID' });
    return;
  }

  // Auto-expire if past expiry date
  const isExpired = new Date(card.expiry_date) < new Date();
  if (isExpired && card.status === 'active') {
    await db.from('cards').update({ status: 'expired' }).eq('id', card.id);
    card.status = 'expired';
  }

  const { data: members } = await db
    .from('members')
    .select('*')
    .eq('card_id', card.id)
    .order('is_primary', { ascending: false });

  res.json({ ...card, members: members || [] });
});

export default router;
