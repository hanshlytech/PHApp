import { Router } from 'express';
import db from '../db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken, requireRole('admin'));

router.get('/', async (_req, res) => {
  const { count: total } = await db.from('cards').select('*', { count: 'exact', head: true });
  const { count: active } = await db.from('cards').select('*', { count: 'exact', head: true }).eq('status', 'active');
  const { count: expired } = await db.from('cards').select('*', { count: 'exact', head: true }).eq('status', 'expired');
  const { count: suspended } = await db.from('cards').select('*', { count: 'exact', head: true }).eq('status', 'suspended');

  res.json({
    total: total || 0,
    active: active || 0,
    expired: expired || 0,
    suspended: suspended || 0,
  });
});

export default router;
