import { apiFetch } from './client';

export interface LoginResponse {
  token: string;
  role: 'admin' | 'reception';
  user_id: number;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}
