'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface Member { id: number; name: string; relation: string; dob?: string; is_primary: boolean; }
interface Visit { id: number; member_id: number; member_name: string; service_type: string; branch: string; visited_at: string; }
interface CardDetail {
  id: number; card_number: string; aadhaar_last4: string; issued_date: string;
  expiry_date: string; status: string; branch: string; members: Member[]; visits: Visit[];
}

const STATUS_VARIANT: Record<string, 'default' | 'destructive' | 'secondary'> = {
  active: 'default', expired: 'destructive', suspended: 'secondary',
};

const SERVICE_COLORS: Record<string, string> = {
  OPD: 'text-green-400', MRI: 'text-sky-400', CT: 'text-violet-400', XRAY: 'text-yellow-400', USG: 'text-orange-400',
};

export default function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [card, setCard] = useState<CardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/cards/${id}`).then(r => r.json()).then(setCard).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [id]);

  async function toggleStatus() {
    if (!card) return;
    const newStatus = card.status === 'active' ? 'suspended' : 'active';
    await fetch(`/api/cards/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    setCard(c => c ? { ...c, status: newStatus } : c);
  }

  async function handleGenerateCard() {
    if (!card) return;
    const res = await fetch(`/api/cards/${id}/qr`);
    const { qr } = await res.json();
    const primaryName = card.members.find(m => m.is_primary)?.name ?? card.members[0]?.name ?? 'Card Holder';
    const [yr, mo] = card.expiry_date.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const expiryStr = `${months[parseInt(mo) - 1]} ${yr}`;

    let logoSrc = '/PHLogo.png';
    try {
      const blob = await fetch('/PHLogo.png').then(r => r.blob());
      logoSrc = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch { /* fall back */ }

    const win = window.open('', '_blank');
    if (!win) return;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Prasad Hospitals — VIP Health Card</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f0f4f8;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px;
    min-height: 100vh;
  }
  h1 { font-size: 18px; color: #1a3a6b; font-weight: 700; margin-bottom: 4px; }
  .subtitle { font-size: 12px; color: #888; margin-bottom: 32px; }
  .cards-row { display: flex; gap: 40px; align-items: flex-start; flex-wrap: wrap; justify-content: center; }
  .card-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .cut-label { font-size: 10px; color: #aaa; letter-spacing: 1px; text-transform: uppercase; }
  .cut-line { width: 85.6mm; border-top: 1.5px dashed #ccc; }
  .card {
    width: 340px;
    height: 214px;
    border-radius: 10px;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }
  .card-front {
    background: linear-gradient(135deg, #1a3a6b 0%, #0d2847 100%);
    border: 1px solid rgba(212,175,55,0.35);
    padding: 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .card-front::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #D4AF37, transparent);
  }
  .card-front::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent);
  }
  .front-glow {
    position: absolute;
    top: -20px; right: -20px;
    width: 100px; height: 100px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .front-top { display: flex; justify-content: space-between; align-items: flex-start; position: relative; }
  .hospital-name {
    font-size: 10px;
    font-weight: 700;
    color: #D4AF37;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    margin-bottom: 3px;
  }
  .card-title {
    font-size: 17px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 2px;
  }
  .card-subtitle {
    font-size: 10px;
    color: rgba(255,255,255,0.38);
  }
  .logo-svg {
    flex-shrink: 0;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.35));
  }
  .front-bottom { display: flex; justify-content: space-between; align-items: flex-end; position: relative; }
  .member-label {
    font-size: 10px;
    color: rgba(212,175,55,0.55);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 3px;
  }
  .member-name {
    font-size: 17px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 5px;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .card-number {
    font-size: 12px;
    color: rgba(255,255,255,0.45);
    letter-spacing: 1.5px;
    font-family: 'Courier New', monospace;
    margin-bottom: 3px;
  }
  .card-validity {
    font-size: 9px;
    color: rgba(212,175,55,0.5);
  }
  .qr-box {
    width: 68px; height: 68px;
    background: #fff;
    border-radius: 6px;
    border: 2px solid rgba(212,175,55,0.6);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .qr-box img { width: 58px; height: 58px; }
  .card-back {
    background: linear-gradient(135deg, #fffdf5 0%, #fef9e7 100%);
    border: 1.5px solid #D4AF37;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
  }
  .back-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .benefits-label {
    font-size: 9px;
    font-weight: 700;
    color: #D4AF37;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .back-expiry { font-size: 9px; color: #888; }
  .pills { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
  .pill {
    font-size: 10px;
    font-weight: 700;
    color: #1a3a6b;
    background: #fff;
    border: 1px solid #D4AF37;
    border-radius: 20px;
    padding: 3px 10px;
    white-space: nowrap;
  }
  .policy-note {
    font-size: 9px;
    color: #888;
    font-style: italic;
    line-height: 1.4;
  }
  .back-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 4px;
  }
  .footer-site { font-size: 10px; font-weight: 700; color: #1a3a6b; margin-bottom: 2px; }
  .footer-branches { font-size: 8.5px; color: #999; }
  .footer-policy { font-size: 8.5px; color: #bbb; line-height: 1.5; text-align: right; }
  .back-watermark {
    position: absolute;
    bottom: 8px; right: 10px;
    width: 70px; height: 70px;
    opacity: 0.06;
    pointer-events: none;
  }
  .actions { display: flex; gap: 12px; margin-top: 36px; }
  .btn-print {
    background: #1a3a6b;
    color: #fff;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-print:hover { background: #0d2847; }
  .btn-close {
    background: #fff;
    color: #555;
    border: 1px solid #ddd;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
  }
  .btn-close:hover { background: #f5f5f5; }
  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { background: #fff; padding: 0; }
    h1, .subtitle, .cut-label, .actions { display: none !important; }
    .cards-row { gap: 8mm; }
    .card { width: 85.6mm; height: 54mm; border-radius: 3mm; }
    .cut-line { display: none; }
    @page { size: A4 landscape; margin: 15mm; }
  }
</style>
</head>
<body>
<h1>Prasad Hospitals — VIP Health Card</h1>
<p class="subtitle">Print on glossy card stock · Cut along dotted lines</p>

<div class="cards-row">
  <div class="card-wrap">
    <div class="card card-front">
      <div class="front-glow"></div>
      <div class="front-top">
        <div class="front-title-block">
          <div class="hospital-name">Prasad Hospitals</div>
          <div class="card-title">VIP Health Card</div>
          <div class="card-subtitle">Multispeciality Healthcare</div>
        </div>
        <svg class="logo-svg" width="70" height="70" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg">
          <circle cx="27" cy="27" r="25.5" fill="none" stroke="rgba(212,175,55,0.25)" stroke-width="1"/>
          <circle cx="27" cy="27" r="24" fill="white" stroke="#D4AF37" stroke-width="2.5"/>
          <image href="${logoSrc}" x="9" y="9" width="36" height="36" preserveAspectRatio="xMidYMid meet"/>
        </svg>
      </div>
      <div class="front-bottom">
        <div class="front-member-block">
          <div class="member-label">Card Holder</div>
          <div class="member-name">${primaryName}</div>
          <div class="card-number">${card.card_number}</div>
          <div class="card-validity">Valid thru: ${expiryStr}</div>
        </div>
        <div class="qr-box">
          <img src="${qr}" alt="QR" />
        </div>
      </div>
    </div>
    <div class="cut-line"></div>
    <div class="cut-label">✂ front</div>
  </div>

  <div class="card-wrap">
    <div class="card card-back">
      <div>
        <div class="back-header">
          <div class="benefits-label">Benefits Included</div>
          <div class="back-expiry">Expires: ${expiryStr}</div>
        </div>
        <div class="pills">
          <span class="pill">✓ Unlimited OPD</span>
          <span class="pill">✓ MRI</span>
          <span class="pill">✓ CT Scan</span>
          <span class="pill">✓ X-Ray</span>
          <span class="pill">✓ Ultrasound</span>
        </div>
        <div class="policy-note">Scans valid only with internal Prasad Hospitals prescription</div>
      </div>
      <div class="back-footer">
        <div class="footer-left">
          <div class="footer-site">prasadhospitals.in</div>
          <div class="footer-branches">Nacharam · Pragathi Nagar · Manikonda</div>
        </div>
        <div class="footer-right">
          <div class="footer-policy">Non-transferable<br/>Non-refundable</div>
        </div>
      </div>
      <img class="back-watermark" src="${logoSrc}" alt="" />
    </div>
    <div class="cut-line"></div>
    <div class="cut-label">✂ back</div>
  </div>
</div>

<div class="actions">
  <button class="btn-print" onclick="window.print()">🖨 Print Card</button>
  <button class="btn-close" onclick="window.close()">Close</button>
</div>
</body>
</html>`;

    win.document.open();
    win.document.write(html);
    win.document.close();
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;
  if (error || !card) return <div className="flex items-center justify-center py-20 text-destructive">{error || 'Card not found'}</div>;

  const primaryMember = card.members.find(m => m.is_primary) ?? card.members[0];

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={() => router.push('/admin/cards')}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Cards
      </Button>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">{primaryMember?.name ?? '—'}</h1>
              <p className="text-muted-foreground text-sm font-mono mt-0.5">{card.card_number} · Aadhaar ****{card.aadhaar_last4}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_VARIANT[card.status] || 'secondary'}>{card.status}</Badge>
              {card.status !== 'expired' && (
                <Button variant="outline" size="sm" onClick={toggleStatus}>{card.status === 'active' ? 'Suspend' : 'Activate'}</Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {card.members.map(m => (
              <Badge key={m.id} variant="outline" className="font-normal">{m.name} · <span className="capitalize">{m.relation}</span></Badge>
            ))}
          </div>

          <div className="flex items-center gap-6 text-sm flex-wrap">
            <div><span className="text-muted-foreground">Issued</span> <span className="ml-1">{card.issued_date}</span></div>
            <div><span className="text-muted-foreground">Expires</span> <span className={`ml-1 ${card.status === 'expired' ? 'text-destructive' : 'text-green-400'}`}>{card.expiry_date}</span></div>
            <div><span className="text-muted-foreground">Branch</span> <span className="ml-1">{card.branch}</span></div>
            <div className="ml-auto">
              <Button size="sm" onClick={handleGenerateCard}>Generate Card</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Visit History</TabsTrigger>
          <TabsTrigger value="per-member">Per Member</TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {card.visits.map(v => (
                  <TableRow key={v.id}>
                    <TableCell>{v.member_name}</TableCell>
                    <TableCell className={`font-semibold ${SERVICE_COLORS[v.service_type] ?? ''}`}>{v.service_type}</TableCell>
                    <TableCell>{v.branch}</TableCell>
                    <TableCell className="text-muted-foreground">{v.visited_at.split('T')[0]}</TableCell>
                  </TableRow>
                ))}
                {!card.visits.length && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No visits recorded</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="per-member">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {card.members.map(m => {
              const memberVisits = card.visits.filter(v => v.member_id === m.id);
              const last = memberVisits[0];
              return (
                <Card key={m.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-bold">{m.name[0]}</div>
                      <div>
                        <div className="font-semibold text-sm">{m.name}</div>
                        <div className="text-muted-foreground text-xs capitalize">{m.relation}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold mb-0.5">{memberVisits.length}</div>
                    <div className="text-muted-foreground text-xs">total visits</div>
                    {last && <div className="text-muted-foreground text-xs mt-2">Last: {last.service_type} · {last.visited_at.split('T')[0]}</div>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
