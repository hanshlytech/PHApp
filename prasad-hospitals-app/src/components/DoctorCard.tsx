// src/components/DoctorCard.tsx
import type { Doctor } from '../types'

interface DoctorCardProps {
  doctor: Doctor
  onSelect: (doctor: Doctor) => void
}

export default function DoctorCard({ doctor, onSelect }: DoctorCardProps) {
  const isToday = doctor.nextAvailable === 'Today'

  return (
    <button
      onClick={() => onSelect(doctor)}
      className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-left hover:border-primary hover:shadow-md active:scale-98 transition-all duration-150 flex items-center gap-4"
    >
      <img
        src={doctor.photoUrl}
        alt={doctor.name}
        className="w-14 h-14 rounded-full object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{doctor.name}</h3>
        <p className="text-xs text-muted leading-tight mb-2">{doctor.qualification}</p>
        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
          isToday
            ? 'bg-success/10 text-success'
            : 'bg-amber-50 text-amber-600'
        }`}>
          Next: {doctor.nextAvailable}
        </span>
      </div>
    </button>
  )
}
