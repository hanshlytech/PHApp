import { apiFetch } from './client';
import type { Member } from './cards';

export interface ScannedCard {
  id: number;
  card_number: string;
  status: 'active' | 'expired' | 'suspended';
  expiry_date: string;
  branch: string;
  members: Member[];
}

export const scanQr = (qrCode: string) => apiFetch<ScannedCard>(`/api/scan/${encodeURIComponent(qrCode)}`);

export const logVisit = (body: { card_id: number; member_id: number; service_type: string; branch: string }) =>
  apiFetch<{ visit_id: number }>('/api/visits', { method: 'POST', body: JSON.stringify(body) });
