// src/pages/vip/MemberStep.tsx
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Redirecting...</div>
  );

  function handleRescan() {
    reset();
    navigate('/vip/scan');
  }

  const isInactive = card.status !== 'active';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Select Member</h1>
          <button
            type="button"
            onClick={handleRescan}
            className="text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors"
          >
            Re-scan
          </button>
        </div>

        {/* Card info */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs uppercase tracking-widest">Card Number</span>
            <StatusBadge status={card.status} />
          </div>
          <p className="text-white font-mono text-lg font-semibold">{card.card_number}</p>
          <div className="flex gap-6 text-sm text-slate-400 mt-1">
            <span>
              Expires:{' '}
              <span className="text-slate-200">
                {new Date(card.expiry_date).toLocaleDateString()}
              </span>
            </span>
            <span>
              Branch: <span className="text-slate-200">{card.branch}</span>
            </span>
          </div>
        </div>

        {/* Inactive card error */}
        {isInactive ? (
          <div className="flex flex-col gap-4">
            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-xl px-4 py-4 text-sm">
              This card is not active. No visit can be logged.
            </div>
            <button
              type="button"
              onClick={handleRescan}
              className="w-full py-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-base transition-colors"
            >
              Re-scan
            </button>
          </div>
        ) : (
          <>
            <p className="text-slate-400 text-sm">Who is visiting today?</p>
            <div className="flex flex-col gap-3">
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
          </>
        )}
      </div>
    </div>
  );
}
