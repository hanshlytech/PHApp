import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    <div className="min-h-screen bg-surface page-enter relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-tertiary-fixed-dim/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </button>
            <h1 className="font-headline font-bold text-lg tracking-tight text-primary">
              {step === 1 ? 'Share Your Experience' : 'Choose a Review'}
            </h1>
          </div>
          <div className="text-sm font-semibold text-on-surface-variant">{branch.name}</div>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-10">
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
      </main>
    </div>
  )
}
