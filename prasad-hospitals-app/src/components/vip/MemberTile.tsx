import type { Member } from '../../api/cards';

interface MemberTileProps {
  member: Member;
  selected: boolean;
  onClick: () => void;
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function MemberTile({ member, selected, onClick }: MemberTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-8 rounded-3xl border transition-all ${
        selected
          ? 'border-[#8cda5a] bg-[#8cda5a]/10'
          : 'border-white/10 bg-white/5 backdrop-blur-lg hover:bg-white/10'
      }`}
    >
      <div className="w-20 h-20 rounded-full bg-primary-container mb-6 flex items-center justify-center text-3xl font-bold text-white">
        {getInitials(member.name)}
      </div>
      {member.is_primary === 1 && (
        <span className="px-3 py-1 bg-[#8cda5a] text-[#0a2100] rounded-full text-[10px] font-black uppercase tracking-widest">Primary</span>
      )}
      {member.is_primary !== 1 && (
        <span className="px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest capitalize">{member.relation}</span>
      )}
      <h3 className="text-2xl font-bold text-white mt-4">{member.name}</h3>
    </button>
  );
}
