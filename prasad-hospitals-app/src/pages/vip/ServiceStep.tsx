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
    <div className="min-h-screen bg-[#0f1d2f] flex items-center justify-center text-slate-500">Redirecting...</div>
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
    <div className="min-h-screen bg-[#0f1d2f] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-headline font-black text-white">Select Service</h1>
            <p className="text-slate-400 mt-1">Choose the service for this visit</p>
          </div>
          <button type="button" onClick={() => navigate('/vip/scan')}
            className="text-[#8cda5a] hover:underline text-sm font-bold transition-colors">
            Re-scan
          </button>
        </div>

        {/* Visiting as */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl px-6 py-4">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Visiting as</p>
          <p className="text-white text-xl font-headline font-bold">{selectedMember.name}</p>
          <p className="text-slate-400 text-sm mt-0.5 font-mono">{card.card_number}</p>
        </div>

        {/* Service grid */}
        <div className="grid grid-cols-3 gap-4">
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

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleLogVisit}
          disabled={!selectedService || loading}
          className="w-full py-6 bg-gradient-to-r from-[#8cda5a] to-[#6ab539] text-[#0a2100] rounded-2xl font-headline font-black text-xl uppercase tracking-widest shadow-[0_20px_40px_rgba(140,218,90,0.3)] hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging visit...' : 'Log Visit'}
        </button>
      </div>
    </div>
  );
}
