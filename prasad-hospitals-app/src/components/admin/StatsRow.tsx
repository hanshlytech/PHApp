import type { Stats } from '../../api/stats';

const STAT_CARDS = [
  { key: 'total' as const, label: 'Total Cards', icon: 'group', iconColor: 'text-primary', iconBg: 'bg-primary-fixed-dim' },
  { key: 'active' as const, label: 'Active Members', icon: 'verified_user', iconColor: 'text-tertiary-fixed-dim', iconBg: 'bg-tertiary-container/10' },
  { key: 'expired' as const, label: 'Expired', icon: 'event_busy', iconColor: 'text-error', iconBg: 'bg-error-container' },
  { key: 'suspended' as const, label: 'Suspended', icon: 'do_not_disturb_on', iconColor: 'text-secondary', iconBg: 'bg-secondary-fixed' },
];

export default function StatsRow({ stats }: { stats: Stats }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {STAT_CARDS.map(({ key, label, icon, iconColor, iconBg }) => (
        <div
          key={key}
          className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_12px_24px_rgba(25,28,29,0.04)] border border-white flex flex-col justify-between h-40"
        >
          <div className="flex justify-between items-start">
            <span className={`material-symbols-outlined ${iconColor} ${iconBg} p-2 rounded-lg`}>{icon}</span>
          </div>
          <div>
            <h4 className="text-on-surface-variant text-xs font-bold uppercase tracking-widest font-label">{label}</h4>
            <p className="text-3xl font-headline font-extrabold text-primary">{stats[key].toLocaleString()}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
