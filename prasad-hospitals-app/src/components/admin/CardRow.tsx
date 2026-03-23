import { useNavigate } from 'react-router-dom';
import type { Card } from '../../api/cards';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-900/60 text-green-300',
  expired: 'bg-red-900/60 text-red-300',
  suspended: 'bg-yellow-900/60 text-yellow-300',
};

export default function CardRow({ card }: { card: Card }) {
  const navigate = useNavigate();
  return (
    <tr
      className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors"
      onClick={() => navigate(`/admin/cards/${card.id}`)}
    >
      <td className="px-4 py-3">
        <div className="text-sm font-semibold text-white">{card.primary_name || card.card_number}</div>
        <div className="text-xs text-slate-500">{card.member_count} member{card.member_count !== 1 ? 's' : ''}</div>
      </td>
      <td className="px-4 py-3 font-mono text-sm text-slate-300">{card.card_number}</td>
      <td className="px-4 py-3 text-sm text-slate-400">{card.expiry_date}</td>
      <td className="px-4 py-3 text-sm text-slate-400">{card.branch}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_STYLES[card.status] || ''}`}>
          {card.status}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-sky-400">{card.visit_count} visits</td>
    </tr>
  );
}
