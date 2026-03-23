import { db } from '@/lib/db';
import { CardsListClient } from './cards-list-client';

async function getCards() {
  const { data: cards } = await db
    .from('cards')
    .select('*, members(id, name, is_primary), visits(id)')
    .order('created_at', { ascending: false });

  return (cards || []).map((c: any) => {
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
}

export default async function CardsPage() {
  const cards = await getCards();
  return <CardsListClient initialCards={cards} />;
}
