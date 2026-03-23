'use client';

import { useRouter } from 'next/navigation';
import { MapPin, Phone } from 'lucide-react';
import { BranchProvider, useBranch } from '@/context/BranchContext';
import { branches } from '@/data/mockData';

function LandingContent() {
  const { setBranch } = useBranch();
  const router = useRouter();

  function handleSelect(branch: typeof branches[0]) {
    setBranch(branch);
    router.push('/home');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#1E6FBA] text-white px-6 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-[#1E6FBA] font-bold text-lg">P</span>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Prasad Hospitals</h1>
            <p className="text-blue-100 text-xs">Multispeciality Healthcare</p>
          </div>
        </div>
        <p className="text-blue-50 text-sm mt-4">Select your nearest branch to get started</p>
      </div>

      <div className="px-4 py-6 space-y-4">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-1">Our Branches</h2>
        {branches.map(branch => (
          <button key={branch.id} onClick={() => handleSelect(branch)}
            className="w-full text-left bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#1E6FBA] active:scale-[0.98] transition-all duration-150">
            <h3 className="font-semibold text-gray-900 text-base mb-2">{branch.name}</h3>
            <div className="flex items-start gap-2 text-sm text-gray-500 mb-1">
              <MapPin size={14} className="mt-0.5 shrink-0 text-[#1E6FBA]" /><span>{branch.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Phone size={14} className="shrink-0 text-[#1E6FBA]" /><span>{branch.phone}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <BranchProvider>
      <LandingContent />
    </BranchProvider>
  );
}
