'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVipWizard } from '@/context/VipWizardContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const STATUS_VARIANT: Record<string, 'default' | 'destructive' | 'secondary'> = {
  active: 'default', expired: 'destructive', suspended: 'secondary',
};

export default function MemberPage() {
  const router = useRouter();
  const { card, setSelectedMember, reset } = useVipWizard();

  useEffect(() => { if (!card) router.replace('/vip/scan'); }, [card, router]);
  if (!card) return <div className="flex items-center justify-center py-20 text-muted-foreground">Redirecting...</div>;

  function handleRescan() { reset(); router.push('/vip/scan'); }
  const isInactive = card.status !== 'active';

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Select Member</h1>
        <Button variant="link" onClick={handleRescan}>Re-scan</Button>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs uppercase tracking-widest">Card Number</span>
            <Badge variant={STATUS_VARIANT[card.status] || 'secondary'}>{card.status}</Badge>
          </div>
          <p className="font-mono text-lg font-semibold">{card.card_number}</p>
          <div className="flex gap-6 text-sm text-muted-foreground mt-1">
            <span>Expires: <span className="text-foreground">{new Date(card.expiry_date).toLocaleDateString()}</span></span>
            <span>Branch: <span className="text-foreground">{card.branch}</span></span>
          </div>
        </CardContent>
      </Card>

      {isInactive ? (
        <div className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-4 text-sm">This card is not active. No visit can be logged.</div>
          <Button className="w-full" onClick={handleRescan}>Re-scan</Button>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground text-sm">Who is visiting today?</p>
          <div className="space-y-3">
            {card.members.map((member) => (
              <button key={member.id} type="button" onClick={() => { setSelectedMember(member); router.push('/vip/service'); }}
                className="w-full text-left py-4 px-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{member.name}</p>
                    <p className="text-muted-foreground text-sm mt-0.5 capitalize">{member.relation}</p>
                  </div>
                  {member.is_primary === 1 && <Badge variant="secondary">Primary</Badge>}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
