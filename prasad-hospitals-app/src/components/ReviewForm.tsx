// src/components/ReviewForm.tsx
import type { ReviewInput } from '../utils/generateReviews'

const DEPARTMENTS = [
  'Cardiology', 'Orthopedics', 'Pediatrics', 'Gynecology & Obs',
  'Neurology', 'General Surgery', 'ENT', 'Dermatology',
]

const OPTIONS: Record<string, string[]> = {
  visitType: ['Consultation', 'Surgery', 'Emergency', 'Health Checkup', 'Follow-up'],
  experienceTone: ['Very Satisfied', 'Satisfied', 'Impressed'],
  whoAreYou: ['Patient', 'Caregiver', 'Parent of Patient'],
  whyChose: ["Doctor's reputation", 'Close to home', 'Referred by friend', 'Trusted hospital', 'Good facilities'],
  likedMost: ["Doctor's expertise", 'Friendly staff', 'Clean & hygienic', 'Fast service', 'Affordable care'],
  outcome: ['Recovered quickly', 'Got accurate diagnosis', 'Felt well cared for', 'Pain was relieved', 'Got proper treatment'],
}

const LABELS: Record<string, string> = {
  visitType: 'Visit Type',
  experienceTone: 'Your Experience',
  whoAreYou: 'Who Are You?',
  whyChose: 'Why You Chose Prasad Hospitals?',
  likedMost: 'What You Liked Most?',
  outcome: 'Outcome / Impact',
}

const selectClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none'
const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'

interface ReviewFormProps {
  value: Omit<ReviewInput, 'branchName'>
  onChange: (field: keyof Omit<ReviewInput, 'branchName'>, value: string) => void
  onSubmit: () => void
}

function isComplete(value: Omit<ReviewInput, 'branchName'>): boolean {
  return !!(value.visitType && value.department && value.experienceTone && value.whoAreYou && value.whyChose && value.likedMost && value.outcome)
}

export default function ReviewForm({ value, onChange, onSubmit }: ReviewFormProps) {
  return (
    <div className="px-4 py-4 space-y-5">
      {/* Dropdowns for required fields */}
      {(Object.keys(LABELS) as Array<keyof typeof LABELS>).map(field => (
        <div key={field}>
          <label className="block text-xs font-medium text-muted mb-1.5">
            {LABELS[field]} <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <select
              value={value[field as keyof typeof value]}
              onChange={e => onChange(field as keyof Omit<ReviewInput, 'branchName'>, e.target.value)}
              className={selectClass}
            >
              <option value="">Select...</option>
              {OPTIONS[field].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted">▾</span>
          </div>
        </div>
      ))}

      {/* Department dropdown */}
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          Department <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <select
            value={value.department}
            onChange={e => onChange('department', e.target.value)}
            className={selectClass}
          >
            <option value="">Select...</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted">▾</span>
        </div>
      </div>

      {/* Staff name */}
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Doctor / Staff Name <span className="text-gray-400 font-normal">(optional)</span></label>
        <input
          type="text"
          placeholder="e.g., Dr. Rajesh Kumar"
          value={value.staffName}
          onChange={e => onChange('staffName', e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Additional notes */}
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">Additional Notes <span className="text-gray-400 font-normal">(optional, 10–30 words)</span></label>
        <textarea
          placeholder="Any personal detail to make it unique..."
          value={value.additionalNotes}
          onChange={e => onChange('additionalNotes', e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
        />
        <p className="text-xs text-muted mt-1 italic">Keep it honest — this tool just helps you express it better.</p>
      </div>

      {/* Generate button */}
      <button
        disabled={!isComplete(value)}
        onClick={onSubmit}
        className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 mt-2"
      >
        ✨ Generate My Reviews
      </button>
    </div>
  )
}
