'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVipWizard } from '@/context/VipWizardContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SERVICES = [
  { service: 'OPD', label: 'OPD', icon: '🏥' },
  { service: 'MRI', label: 'MRI', icon: '🔬' },
  { service: 'CT', label: 'CT Scan', icon: '💊' },
  { service: 'XRAY', label: 'X-Ray', icon: '🦴' },
  { service: 'USG', label: 'Ultrasound', icon: '📡' },
] as const;

export default function ServicePage() {
  const router = useRouter();
  const { card, selectedMember, selectedService, setSelectedService } = useVipWizard();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!card || !selectedMember) router.replace('/vip/scan'); }, [card, selectedMember, router]);
  if (!card || !selectedMember) return <div className="flex items-center justify-center py-20 text-muted-foreground">Redirecting...</div>;

  async function handleLogVisit() {
    if (!selectedService || !card || !selectedMember) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: card.id, member_id: selectedMember.id, service_type: selectedService, branch: card.branch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to log visit');
      router.push('/vip/confirm');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to log visit.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Select Service</h1>
        <Button variant="link" onClick={() => router.push('/vip/scan')}>Re-scan</Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Visiting as</p>
          <p className="text-lg font-semibold">{selectedMember.name}</p>
          <p className="text-muted-foreground text-sm mt-0.5 font-mono">{card.card_number}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {SERVICES.map((s) => (
          <button key={s.service} type="button" onClick={() => setSelectedService(s.service)}
            className={`flex flex-col items-center justify-center gap-2 p-5 rounded-xl border transition-colors ${selectedService === s.service ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-accent'}`}>
            <span className="text-4xl leading-none">{s.icon}</span>
            <span className={`text-sm font-medium ${selectedService === s.service ? 'text-primary' : ''}`}>{s.label}</span>
          </button>
        ))}
      </div>

      {error && <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm">{error}</div>}

      <Button className="w-full py-6 text-base" onClick={handleLogVisit} disabled={!selectedService || loading}>
        {loading ? 'Logging visit...' : 'Log Visit'}
      </Button>
    </div>
  );
}
