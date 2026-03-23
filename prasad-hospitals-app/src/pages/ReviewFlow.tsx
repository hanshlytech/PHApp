// src/pages/ReviewFlow.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useBranch } from '../context/BranchContext'
import ReviewForm from '../components/ReviewForm'
import ReviewVariants from '../components/ReviewVariants'
import { generateReviews } from '../utils/generateReviews'
import type { ReviewInput } from '../utils/generateReviews'
import type { ReviewVariation } from '../utils/generateReviews'

type FormState = Omit<ReviewInput, 'branchName'>

const INITIAL_FORM: FormState = {
  visitType: '',
  department: '',
  experienceTone: '',
  whoAreYou: '',
  whyChose: '',
  likedMost: '',
  outcome: '',
  staffName: '',
  additionalNotes: '',
}

export default function ReviewFlow() {
  const { branch } = useBranch()
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [variations, setVariations] = useState<ReviewVariation[]>([])

  if (!branch) return null

  function handleChange(field: keyof FormState, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleGenerate() {
    const reviews = generateReviews({ ...form, branchName: branch!.name })
    setVariations(reviews)
    setStep(2)
  }

  function handleBack() {
    if (step === 2) {
      setStep(1)
    } else {
      navigate('/home')
    }
  }

  return (
    <div className="min-h-screen bg-surface page-enter">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900">Leave a Review</h1>
            <p className="text-xs text-muted">{branch.name}</p>
          </div>
        </div>
      </div>

      <div className="pb-8">
        {step === 1 && (
          <ReviewForm
            value={form}
            onChange={handleChange}
            onSubmit={handleGenerate}
          />
        )}

        {step === 2 && (
          <ReviewVariants
            variations={variations}
            googleMapsUrl={branch.googleMapsReviewUrl}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </div>
  )
}
