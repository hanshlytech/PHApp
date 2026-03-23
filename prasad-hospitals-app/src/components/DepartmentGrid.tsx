// src/components/DepartmentGrid.tsx
import type { Department } from '../types'

interface DepartmentGridProps {
  departments: Department[]
  onSelect: (dept: Department) => void
}

export default function DepartmentGrid({ departments, onSelect }: DepartmentGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 py-4">
      {departments.map(dept => (
        <button
          key={dept.id}
          onClick={() => onSelect(dept)}
          className="bg-white border border-gray-200 rounded-2xl p-4 text-left hover:border-primary hover:shadow-md active:scale-95 transition-all duration-150 flex flex-col items-center gap-2"
        >
          <span className="text-3xl">{dept.icon}</span>
          <span className="text-sm font-medium text-gray-800 text-center leading-tight">{dept.name}</span>
        </button>
      ))}
    </div>
  )
}
