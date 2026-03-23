// src/pages/LandingPage.tsx
import { useNavigate } from 'react-router-dom'
import { useBranch } from '../context/BranchContext'
import { branches } from '../data/mockData'
import BranchCard from '../components/BranchCard'
import type { Branch } from '../types'

export default function LandingPage() {
  const { setBranch } = useBranch()
  const navigate = useNavigate()

  function handleSelect(branch: Branch) {
    setBranch(branch)
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-surface page-enter">
      {/* Header */}
      <div className="bg-primary text-white px-6 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-primary font-bold text-lg">P</span>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Prasad Hospitals</h1>
            <p className="text-blue-100 text-xs">Multispeciality Healthcare</p>
          </div>
        </div>
        <p className="text-blue-50 text-sm mt-4">Select your nearest branch to get started</p>
      </div>

      {/* Branch list */}
      <div className="px-4 py-6 space-y-4">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wide px-1">Our Branches</h2>
        {branches.map(branch => (
          <BranchCard key={branch.id} branch={branch} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  )
}
