import type { Member } from '../../api/cards';

export default function MemberChip({ member }: { member: Member }) {
  return (
    <span className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-md px-2 py-0.5 text-xs text-slate-300">
      <span className="font-medium">{member.name}</span>
      <span className="text-slate-500 capitalize">· {member.relation}</span>
    </span>
  );
}
