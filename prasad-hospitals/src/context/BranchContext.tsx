'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface Branch {
  id: string;
  name: string;
  area: string;
  address: string;
  phone: string;
  googleMapsReviewUrl: string;
}

interface BranchContextValue {
  branch: Branch | null;
  setBranch: (branch: Branch) => void;
  clearBranch: () => void;
}

const BranchContext = createContext<BranchContextValue | null>(null);
const STORAGE_KEY = 'selectedBranch';

export function BranchProvider({ children }: { children: ReactNode }) {
  const [branch, setBranchState] = useState<Branch | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Branch) : null;
    } catch { return null; }
  });

  function setBranch(b: Branch) {
    setBranchState(b);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(b));
  }

  function clearBranch() {
    setBranchState(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  return (
    <BranchContext.Provider value={{ branch, setBranch, clearBranch }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch(): BranchContextValue {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error('useBranch must be used within BranchProvider');
  return ctx;
}
