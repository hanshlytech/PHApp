import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCard } from '../../api/cards';

const BRANCHES = ['Nacharam', 'Pragathi Nagar', 'Manikonda'];
const RELATIONS = ['spouse', 'child', 'parent'];

interface MemberForm { name: string; relation: string; dob: string; }

export default function CreateCard() {
  const navigate = useNavigate();
  const [primary, setPrimary] = useState({ name: '', dob: '' });
  const [aadhaar, setAadhaar] = useState('');
  const [branch, setBranch] = useState('Nacharam');
  const [dependents, setDependents] = useState<MemberForm[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function addDependent() {
    if (dependents.length < 3) setDependents(d => [...d, { name: '', relation: 'spouse', dob: '' }]);
  }

  function updateDependent(i: number, field: keyof MemberForm, value: string) {
    setDependents(d => d.map((dep, idx) => idx === i ? { ...dep, [field]: value } : dep));
  }

  function removeDependent(i: number) {
    setDependents(d => d.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^\d{4}$/.test(aadhaar)) { setError('Aadhaar last 4 must be exactly 4 digits'); return; }
    if (!primary.name.trim()) { setError('Primary member name is required'); return; }

    setLoading(true);
    try {
      const members = [
        { name: primary.name.trim(), relation: 'primary', dob: primary.dob || undefined, is_primary: 1 },
        ...dependents
          .filter(d => d.name.trim())
          .map(d => ({ name: d.name.trim(), relation: d.relation, dob: d.dob || undefined, is_primary: 0 })),
      ];
      const res = await createCard({ aadhaar_last4: aadhaar, branch, members });
      navigate(`/admin/cards/${res.card_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create card');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/admin/cards')} className="text-slate-500 text-sm mb-6 hover:text-slate-300 flex items-center gap-1">
          ← Back to Cards
        </button>
        <h1 className="text-2xl font-bold text-white mb-6">New VIP Card</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card details */}
          <div className="bg-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Card Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Aadhaar Last 4 Digits *</label>
                <input
                  value={aadhaar}
                  onChange={e => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234"
                  maxLength={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Branch *</label>
                <select
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                >
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Primary member */}
          <div className="bg-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Primary Member</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
                <input
                  value={primary.name}
                  onChange={e => setPrimary(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ravi Kumar"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={primary.dob}
                  onChange={e => setPrimary(p => ({ ...p, dob: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Dependents */}
          <div className="bg-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Dependents ({dependents.length}/3)
              </h2>
              {dependents.length < 3 && (
                <button type="button" onClick={addDependent} className="text-violet-400 text-sm hover:text-violet-300">
                  + Add Dependent
                </button>
              )}
            </div>
            {dependents.map((dep, i) => (
              <div key={i} className="grid grid-cols-3 gap-3 items-center pb-3 border-b border-slate-700 last:border-0">
                <input
                  value={dep.name}
                  onChange={e => updateDependent(i, 'name', e.target.value)}
                  placeholder="Full name"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                />
                <select
                  value={dep.relation}
                  onChange={e => updateDependent(i, 'relation', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                >
                  {RELATIONS.map(r => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dep.dob}
                    onChange={e => updateDependent(i, 'dob', e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                  />
                  <button type="button" onClick={() => removeDependent(i)} className="text-slate-500 hover:text-red-400 text-lg leading-none">×</button>
                </div>
              </div>
            ))}
            {!dependents.length && <p className="text-slate-500 text-sm">No dependents added yet.</p>}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/cards')}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Creating...' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
