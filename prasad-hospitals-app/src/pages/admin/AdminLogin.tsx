import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLogin() {
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
      if (role === 'admin') navigate('/admin/cards');
      else setError('Not an admin account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl signature-gradient flex items-center justify-center text-white mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">clinical_notes</span>
          </div>
          <h1 className="text-2xl font-headline font-bold text-primary">Prasad Hospitals</h1>
          <p className="text-on-surface-variant text-sm mt-1 tracking-widest uppercase font-semibold">Admin Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl p-8 space-y-5 shadow-[0_12px_24px_rgba(25,28,29,0.06)] border border-outline-variant/10">
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Username</label>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface text-sm focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all"
              placeholder="admin"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-on-surface text-sm focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-error text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full signature-gradient text-white font-headline font-bold py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-95 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
