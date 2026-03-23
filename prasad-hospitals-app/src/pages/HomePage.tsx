// src/pages/HomePage.tsx
import { useNavigate } from 'react-router-dom'
import { Calendar, Star, Phone, MapPin, ChevronDown } from 'lucide-react'
import { useBranch } from '../context/BranchContext'

export default function HomePage() {
  const { branch, clearBranch } = useBranch()
  const navigate = useNavigate()

  if (!branch) return null

  function handleChangeBranch() {
    clearBranch()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-surface page-enter">
      {/* Header */}
      <div className="bg-primary text-white px-6 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-lg">P</span>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Prasad Hospitals</h1>
            <p className="text-blue-100 text-xs">Multispeciality Healthcare</p>
          </div>
        </div>

        {/* Selected branch chip */}
        <button
          onClick={handleChangeBranch}
          className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2 text-sm"
        >
          <MapPin size={14} />
          <span className="font-medium">{branch.area}</span>
          <ChevronDown size={14} className="ml-auto opacity-70" />
        </button>
      </div>

      {/* CTAs */}
      <div className="px-4 py-8 space-y-4">
        <h2 className="text-base font-semibold text-gray-800 mb-6 text-center">What would you like to do?</h2>

        {/* Book Appointment */}
        <button
          onClick={() => navigate('/book')}
          className="w-full bg-primary text-white rounded-2xl p-6 text-left shadow-md hover:bg-primary-hover active:scale-98 transition-all duration-150"
        >
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-xl p-3">
              <Calendar size={28} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Book Appointment</h3>
              <p className="text-blue-100 text-sm">Schedule a visit with our specialists</p>
            </div>
          </div>
        </button>

        {/* Leave a Review */}
        <button
          onClick={() => navigate('/review')}
          className="w-full bg-white border-2 border-gray-200 text-gray-800 rounded-2xl p-6 text-left shadow-sm hover:border-primary hover:shadow-md active:scale-98 transition-all duration-150"
        >
          <div className="flex items-start gap-4">
            <div className="bg-star/10 rounded-xl p-3">
              <Star size={28} className="text-star" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Leave a Review</h3>
              <p className="text-muted text-sm">Share your experience with others</p>
            </div>
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 pt-4 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <Phone size={14} className="text-primary" />
          <span>{branch.phone}</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-muted">
          <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
          <span>{branch.address}</span>
        </div>
      </div>
    </div>
  )
}
