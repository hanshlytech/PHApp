interface ServiceOptionProps {
  service: string;
  label: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}

const SERVICE_ICONS: Record<string, string> = {
  OPD: 'stethoscope',
  MRI: 'radiology',
  CT: 'radiology',
  XRAY: 'radiology',
  USG: 'ecg',
};

export default function ServiceOption({ service, label, icon: _icon, selected, onClick }: ServiceOptionProps) {
  const materialIcon = SERVICE_ICONS[service] || 'medical_services';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-4 p-6 rounded-2xl transition-all ${
        selected
          ? 'bg-[#8cda5a]/20 border-2 border-[#8cda5a]'
          : 'bg-white/5 border border-white/10 hover:bg-[#8cda5a]/10'
      }`}
    >
      <span className={`material-symbols-outlined text-4xl ${selected ? 'text-[#8cda5a]' : 'text-[#8cda5a]'}`}>
        {materialIcon}
      </span>
      <span className={`text-sm font-headline font-bold ${selected ? 'text-[#8cda5a]' : 'text-white'}`}>
        {label}
      </span>
    </button>
  );
}
