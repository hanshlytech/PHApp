import { VipShell } from '@/components/vip/vip-shell';
import { VipWizardProvider } from '@/context/VipWizardContext';

export default function VipLayout({ children }: { children: React.ReactNode }) {
  // Auth is handled by proxy.ts — no need to duplicate checks here.
  // VipWizardProvider is a client component; login page doesn't use it, so wrapping is safe.
  return (
    <VipWizardProvider>
      <VipShell>{children}</VipShell>
    </VipWizardProvider>
  );
}
