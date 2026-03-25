import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVipWizard } from '../../context/VipWizardContext';

export default function ConfirmStep() {
  const navigate = useNavigate();
  const { card, selectedMember, selectedService, reset } = useVipWizard();

  useEffect(() => {
    if (!card || !selectedMember || !selectedService) {
      navigate('/vip/scan', { replace: true });
    }
  }, [card, selectedMember, selectedService, navigate]);

  if (!card || !selectedMember || !selectedService) return (
    <div className="min-h-screen bg-[#0f1d2f] flex items-center justify-center text-slate-500">Redirecting...</div>
  );

  const now = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  function handleScanNext() {
    reset();
    navigate('/vip/scan');
  }

  return (
    <div className="min-h-screen bg-[#0f1d2f] flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-xl w-full bg-white/5 backdrop-blur-2xl rounded-[3rem] p-12 shadow-2xl ring-1 ring-white/10 border-t border-white/20">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#8cda5a]/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-[#8cda5a]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
        </div>

        <h2 className="text-3xl font-headline font-black text-white mb-8 text-center">Visit Logged!</h2>

        <div className="space-y-6 mb-10">
          <DetailRow label="Patient" value={selectedMember.name} />
          <DetailRow label="Service" value={selectedService} />
          <DetailRow label="Card" value={card.card_number} />
          <DetailRow label="Branch" value={card.branch} />
          <DetailRow label="Time" value={now} />
        </div>

        <button
          type="button"
          onClick={handleScanNext}
          className="w-full py-6 bg-gradient-to-r from-[#8cda5a] to-[#6ab539] text-[#0a2100] rounded-2xl font-headline font-black text-xl uppercase tracking-widest shadow-[0_20px_40px_rgba(140,218,90,0.3)] hover:scale-[1.02] transition-transform active:scale-95"
        >
          Scan Next Card
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-white/5">
      <span className="text-slate-400 uppercase tracking-widest text-xs font-bold">{label}</span>
      <span className="text-white font-bold text-lg">{value}</span>
    </div>
  );
}
