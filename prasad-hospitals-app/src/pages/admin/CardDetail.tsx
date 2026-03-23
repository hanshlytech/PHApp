import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCard, getCardQr, patchCardStatus } from '../../api/cards';
import MemberChip from '../../components/admin/MemberChip';
import type { CardDetail as CardDetailType } from '../../api/cards';

const SERVICE_COLORS: Record<string, string> = {
  OPD: 'text-green-400',
  MRI: 'text-sky-400',
  CT: 'text-violet-400',
  XRAY: 'text-yellow-400',
  USG: 'text-orange-400',
};

const STATUS_BANNER: Record<string, string> = {
  active: 'from-slate-800 to-slate-900 border-green-900',
  expired: 'from-slate-800 to-red-950 border-red-900',
  suspended: 'from-slate-800 to-yellow-950 border-yellow-900',
};

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-900/60 text-green-300',
  expired: 'bg-red-900/60 text-red-300',
  suspended: 'bg-yellow-900/60 text-yellow-300',
};

export default function CardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [card, setCard] = useState<CardDetailType | null>(null);
  const [tab, setTab] = useState<'history' | 'per-member'>('history');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cardGenError, setCardGenError] = useState('');

  useEffect(() => {
    if (!id) return;
    getCard(Number(id))
      .then(setCard)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleGenerateCard() {
    if (!id || !card) return;
    setCardGenError('');
    let qr: string;
    try {
      ({ qr } = await getCardQr(Number(id)));
    } catch (e) {
      setCardGenError((e as Error).message || 'Failed to fetch QR code');
      return;
    }

    const primaryName =
      card.members.find(m => m.is_primary)?.name ??
      card.members[0]?.name ??
      'Card Holder';

    // Format expiry as "MMM YYYY"
    const [yr, mo] = card.expiry_date.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const expiryStr = `${months[parseInt(mo) - 1]} ${yr}`;

    // Fetch logo as base64 so the print window never makes external requests
    let logoSrc = '/PHLogo.png';
    try {
      const blob = await fetch('/PHLogo.png').then(r => r.blob());
      logoSrc = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch { /* fall back to URL */ }

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

  /* Card base */
  .card {
    width: 252px;
    height: 159px;
    border-radius: 10px;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }

  /* ── FRONT ── */
  .card-front {
    background: linear-gradient(135deg, #1a3a6b 0%, #0d2847 100%);
    border: 1px solid rgba(212,175,55,0.35);
    padding: 14px;
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
  .front-title-block {}
  .hospital-name {
    font-size: 7.5px;
    font-weight: 700;
    color: #D4AF37;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    margin-bottom: 3px;
  }
  .card-title {
    font-size: 13px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 2px;
  }
  .card-subtitle {
    font-size: 7.5px;
    color: rgba(255,255,255,0.38);
  }
  .logo-svg {
    flex-shrink: 0;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.35));
  }
  .front-bottom { display: flex; justify-content: space-between; align-items: flex-end; position: relative; }
  .front-member-block {}
  .member-label {
    font-size: 7.5px;
    color: rgba(212,175,55,0.55);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 3px;
  }
  .member-name {
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 5px;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .card-number {
    font-size: 9px;
    color: rgba(255,255,255,0.45);
    letter-spacing: 1.5px;
    font-family: 'Courier New', monospace;
    margin-bottom: 3px;
  }
  .card-validity {
    font-size: 7px;
    color: rgba(212,175,55,0.5);
  }
  .qr-box {
    width: 52px; height: 52px;
    background: #fff;
    border-radius: 6px;
    border: 2px solid rgba(212,175,55,0.6);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .qr-box img { width: 44px; height: 44px; }

  /* ── BACK ── */
  .card-back {
    background: linear-gradient(135deg, #fffdf5 0%, #fef9e7 100%);
    border: 1.5px solid #D4AF37;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
  }
  .back-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .benefits-label {
    font-size: 7px;
    font-weight: 700;
    color: #D4AF37;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .back-expiry {
    font-size: 7px;
    color: #888;
  }
  .pills { display: flex; flex-wrap: wrap; gap: 4px; margin: 6px 0; }
  .pill {
    font-size: 7.5px;
    font-weight: 700;
    color: #1a3a6b;
    background: #fff;
    border: 1px solid #D4AF37;
    border-radius: 20px;
    padding: 2px 7px;
    white-space: nowrap;
  }
  .policy-note {
    font-size: 7px;
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
  .footer-left { }
  .footer-site { font-size: 7.5px; font-weight: 700; color: #1a3a6b; margin-bottom: 2px; }
  .footer-branches { font-size: 6.5px; color: #999; }
  .footer-right { text-align: right; }
  .footer-policy { font-size: 6.5px; color: #bbb; line-height: 1.5; }
  .back-watermark {
    position: absolute;
    bottom: 8px; right: 10px;
    width: 70px; height: 70px;
    opacity: 0.06;
    pointer-events: none;
  }

  /* ── BUTTONS ── */
  .actions {
    display: flex; gap: 12px; margin-top: 36px;
  }
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

  /* ── PRINT ── */
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
  <!-- FRONT -->
  <div class="card-wrap">
    <div class="card card-front">
      <div class="front-glow"></div>
      <div class="front-top">
        <div class="front-title-block">
          <div class="hospital-name">Prasad Hospitals</div>
          <div class="card-title">VIP Health Card</div>
          <div class="card-subtitle">Multispeciality Healthcare</div>
        </div>
        <svg class="logo-svg" width="54" height="54" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg">
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

  <!-- BACK -->
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

  async function toggleStatus() {
    if (!card || !id) return;
    const newStatus = card.status === 'active' ? 'suspended' : 'active';
    await patchCardStatus(Number(id), newStatus as 'active' | 'suspended');
    setCard(c => c ? { ...c, status: newStatus as 'active' | 'expired' | 'suspended' } : c);
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>
  );
  if (error || !card) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400">{error || 'Card not found'}</div>
  );

  const primaryMember = card.members.find(m => m.is_primary) ?? card.members[0];

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/admin/cards')} className="text-slate-500 text-sm mb-4 hover:text-slate-300">
          ← Back to Cards
        </button>

        {/* Banner */}
        <div className={`bg-gradient-to-r ${STATUS_BANNER[card.status] ?? STATUS_BANNER.active} border rounded-xl p-5 mb-5`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-white">{primaryMember?.name ?? '—'}</h1>
              <p className="text-slate-400 text-sm font-mono mt-0.5">
                {card.card_number} · Aadhaar ****{card.aadhaar_last4}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${STATUS_BADGE[card.status] ?? STATUS_BADGE.active}`}>
                {card.status}
              </span>
              {card.status !== 'expired' && (
                <button
                  onClick={toggleStatus}
                  className="text-xs text-slate-400 hover:text-white border border-slate-600 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {card.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {card.members.map(m => <MemberChip key={m.id} member={m} />)}
          </div>

          <div className="flex items-center gap-6 text-sm flex-wrap">
            <div>
              <span className="text-slate-500">Issued</span>
              <span className="text-slate-300 ml-1">{card.issued_date}</span>
            </div>
            <div>
              <span className="text-slate-500">Expires</span>
              <span className={`ml-1 ${card.status === 'expired' ? 'text-red-400' : 'text-green-400'}`}>
                {card.expiry_date}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Branch</span>
              <span className="text-slate-300 ml-1">{card.branch}</span>
            </div>
            <div className="ml-auto flex flex-col items-end gap-1">
              <button
                onClick={handleGenerateCard}
                className="bg-violet-700 hover:bg-violet-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                🪪 Generate Card
              </button>
              {cardGenError && (
                <span className="text-red-400 text-xs">{cardGenError}</span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {(['history', 'per-member'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === t ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'history' ? 'Visit History' : 'Per Member'}
            </button>
          ))}
        </div>

        {tab === 'history' && (
          <div className="bg-slate-900 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Member', 'Service', 'Branch', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {card.visits.map(v => (
                  <tr key={v.id} className="border-b border-slate-800 last:border-0">
                    <td className="px-4 py-3 text-sm text-slate-300">{v.member_name}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${SERVICE_COLORS[v.service_type] ?? 'text-slate-300'}`}>
                      {v.service_type}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{v.branch}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{v.visited_at.split('T')[0]}</td>
                  </tr>
                ))}
                {!card.visits.length && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">No visits recorded yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'per-member' && (
          <div className="grid grid-cols-2 gap-3">
            {card.members.map(m => {
              const memberVisits = card.visits.filter(v => v.member_id === m.id);
              const last = memberVisits[0];
              return (
                <div key={m.id} className="bg-slate-900 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {m.name[0]}
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold">{m.name}</div>
                      <div className="text-slate-500 text-xs capitalize">{m.relation}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-300 mb-0.5">{memberVisits.length}</div>
                  <div className="text-slate-500 text-xs">total visits</div>
                  {last && (
                    <div className="text-slate-400 text-xs mt-2">
                      Last: {last.service_type} · {last.visited_at.split('T')[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
