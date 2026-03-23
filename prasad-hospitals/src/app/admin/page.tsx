import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function getStats() {
  const { count: total } = await db.from('cards').select('*', { count: 'exact', head: true });
  const { count: active } = await db.from('cards').select('*', { count: 'exact', head: true }).eq('status', 'active');
  const { count: expired } = await db.from('cards').select('*', { count: 'exact', head: true }).eq('status', 'expired');
  const { count: suspended } = await db.from('cards').select('*', { count: 'exact', head: true }).eq('status', 'suspended');
  return { total: total || 0, active: active || 0, expired: expired || 0, suspended: suspended || 0 };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const items = [
    { label: 'Total Cards', value: stats.total, color: 'text-sky-400' },
    { label: 'Active', value: stats.active, color: 'text-green-400' },
    { label: 'Expired', value: stats.expired, color: 'text-red-400' },
    { label: 'Suspended', value: stats.suspended, color: 'text-yellow-400' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(({ label, value, color }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${color}`}>{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
