import type { Stats } from '../../api/stats';

export default function StatsRow({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Total Cards', value: stats.total, color: 'text-sky-400', border: 'border-sky-900' },
        { label: 'Active', value: stats.active, color: 'text-green-400', border: 'border-green-900' },
        { label: 'Expired', value: stats.expired, color: 'text-red-400', border: 'border-red-900' },
        { label: 'Suspended', value: stats.suspended, color: 'text-yellow-400', border: 'border-yellow-900' },
      ].map(({ label, value, color, border }) => (
        <div key={label} className={`bg-slate-900 border ${border} rounded-lg p-3 text-center`}>
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
          <div className="text-slate-500 text-xs mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  );
}
