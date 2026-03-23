import { BranchProvider } from '@/context/BranchContext';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <BranchProvider>
      <div className="max-w-[480px] mx-auto min-h-screen">{children}</div>
    </BranchProvider>
  );
}
