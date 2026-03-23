import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { db } from '@/lib/db';
import { getAuthFromCookies } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthFromCookies();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  const { data: card } = await db
    .from('cards')
    .select('card_number')
    .eq('id', id)
    .maybeSingle();

  if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 });

  const dataUrl = await QRCode.toDataURL(card.card_number, { width: 300, margin: 2 });
  return NextResponse.json({ qr: dataUrl, card_number: card.card_number });
}
