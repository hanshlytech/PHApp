import { useState, useCallback } from 'react';
import { login as apiLogin } from '../api/auth';

const TOKEN_KEY = 'vip_token';
const USER_KEY = 'vip_user';

export interface AuthUser { user_id: number; role: 'admin' | 'reception'; }

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    localStorage.setItem(TOKEN_KEY, res.token);
    const u: AuthUser = { user_id: res.user_id, role: res.role };
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
    return res.role;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return { user, login, logout, isAdmin: user?.role === 'admin', isReception: user?.role === 'reception' };
}
