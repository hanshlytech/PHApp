import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthFromCookies } from '@/lib/auth';

export async function GET() {
  const auth = await getAuthFromCookies();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { count: total } = await db.from('cards').select('*', { count: 'exact', head: true });
  const { count: active } = await db.from('cards').select('*', { count: 'exact', head: true }).eq('status', 'active');
  const { count: expired } = await db.from('cards').select('*', { count: 'exact', head: true }).eq('status', 'expired');
  const { count: suspended } = await db.from('cards').select('*', { count: 'exact', head: true }).eq('status', 'suspended');

  return NextResponse.json({
    total: total || 0, active: active || 0, expired: expired || 0, suspended: suspended || 0,
  });
}
