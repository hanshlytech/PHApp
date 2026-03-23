import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCards } from '../../api/cards';
import { getStats } from '../../api/stats';
import { useAuth } from '../../hooks/useAuth';
import StatsRow from '../../components/admin/StatsRow';
import CardRow from '../../components/admin/CardRow';
import type { Card } from '../../api/cards';
import type { Stats } from '../../api/stats';

export default function CardsList() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, expired: 0, suspended: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getCards(), getStats()])
      .then(([c, s]) => { setCards(c); setStats(s); })
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = cards.filter(c => {
    const matchesSearch = !search ||
      (c.primary_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      c.card_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">VIP Cards</h1>
            <p className="text-slate-500 text-sm">Prasad Hospitals Admin</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/cards/new')}
              className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              + New Card
            </button>
            <button
              onClick={logout}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-3 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <StatsRow stats={stats} />

        <div className="flex gap-3 mb-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or card ID..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {loading && <div className="text-slate-500 text-sm py-8 text-center">Loading...</div>}
        {error && <div className="text-red-400 text-sm py-4">{error}</div>}
        {!loading && !error && (
          <div className="bg-slate-900 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Card Holder', 'Card ID', 'Expires', 'Branch', 'Status', 'Visits'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => <CardRow key={c.id} card={c} />)}
                {!filtered.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">No cards found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
