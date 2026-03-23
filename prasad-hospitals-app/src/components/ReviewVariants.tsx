// src/components/ReviewVariants.tsx
import { useState } from 'react'
import { Copy, ExternalLink, Check } from 'lucide-react'
import type { ReviewVariation } from '../utils/generateReviews'

interface ReviewVariantsProps {
  variations: ReviewVariation[]
  googleMapsUrl: string
  onBack: () => void
}

function VariantCard({ variation, googleMapsUrl }: { variation: ReviewVariation; googleMapsUrl: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopyAndOpen() {
    try {
      await navigator.clipboard.writeText(variation.text)
      setCopied(true)
      setTimeout(() => {
        window.open(googleMapsUrl, '_blank')
        setCopied(false)
      }, 600)
    } catch {
      // Fallback: just open without copy
      window.open(googleMapsUrl, '_blank')
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          {variation.label}
        </span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed mb-4">{variation.text}</p>
      <button
        onClick={handleCopyAndOpen}
        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
          copied
            ? 'bg-success text-white'
            : 'bg-primary text-white hover:bg-primary-hover'
        }`}
      >
        {copied ? (
          <>
            <Check size={16} />
            Copied! Opening Google…
          </>
        ) : (
          <>
            <Copy size={16} />
            Copy & Post on Google
            <ExternalLink size={14} className="opacity-70" />
          </>
        )}
      </button>
    </div>
  )
}

export default function ReviewVariants({ variations, googleMapsUrl, onBack }: ReviewVariantsProps) {
  return (
    <div className="px-4 py-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Choose your review</h2>
        <p className="text-sm text-muted mt-1">Tap "Copy & Post" — it copies the text and opens Google Reviews.</p>
      </div>

      <div className="space-y-4 mb-6">
        {variations.map((v, i) => (
          <VariantCard key={i} variation={v} googleMapsUrl={googleMapsUrl} />
        ))}
      </div>

      <button
        onClick={onBack}
        className="w-full py-3 text-sm font-medium text-muted hover:text-gray-700 transition-colors"
      >
        ← Edit my answers
      </button>
    </div>
  )
}
