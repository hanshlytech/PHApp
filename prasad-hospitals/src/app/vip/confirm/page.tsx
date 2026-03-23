'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { useVipWizard } from '@/context/VipWizardContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ConfirmPage() {
  const router = useRouter();
  const { card, selectedMember, selectedService, reset } = useVipWizard();

  useEffect(() => { if (!card || !selectedMember || !selectedService) router.replace('/vip/scan'); }, [card, selectedMember, selectedService, router]);
  if (!card || !selectedMember || !selectedService) return <div className="flex items-center justify-center py-20 text-muted-foreground">Redirecting...</div>;

  const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  function handleScanNext() { reset(); router.push('/vip/scan'); }

  return (
    <div className="max-w-sm mx-auto flex flex-col items-center gap-6 text-center py-8">
      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-green-900/40 border-2 border-green-500">
        <CheckCircle className="h-12 w-12 text-green-400" />
      </div>

      <h1 className="text-3xl font-bold">Visit Logged!</h1>

      <Card className="w-full">
        <CardContent className="pt-4 space-y-3 text-left">
          {[
            { label: 'Member', value: selectedMember.name },
            { label: 'Service', value: selectedService },
            { label: 'Card', value: card.card_number, mono: true },
            { label: 'Branch', value: card.branch },
            { label: 'Time', value: now },
          ].map(({ label, value, mono }) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <span className="text-muted-foreground text-sm shrink-0">{label}</span>
              <span className={`text-sm text-right ${mono ? 'font-mono' : 'font-medium'}`}>{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full py-6 text-base" onClick={handleScanNext}>Scan Next Card</Button>
    </div>
  );
}
