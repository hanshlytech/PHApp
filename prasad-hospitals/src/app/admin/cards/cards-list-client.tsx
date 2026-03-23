'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Card {
  id: number;
  card_number: string;
  aadhaar_last4: string;
  issued_date: string;
  expiry_date: string;
  status: string;
  branch: string;
  member_count: number;
  visit_count: number;
  primary_name: string | null;
}

const STATUS_VARIANT: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  active: 'default',
  expired: 'destructive',
  suspended: 'secondary',
};

export function CardsListClient({ initialCards }: { initialCards: Card[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = initialCards.filter(c => {
    const matchesSearch = !search ||
      (c.primary_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      c.card_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">VIP Cards</h1>
        <Button onClick={() => router.push('/admin/cards/new')}>
          <Plus className="h-4 w-4 mr-2" /> New Card
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or card ID..."
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Card Holder</TableHead>
              <TableHead>Card ID</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visits</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id} className="cursor-pointer" onClick={() => router.push(`/admin/cards/${c.id}`)}>
                <TableCell>
                  <div className="font-medium">{c.primary_name || c.card_number}</div>
                  <div className="text-xs text-muted-foreground">{c.member_count} member{c.member_count !== 1 ? 's' : ''}</div>
                </TableCell>
                <TableCell className="font-mono text-sm">{c.card_number}</TableCell>
                <TableCell className="text-sm">{c.expiry_date}</TableCell>
                <TableCell className="text-sm">{c.branch}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[c.status] || 'outline'}>{c.status}</Badge>
                </TableCell>
                <TableCell className="text-sm text-primary">{c.visit_count} visits</TableCell>
              </TableRow>
            ))}
            {!filtered.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No cards found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
