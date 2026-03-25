import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCards } from '../../api/cards';
import { getStats } from '../../api/stats';
import StatsRow from '../../components/admin/StatsRow';
import CardRow from '../../components/admin/CardRow';
import AdminLayout from '../../components/admin/AdminLayout';
import type { Card } from '../../api/cards';
import type { Stats } from '../../api/stats';

export default function CardsList() {
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
    <AdminLayout>
      {/* Stats Bento Grid */}
      <StatsRow stats={stats} />

      {/* Table Actions */}
      <section className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-surface-container-low p-6 rounded-xl">
        <div className="flex-1 flex flex-col md:flex-row gap-4 w-full">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID or branch..."
              className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm font-body shadow-sm"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-surface-container-lowest border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm font-body shadow-sm min-w-[160px]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/admin/cards/new')}
          className="signature-gradient text-white px-6 py-3 rounded-lg flex items-center gap-2 font-headline font-bold text-sm shadow-lg hover:shadow-primary/20 transition-all active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New Card
        </button>
      </section>

      {/* Data Table */}
      {loading && (
        <div className="text-on-surface-variant text-sm py-8 text-center">Loading...</div>
      )}
      {error && (
        <div className="text-error text-sm py-4">{error}</div>
      )}
      {!loading && !error && (
        <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_12px_24px_rgba(25,28,29,0.04)] border border-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-surface-variant/20">
                <tr>
                  {['Member Name', 'Card ID', 'Expiry Date', 'Branch', 'Status', 'Visits'].map(h => (
                    <th key={h} className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant font-label">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filtered.map(c => <CardRow key={c.id} card={c} />)}
                {!filtered.length && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant text-sm">No cards found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </AdminLayout>
  );
}
