import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthFromCookies } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ qrCode: string }> }) {
  const auth = await getAuthFromCookies();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { qrCode } = await params;

  const { data: card, error } = await db
    .from('cards')
    .select('*')
    .eq('card_number', qrCode)
    .maybeSingle();

  if (error || !card) {
    return NextResponse.json({ error: 'Card not found', status: 'INVALID' }, { status: 404 });
  }

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

  return NextResponse.json({ ...card, members: members || [] });
}
