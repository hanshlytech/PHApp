// src/pages/vip/ConfirmStep.tsx
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Redirecting...</div>
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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
        {/* Checkmark */}
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-green-900/40 border-2 border-green-500">
          <span className="text-green-400 text-5xl leading-none">✓</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-white">Visit Logged!</h1>

        {/* Details card */}
        <div className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-5 flex flex-col gap-3 text-left">
          <DetailRow label="Member" value={selectedMember.name} />
          <DetailRow label="Service" value={selectedService} />
          <DetailRow label="Card" value={card.card_number} mono />
          <DetailRow label="Branch" value={card.branch} />
          <DetailRow label="Time" value={now} />
        </div>

        {/* Scan next button */}
        <button
          type="button"
          onClick={handleScanNext}
          className="w-full py-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-base transition-colors"
        >
          Scan Next Card
        </button>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-500 text-sm shrink-0">{label}</span>
      <span className={`text-slate-200 text-sm text-right ${mono ? 'font-mono' : 'font-medium'}`}>
        {value}
      </span>
    </div>
  );
}
