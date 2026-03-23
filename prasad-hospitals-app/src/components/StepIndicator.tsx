// src/components/StepIndicator.tsx
interface StepIndicatorProps {
  current: number
  total: number
  label: string
}

export default function StepIndicator({ current, total, label }: StepIndicatorProps) {
  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted">Step {current} of {total}</span>
        <span className="text-xs font-semibold text-primary">{label}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  )
}
