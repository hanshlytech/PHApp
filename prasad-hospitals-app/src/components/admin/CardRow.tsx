import { useNavigate } from 'react-router-dom';
import type { Card } from '../../api/cards';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant',
  expired: 'bg-error-container text-on-error-container',
  suspended: 'bg-secondary-container text-on-secondary-container',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function CardRow({ card }: { card: Card }) {
  const navigate = useNavigate();
  const displayName = card.primary_name || card.card_number;
  const initials = card.primary_name ? getInitials(card.primary_name) : '#';

  return (
    <tr
      className="hover:bg-surface-container-low transition-colors cursor-pointer group"
      onClick={() => navigate(`/admin/cards/${card.id}`)}
    >
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-fixed-dim flex items-center justify-center font-bold text-primary text-xs">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-sm text-on-surface">{displayName}</p>
            <p className="text-xs text-on-surface-variant">{card.member_count} member{card.member_count !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-5 text-sm font-mono text-secondary">{card.card_number}</td>
      <td className="px-6 py-5 text-sm">{card.expiry_date}</td>
      <td className="px-6 py-5 text-sm text-on-surface-variant">{card.branch}</td>
      <td className="px-6 py-5">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[card.status] || ''}`}>
          {card.status}
        </span>
      </td>
      <td className="px-6 py-5 text-sm font-semibold">{card.visit_count ?? 0}</td>
    </tr>
  );
}
