import type { Member } from '../../api/cards';

export default function MemberChip({ member }: { member: Member }) {
  const icon = member.relation === 'primary' ? 'person' :
               member.relation === 'spouse' ? 'family_restroom' : 'child_care';
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-100 hover:border-primary-container transition-colors group">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary-container group-hover:text-white transition-colors">
        <span className="material-symbols-outlined text-sm">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-on-surface">{member.name}</p>
        <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold capitalize">
          {member.relation}
        </span>
      </div>
    </div>
  );
}
