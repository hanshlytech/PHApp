import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthFromCookies } from '@/lib/auth';
import { generateCardNumber } from '@/lib/cardNumber';

export async function GET() {
  const auth = await getAuthFromCookies();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: cards, error } = await db
    .from('cards')
    .select('*, members(id, name, is_primary), visits(id)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = (cards || []).map((c: any) => {
    const primaryMember = c.members?.find((m: any) => m.is_primary);
    return {
      id: c.id, card_number: c.card_number, aadhaar_last4: c.aadhaar_last4,
      issued_date: c.issued_date, expiry_date: c.expiry_date, status: c.status,
      branch: c.branch, created_at: c.created_at,
      member_count: c.members?.length || 0,
      visit_count: c.visits?.length || 0,
      primary_name: primaryMember?.name || null,
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthFromCookies();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { aadhaar_last4, branch, issued_date, members } = await req.json();

  if (!/^\d{4}$/.test(aadhaar_last4)) {
    return NextResponse.json({ error: 'aadhaar_last4 must be 4 digits' }, { status: 400 });
  }
  if (!members?.length || members.length > 4) {
    return NextResponse.json({ error: 'Between 1 and 4 members required' }, { status: 400 });
  }

  const card_number = await generateCardNumber();
  const issuedDate = issued_date || new Date().toISOString().split('T')[0];
  const expiryDate = new Date(issuedDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  const { data: card, error: cardError } = await db
    .from('cards')
    .insert({ card_number, aadhaar_last4, issued_date: issuedDate, expiry_date: expiryDate.toISOString().split('T')[0], branch })
    .select('id')
    .single();

  if (cardError || !card) {
    return NextResponse.json({ error: cardError?.message || 'Failed to create card' }, { status: 500 });
  }

  const memberRows = members.map((m: any) => ({
    card_id: card.id, name: m.name, relation: m.relation,
    dob: m.dob || null, is_primary: Boolean(m.is_primary),
  }));

  const { error: memberError } = await db.from('members').insert(memberRows);
  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json({ card_id: card.id, card_number }, { status: 201 });
}
