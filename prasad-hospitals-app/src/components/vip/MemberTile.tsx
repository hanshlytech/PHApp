// src/components/vip/MemberTile.tsx
import type { Member } from '../../api/cards';

interface MemberTileProps {
  member: Member;
  selected: boolean;
  onClick: () => void;
}

export default function MemberTile({ member, selected, onClick }: MemberTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left py-4 px-4 rounded-xl border transition-colors ${
        selected
          ? 'border-violet-500 bg-violet-900/20'
          : 'border-slate-700 bg-slate-800 hover:bg-slate-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-lg font-semibold">{member.name}</p>
          <p className="text-slate-400 text-sm mt-0.5 capitalize">{member.relation}</p>
        </div>
        {member.is_primary === 1 && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sky-900/60 text-sky-300">
            Primary
          </span>
        )}
      </div>
    </button>
  );
}
