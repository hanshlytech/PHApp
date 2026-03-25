import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCard } from '../../api/cards';
import AdminLayout from '../../components/admin/AdminLayout';

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
    <AdminLayout>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-10">
          {/* Left Column: Card Details */}
          <section className="col-span-12 lg:col-span-5 space-y-8">
            <div>
              <h2 className="font-headline text-2xl font-bold text-primary mb-2">Card Details</h2>
              <p className="text-on-surface-variant text-sm">Configure primary identification and validity parameters.</p>
            </div>
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Aadhaar last 4 digits</label>
                <input
                  value={aadhaar}
                  onChange={e => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="XXXX"
                  maxLength={4}
                  className="w-full bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all p-4 text-primary font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Branch</label>
                <select
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  className="w-full bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all p-4 text-primary font-medium appearance-none"
                >
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              {/* VIP Preview Card — live preview of form data */}
              <div className="pt-4 mt-6 border-t border-outline-variant/10">
                <div className="rounded-xl signature-gradient relative overflow-hidden p-5 space-y-3">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <span className="material-symbols-outlined text-6xl">medical_services</span>
                  </div>
                  <div className="text-white/60 text-[10px] uppercase tracking-widest font-bold">VIP Membership Preview</div>
                  <div className="text-white font-headline font-bold text-lg tracking-tight">
                    {primary.name.trim() || 'Member Name'}
                  </div>
                  <div className="flex items-center gap-3 text-white/70 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {branch}
                    </span>
                    {aadhaar && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">badge</span>
                        XXXX-{aadhaar}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-[10px] uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm">group</span>
                    {1 + dependents.filter(d => d.name.trim()).length} member{1 + dependents.filter(d => d.name.trim()).length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Members */}
          <section className="col-span-12 lg:col-span-7 space-y-8">
            {/* Primary Member */}
            <div className="space-y-6">
              <h2 className="font-headline text-2xl font-bold text-primary mb-2">Members</h2>
              <div className="bg-surface-container-low p-8 rounded-xl space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <h3 className="font-bold text-primary">Primary Member</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Full Name</label>
                    <input
                      value={primary.name}
                      onChange={e => setPrimary(p => ({ ...p, name: e.target.value }))}
                      placeholder="Ravi Kumar"
                      className="w-full bg-surface-container-lowest border-none rounded-lg focus:ring-2 focus:ring-primary/40 transition-all p-4 text-primary font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Date of Birth</label>
                    <input
                      type="date"
                      value={primary.dob}
                      onChange={e => setPrimary(p => ({ ...p, dob: e.target.value }))}
                      className="w-full bg-surface-container-lowest border-none rounded-lg focus:ring-2 focus:ring-primary/40 transition-all p-4 text-primary font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dependents */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">group</span>
                  <h3 className="font-bold text-primary">Dependents ({dependents.length}/3)</h3>
                </div>
                {dependents.length < 3 && (
                  <button
                    type="button"
                    onClick={addDependent}
                    className="text-on-tertiary-container flex items-center gap-1 font-bold text-sm hover:underline transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add Dependent
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {dependents.map((dep, i) => (
                  <div key={i} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
                    <div className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-4 space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Name</label>
                        <input
                          value={dep.name}
                          onChange={e => updateDependent(i, 'name', e.target.value)}
                          placeholder="Full name"
                          className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm font-medium"
                        />
                      </div>
                      <div className="col-span-3 space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Relation</label>
                        <select
                          value={dep.relation}
                          onChange={e => updateDependent(i, 'relation', e.target.value)}
                          className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm font-medium appearance-none"
                        >
                          {RELATIONS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                        </select>
                      </div>
                      <div className="col-span-4 space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">DOB</label>
                        <input
                          type="date"
                          value={dep.dob}
                          onChange={e => updateDependent(i, 'dob', e.target.value)}
                          className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm font-medium"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center pb-2">
                        <button type="button" onClick={() => removeDependent(i)} className="text-error/40 hover:text-error transition-colors">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {!dependents.length && <p className="text-on-surface-variant text-sm">No dependents added yet.</p>}
              </div>
            </div>
          </section>
        </div>

        {/* Error */}
        {error && <p className="text-error text-sm mt-4">{error}</p>}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-4 mt-10 pt-6 border-t border-outline-variant/10">
          <button
            type="button"
            onClick={() => navigate('/admin/cards')}
            className="px-8 py-3 rounded-lg text-primary font-bold hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-3 rounded-lg bg-[#6ab539] text-white font-bold shadow-lg shadow-[#6ab539]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">check_circle</span>
            {loading ? 'Creating...' : 'Create Card'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
