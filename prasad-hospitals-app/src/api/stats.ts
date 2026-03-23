import { apiFetch } from './client';

export interface Stats { total: number; active: number; expired: number; suspended: number; }
export const getStats = () => apiFetch<Stats>('/api/stats');
