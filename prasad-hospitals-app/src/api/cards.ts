import { apiFetch } from './client';

export interface Member {
  id: number;
  card_id: number;
  name: string;
  relation: string;
  dob?: string;
  is_primary: number;
}

export interface Card {
  id: number;
  card_number: string;
  aadhaar_last4: string;
  issued_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'suspended';
  branch: string;
  created_at: string;
  member_count?: number;
  visit_count?: number;
  primary_name?: string;
}

export interface Visit {
  id: number;
  card_id: number;
  member_id: number;
  member_name: string;
  service_type: string;
  branch: string;
  visited_at: string;
}

export interface CardDetail extends Card {
  members: Member[];
  visits: Visit[];
}

export interface CreateCardBody {
  aadhaar_last4: string;
  branch: string;
  issued_date?: string;
  members: Array<{ name: string; relation: string; dob?: string; is_primary: number }>;
}

export const getCards = () => apiFetch<Card[]>('/api/cards');
export const createCard = (body: CreateCardBody) => apiFetch<{ card_id: number; card_number: string }>('/api/cards', { method: 'POST', body: JSON.stringify(body) });
export const getCard = (id: number) => apiFetch<CardDetail>(`/api/cards/${id}`);
export const patchCardStatus = (id: number, status: 'active' | 'suspended') => apiFetch(`/api/cards/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const getCardQr = (id: number) => apiFetch<{ qr: string; card_number: string }>(`/api/cards/${id}/qr`);
