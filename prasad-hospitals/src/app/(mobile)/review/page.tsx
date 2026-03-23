'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, ExternalLink } from 'lucide-react';
import { useBranch } from '@/context/BranchContext';

const VISIT_TYPES = ['First Visit', 'Follow-up', 'Emergency', 'Health Check-up'];
const TONES = ['Very Positive', 'Positive', 'Mixed', 'Constructive'];

export default function ReviewFlow() {
  const { branch } = useBranch();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ visitType: '', department: '', experienceTone: '', staffName: '', additionalNotes: '' });
  const [variations, setVariations] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!branch) { router.push('/'); return null; }

  function handleChange(field: string, value: string) { setForm(f => ({ ...f, [field]: value })); }

  function handleGenerate() {
    if (!branch) return;
    // Simple template-based review generation
    const tone = form.experienceTone || 'Positive';
    const dept = form.department || 'the hospital';
    const staff = form.staffName ? ` Special thanks to ${form.staffName}.` : '';
    const notes = form.additionalNotes ? ` ${form.additionalNotes}` : '';
    const name = branch.name;

    const reviews = [
      `Had a ${tone.toLowerCase()} experience at ${name}. The ${dept} department was excellent.${staff}${notes} Highly recommend for quality healthcare in Hyderabad.`,
      `Visited ${name} for ${form.visitType || 'a consultation'} and was impressed by the care and professionalism.${staff} The ${dept} team was very attentive.${notes}`,
      `${name} provides outstanding healthcare services. My experience with ${dept} was ${tone.toLowerCase()}.${staff}${notes} Would definitely visit again.`,
    ];
    setVariations(reviews);
    setStep(2);
  }

  function copyReview(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => step === 2 ? setStep(1) : router.push('/home')} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900">Leave a Review</h1>
            <p className="text-xs text-gray-500">{branch.name}</p>
          </div>
        </div>
      </div>

      <div className="pb-8">
        {step === 1 && (
          <div className="px-4 pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visit Type</label>
              <select value={form.visitType} onChange={e => handleChange('visitType', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1E6FBA]">
                <option value="">Select...</option>
                {VISIT_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input value={form.department} onChange={e => handleChange('department', e.target.value)} placeholder="e.g. Cardiology"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1E6FBA]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
              <select value={form.experienceTone} onChange={e => handleChange('experienceTone', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1E6FBA]">
                <option value="">Select...</option>
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Name (optional)</label>
              <input value={form.staffName} onChange={e => handleChange('staffName', e.target.value)} placeholder="Dr. Name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1E6FBA]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea value={form.additionalNotes} onChange={e => handleChange('additionalNotes', e.target.value)} rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1E6FBA] resize-none" />
            </div>
            <button onClick={handleGenerate}
              className="w-full bg-[#1E6FBA] text-white py-3.5 rounded-2xl font-semibold text-sm">Generate Reviews</button>
          </div>
        )}

        {step === 2 && (
          <div className="px-4 pt-4 space-y-4">
            <p className="text-sm text-gray-500">Choose a review and post it on Google Maps</p>
            {variations.map((text, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-800 mb-3">{text}</p>
                <div className="flex gap-2">
                  <button onClick={() => copyReview(text, i)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#1E6FBA] transition-colors">
                    <Copy size={12} />{copiedIdx === i ? 'Copied!' : 'Copy'}
                  </button>
                  <a href={branch.googleMapsReviewUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#1E6FBA] hover:text-[#1A5FA3]">
                    <ExternalLink size={12} />Post on Google
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
