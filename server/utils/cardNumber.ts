import db from '../db.js';

export async function generateCardNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  while (true) {
    const suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const candidate = `PH-${year}-${suffix}`;

    const { data } = await db
      .from('cards')
      .select('id')
      .eq('card_number', candidate)
      .maybeSingle();

    if (!data) return candidate;
  }
}
