import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'prasad-vip-secret-dev';

export interface AuthPayload {
  user_id: number;
  role: 'admin' | 'reception';
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export async function getAuthFromCookies(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('vip_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
