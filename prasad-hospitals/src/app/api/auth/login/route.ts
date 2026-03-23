import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'username and password required' }, { status: 400 });
  }

  const { data: user, error } = await db
    .from('users')
    .select('id, password_hash, role')
    .eq('username', username)
    .maybeSingle();

  if (error || !user || !bcrypt.compareSync(password, user.password_hash)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signToken({ user_id: user.id, role: user.role });

  const response = NextResponse.json({ token, role: user.role, user_id: user.id });
  response.cookies.set('vip_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24h
    path: '/',
  });
  return response;
}
