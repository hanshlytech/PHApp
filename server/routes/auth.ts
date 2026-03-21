import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) {
    res.status(400).json({ error: 'username and password required' });
    return;
  }

  const user = db.prepare('SELECT id, password_hash, role FROM users WHERE username = ?').get(username) as
    | { id: number; password_hash: string; role: 'admin' | 'reception' }
    | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signToken({ user_id: user.id, role: user.role });
  res.json({ token, role: user.role, user_id: user.id });
});

export default router;
