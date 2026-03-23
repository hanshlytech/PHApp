// src/pages/vip/ServiceStep.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVipWizard } from '../../context/VipWizardContext';
import { logVisit } from '../../api/scan';
import ServiceOption from '../../components/vip/ServiceOption';

const SERVICES = [
  { service: 'OPD', label: 'OPD', icon: '🏥' },
  { service: 'MRI', label: 'MRI', icon: '🔬' },
  { service: 'CT', label: 'CT Scan', icon: '💊' },
  { service: 'XRAY', label: 'X-Ray', icon: '🦴' },
  { service: 'USG', label: 'Ultrasound', icon: '📡' },
] as const;

export default function ServiceStep() {
  const navigate = useNavigate();
  const { card, selectedMember, selectedService, setSelectedService } = useVipWizard();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!card || !selectedMember) navigate('/vip/scan', { replace: true });
  }, [card, selectedMember, navigate]);

  if (!card || !selectedMember) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Redirecting...</div>
  );

  async function handleLogVisit() {
    if (!selectedService || !card || !selectedMember) return;
    setLoading(true);
    setError(null);
    try {
      await logVisit({
        card_id: card.id,
        member_id: selectedMember.id,
        service_type: selectedService,
        branch: card.branch,
      });
      navigate('/vip/confirm');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to log visit. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Select Service</h1>
          <button
            type="button"
            onClick={() => navigate('/vip/scan')}
            className="text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors"
          >
            Re-scan
          </button>
        </div>

        {/* Visiting as */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl px-5 py-4">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Visiting as</p>
          <p className="text-white text-lg font-semibold">{selectedMember.name}</p>
          <p className="text-slate-400 text-sm mt-0.5 font-mono">{card.card_number}</p>
        </div>

        {/* Service grid */}
        <div className="grid grid-cols-3 gap-3">
          {SERVICES.map((s) => (
            <ServiceOption
              key={s.service}
              service={s.service}
              label={s.label}
              icon={s.icon}
              selected={selectedService === s.service}
              onClick={() => setSelectedService(s.service)}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Log Visit button */}
        <button
          type="button"
          onClick={handleLogVisit}
          disabled={!selectedService || loading}
          className="w-full py-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-base transition-colors"
        >
          {loading ? 'Logging visit...' : 'Log Visit'}
        </button>
      </div>
    </div>
  );
}
