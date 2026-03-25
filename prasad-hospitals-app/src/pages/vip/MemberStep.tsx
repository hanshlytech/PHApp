import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVipWizard } from '../../context/VipWizardContext';
import StatusBadge from '../../components/vip/StatusBadge';
import MemberTile from '../../components/vip/MemberTile';

export default function MemberStep() {
  const navigate = useNavigate();
  const { card, setSelectedMember, reset } = useVipWizard();

  useEffect(() => {
    if (!card) navigate('/vip/scan', { replace: true });
  }, [card, navigate]);

  if (!card) return (
    <div className="min-h-screen bg-[#0f1d2f] flex items-center justify-center text-slate-500">Redirecting...</div>
  );

  function handleRescan() {
    reset();
    navigate('/vip/scan');
  }

  const isInactive = card.status !== 'active';

  return (
    <div className="min-h-screen bg-[#0f1d2f] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-headline font-black text-white">Select Member</h1>
            <p className="text-slate-400 mt-1">{card.members.length} members found for {card.card_number}</p>
          </div>
          <button type="button" onClick={handleRescan} className="text-[#8cda5a] hover:underline text-sm font-bold transition-colors">
            Re-scan
          </button>
        </div>

        {/* Card info */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs uppercase tracking-widest">Card Number</span>
            <p className="text-white font-mono text-lg font-semibold">{card.card_number}</p>
          </div>
          <StatusBadge status={card.status} />
        </div>

        {isInactive ? (
          <div className="flex flex-col gap-4">
            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-xl px-4 py-4 text-sm">
              This card is not active. No visit can be logged.
            </div>
            <button type="button" onClick={handleRescan}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#8cda5a] to-[#6ab539] text-[#0a2100] font-headline font-bold text-base transition-all active:scale-95">
              Re-scan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {card.members.map((member) => (
              <MemberTile
                key={member.id}
                member={member}
                selected={false}
                onClick={() => {
                  setSelectedMember(member);
                  navigate('/vip/service');
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
