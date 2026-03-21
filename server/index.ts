import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import cardsRouter from './routes/cards.js';
import scanRouter from './routes/scan.js';
import visitsRouter from './routes/visits.js';
import statsRouter from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173', process.env.FRONTEND_URL || ''].filter(Boolean) }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/cards', cardsRouter);
app.use('/api/scan', scanRouter);
app.use('/api/visits', visitsRouter);
app.use('/api/stats', statsRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
