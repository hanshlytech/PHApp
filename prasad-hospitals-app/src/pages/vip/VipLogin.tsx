import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function VipLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const role = await login(username, password);
      if (role === 'reception') navigate('/vip/scan');
      else setError('Not a reception account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1d2f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 rounded-full mx-auto w-fit mb-4">
            <span className="material-symbols-outlined text-[#8cda5a]">stars</span>
            <span className="font-headline font-bold text-lg text-[#8cda5a]">VIP Flow</span>
          </div>
          <h1 className="text-2xl font-headline font-bold text-white">Prasad Hospitals</h1>
          <p className="text-slate-400 text-sm mt-1 tracking-widest uppercase font-semibold">Reception Kiosk</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8cda5a]/40 placeholder-slate-500"
              placeholder="reception"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8cda5a]/40 placeholder-slate-500"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-error text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#8cda5a] to-[#6ab539] text-[#0a2100] font-headline font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-[#8cda5a]/20 active:scale-95 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
