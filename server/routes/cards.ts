import { Router } from 'express';
import QRCode from 'qrcode';
import db from '../db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { generateCardNumber } from '../utils/cardNumber.js';

const router = Router();
router.use(verifyToken, requireRole('admin'));

// List all cards with primary name, member count, visit count
router.get('/', async (_req, res) => {
  const { data: cards, error } = await db
    .from('cards')
    .select('*, members(id, name, is_primary), visits(id)')
    .order('created_at', { ascending: false });

  if (error) { res.status(500).json({ error: error.message }); return; }

  const result = (cards || []).map((c) => {
    const primaryMember = c.members?.find((m: { is_primary: boolean }) => m.is_primary);
    return {
      id: c.id,
      card_number: c.card_number,
      aadhaar_last4: c.aadhaar_last4,
      issued_date: c.issued_date,
      expiry_date: c.expiry_date,
      status: c.status,
      branch: c.branch,
      created_at: c.created_at,
      member_count: c.members?.length || 0,
      visit_count: c.visits?.length || 0,
      primary_name: primaryMember?.name || null,
    };
  });

  res.json(result);
});

// Create card + members
router.post('/', async (req, res) => {
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

  const card_number = await generateCardNumber();
  const issuedDate = issued_date || new Date().toISOString().split('T')[0];
  const expiryDate = new Date(issuedDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  const { data: card, error: cardError } = await db
    .from('cards')
    .insert({
      card_number,
      aadhaar_last4,
      issued_date: issuedDate,
      expiry_date: expiryDate.toISOString().split('T')[0],
      branch,
    })
    .select('id')
    .single();

  if (cardError || !card) {
    res.status(500).json({ error: cardError?.message || 'Failed to create card' });
    return;
  }

  const memberRows = members.map((m) => ({
    card_id: card.id,
    name: m.name,
    relation: m.relation,
    dob: m.dob || null,
    is_primary: Boolean(m.is_primary),
  }));

  const { error: memberError } = await db.from('members').insert(memberRows);
  if (memberError) {
    res.status(500).json({ error: memberError.message });
    return;
  }

  res.status(201).json({ card_id: card.id, card_number });
});

// Get single card with members and visits
router.get('/:id', async (req, res) => {
  const { data: card, error } = await db
    .from('cards')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (error || !card) { res.status(404).json({ error: 'Card not found' }); return; }

  const { data: members } = await db
    .from('members')
    .select('*')
    .eq('card_id', card.id)
    .order('is_primary', { ascending: false });

  const { data: visits } = await db
    .from('visits')
    .select('*, members(name)')
    .eq('card_id', card.id)
    .order('visited_at', { ascending: false });

  const formattedVisits = (visits || []).map((v) => ({
    ...v,
    member_name: v.members?.name || null,
    members: undefined,
  }));

  res.json({ ...card, members: members || [], visits: formattedVisits });
});

// Update card status
router.patch('/:id', async (req, res) => {
  const { status } = req.body as { status: string };
  if (!['active', 'suspended'].includes(status)) {
    res.status(400).json({ error: 'status must be active or suspended' });
    return;
  }

  const { error } = await db
    .from('cards')
    .update({ status })
    .eq('id', req.params.id);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ ok: true });
});

// Generate QR code
router.get('/:id/qr', async (req, res) => {
  const { data: card } = await db
    .from('cards')
    .select('card_number')
    .eq('id', req.params.id)
    .maybeSingle();

  if (!card) { res.status(404).json({ error: 'Card not found' }); return; }

  const dataUrl = await QRCode.toDataURL(card.card_number, { width: 300, margin: 2 });
  res.json({ qr: dataUrl, card_number: card.card_number });
});

export default router;
