// src/components/PatientForm.tsx
interface PatientFormProps {
  name: string
  phone: string
  reason: string
  onChange: (field: 'name' | 'phone' | 'reason', value: string) => void
}

const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"

export default function PatientForm({ name, phone, reason, onChange }: PatientFormProps) {
  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Full Name *</label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={e => onChange('name', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Phone Number *</label>
        <input
          type="tel"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={e => onChange('phone', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Reason for Visit</label>
        <textarea
          placeholder="Brief description of your symptoms or reason (optional)"
          value={reason}
          onChange={e => onChange('reason', e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>
    </div>
  )
}
