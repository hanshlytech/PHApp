'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const BRANCHES = ['Nacharam', 'Pragathi Nagar', 'Manikonda'];
const RELATIONS = ['spouse', 'child', 'parent'];

interface MemberForm { name: string; relation: string; dob: string; }

export default function CreateCardPage() {
  const router = useRouter();
  const [primary, setPrimary] = useState({ name: '', dob: '' });
  const [aadhaar, setAadhaar] = useState('');
  const [branch, setBranch] = useState('Nacharam');
  const [dependents, setDependents] = useState<MemberForm[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function addDependent() {
    if (dependents.length < 3) setDependents(d => [...d, { name: '', relation: 'spouse', dob: '' }]);
  }
  function updateDependent(i: number, field: keyof MemberForm, value: string) {
    setDependents(d => d.map((dep, idx) => idx === i ? { ...dep, [field]: value } : dep));
  }
  function removeDependent(i: number) {
    setDependents(d => d.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^\d{4}$/.test(aadhaar)) { setError('Aadhaar last 4 must be exactly 4 digits'); return; }
    if (!primary.name.trim()) { setError('Primary member name is required'); return; }

    setLoading(true);
    try {
      const members = [
        { name: primary.name.trim(), relation: 'primary', dob: primary.dob || undefined, is_primary: 1 },
        ...dependents.filter(d => d.name.trim()).map(d => ({ name: d.name.trim(), relation: d.relation, dob: d.dob || undefined, is_primary: 0 })),
      ];
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar_last4: aadhaar, branch, members }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create card');
      router.push(`/admin/cards/${data.card_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create card');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={() => router.push('/admin/cards')}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Cards
      </Button>
      <h1 className="text-2xl font-bold mb-6">New VIP Card</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Card Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Aadhaar Last 4 Digits *</Label>
              <Input value={aadhaar} onChange={e => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="1234" maxLength={4} />
            </div>
            <div className="space-y-2">
              <Label>Branch *</Label>
              <Select value={branch} onValueChange={(v) => setBranch(v ?? '')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Primary Member</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={primary.name} onChange={e => setPrimary(p => ({ ...p, name: e.target.value }))} placeholder="Ravi Kumar" />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" value={primary.dob} onChange={e => setPrimary(p => ({ ...p, dob: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Dependents ({dependents.length}/3)</CardTitle>
            {dependents.length < 3 && (
              <Button type="button" variant="ghost" size="sm" onClick={addDependent}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {dependents.map((dep, i) => (
              <div key={i}>
                <div className="grid grid-cols-3 gap-3 items-end">
                  <Input value={dep.name} onChange={e => updateDependent(i, 'name', e.target.value)} placeholder="Full name" />
                  <Select value={dep.relation} onValueChange={v => updateDependent(i, 'relation', v ?? '')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RELATIONS.map(r => <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input type="date" value={dep.dob} onChange={e => updateDependent(i, 'dob', e.target.value)} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeDependent(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {i < dependents.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
            {!dependents.length && <p className="text-muted-foreground text-sm">No dependents added yet.</p>}
          </CardContent>
        </Card>

        {error && <p className="text-destructive text-sm">{error}</p>}
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.push('/admin/cards')}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Creating...' : 'Create Card'}</Button>
        </div>
      </form>
    </div>
  );
}
