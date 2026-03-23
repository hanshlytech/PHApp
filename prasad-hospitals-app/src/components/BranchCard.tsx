// src/components/BranchCard.tsx
import { MapPin, Phone } from 'lucide-react'
import type { Branch } from '../types'

interface BranchCardProps {
  branch: Branch
  onSelect: (branch: Branch) => void
}

export default function BranchCard({ branch, onSelect }: BranchCardProps) {
  return (
    <button
      onClick={() => onSelect(branch)}
      className="w-full text-left bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary active:scale-98 transition-all duration-150"
    >
      <h3 className="font-semibold text-gray-900 text-base mb-2">{branch.name}</h3>
      <div className="flex items-start gap-2 text-sm text-muted mb-1">
        <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
        <span>{branch.address}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted">
        <Phone size={14} className="shrink-0 text-primary" />
        <span>{branch.phone}</span>
      </div>
    </button>
  )
}
