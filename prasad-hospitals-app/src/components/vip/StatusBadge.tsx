type StatusBadgeProps = {
  status: 'active' | 'expired' | 'suspended' | 'invalid';
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    active: 'bg-[#8cda5a] text-[#0a2100]',
    expired: 'bg-error-container text-on-error-container',
    suspended: 'bg-secondary-container text-on-secondary-container',
    invalid: 'bg-error-container text-on-error-container',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${styles[status] ?? styles.invalid}`}>
      {status}
    </span>
  );
}
