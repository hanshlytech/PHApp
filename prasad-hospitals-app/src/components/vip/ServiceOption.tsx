// src/components/vip/ServiceOption.tsx
interface ServiceOptionProps {
  service: string;
  label: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}

export default function ServiceOption({ label, icon, selected, onClick }: ServiceOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-5 rounded-xl border transition-colors ${
        selected
          ? 'border-violet-500 bg-violet-900/20'
          : 'border-slate-700 bg-slate-800 hover:bg-slate-700'
      }`}
    >
      <span className="text-4xl leading-none">{icon}</span>
      <span className={`text-sm font-medium ${selected ? 'text-violet-300' : 'text-slate-200'}`}>
        {label}
      </span>
    </button>
  );
}
