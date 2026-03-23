// src/components/vip/StatusBadge.tsx
type StatusBadgeProps = {
  status: 'active' | 'expired' | 'suspended' | 'invalid';
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    active: 'bg-green-900/60 text-green-300',
    expired: 'bg-red-900/60 text-red-300',
    suspended: 'bg-yellow-900/60 text-yellow-300',
    invalid: 'bg-red-900/60 text-red-300',
  };

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${styles[status] ?? styles.invalid}`}
    >
      {status}
    </span>
  );
}
