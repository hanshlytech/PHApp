import { Router } from 'express';
import db from '../db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken, requireRole('admin'));

router.get('/', (_req, res) => {
  const total = (db.prepare('SELECT COUNT(*) as n FROM cards').get() as { n: number }).n;
  const active = (db.prepare("SELECT COUNT(*) as n FROM cards WHERE status = 'active'").get() as { n: number }).n;
  const expired = (db.prepare("SELECT COUNT(*) as n FROM cards WHERE status = 'expired'").get() as { n: number }).n;
  const suspended = (db.prepare("SELECT COUNT(*) as n FROM cards WHERE status = 'suspended'").get() as { n: number }).n;
  res.json({ total, active, expired, suspended });
});

export default router;
