import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthFromCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const auth = await getAuthFromCookies();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { card_id, member_id, service_type, branch } = await req.json();

  if (!card_id || !member_id || !service_type || !branch) {
    return NextResponse.json({ error: 'card_id, member_id, service_type, branch are required' }, { status: 400 });
  }

  const { data: card } = await db
    .from('cards')
    .select('status')
    .eq('id', card_id)
    .maybeSingle();

  if (!card || card.status !== 'active') {
    return NextResponse.json({ error: 'Card is not active' }, { status: 403 });
  }

  const { data: visit, error } = await db
    .from('visits')
    .insert({ card_id, member_id, service_type, branch, receptionist_id: auth.user_id })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ visit_id: visit.id }, { status: 201 });
}
