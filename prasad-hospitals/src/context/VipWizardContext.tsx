'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface Member { id: number; card_id: number; name: string; relation: string; dob?: string; is_primary: number; }
interface ScannedCard { id: number; card_number: string; status: 'active' | 'expired' | 'suspended'; expiry_date: string; branch: string; members: Member[]; }

interface WizardState { card: ScannedCard | null; selectedMember: Member | null; selectedService: string | null; }
interface WizardContextValue extends WizardState {
  setCard: (card: ScannedCard) => void;
  setSelectedMember: (m: Member) => void;
  setSelectedService: (s: string) => void;
  reset: () => void;
}

const VipWizardContext = createContext<WizardContextValue | null>(null);
const INITIAL: WizardState = { card: null, selectedMember: null, selectedService: null };

export function VipWizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(INITIAL);
  return (
    <VipWizardContext.Provider value={{
      ...state,
      setCard: (card) => setState(s => ({ ...s, card })),
      setSelectedMember: (selectedMember) => setState(s => ({ ...s, selectedMember })),
      setSelectedService: (selectedService) => setState(s => ({ ...s, selectedService })),
      reset: () => setState(INITIAL),
    }}>
      {children}
    </VipWizardContext.Provider>
  );
}

export function useVipWizard() {
  const ctx = useContext(VipWizardContext);
  if (!ctx) throw new Error('useVipWizard must be used inside VipWizardProvider');
  return ctx;
}
