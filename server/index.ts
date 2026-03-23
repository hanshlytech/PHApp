import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import cardsRouter from './routes/cards.js';
import scanRouter from './routes/scan.js';
import visitsRouter from './routes/visits.js';
import statsRouter from './routes/stats.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
].filter(Boolean) as string[];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/cards', cardsRouter);
app.use('/api/scan', scanRouter);
app.use('/api/visits', visitsRouter);
app.use('/api/stats', statsRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Local dev only — Vercel handles routing in production
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

export default app;
