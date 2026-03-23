import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthFromCookies } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthFromCookies();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  const { data: card, error } = await db
    .from('cards')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !card) return NextResponse.json({ error: 'Card not found' }, { status: 404 });

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

  const formattedVisits = (visits || []).map((v: any) => ({
    ...v,
    member_name: v.members?.name || null,
    members: undefined,
  }));

  return NextResponse.json({ ...card, members: members || [], visits: formattedVisits });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthFromCookies();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await req.json();
  if (!['active', 'suspended'].includes(status)) {
    return NextResponse.json({ error: 'status must be active or suspended' }, { status: 400 });
  }

  const { error } = await db.from('cards').update({ status }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
