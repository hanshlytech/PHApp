import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCard, getCardQr, patchCardStatus } from '../../api/cards';
import MemberChip from '../../components/admin/MemberChip';
import AdminLayout from '../../components/admin/AdminLayout';
import type { CardDetail as CardDetailType } from '../../api/cards';

const STATUS_PILL: Record<string, string> = {
  active: 'bg-[#6ab539] text-white',
  expired: 'bg-error-container text-on-error-container',
  suspended: 'bg-secondary-container text-on-secondary-container',
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
  .card { width: 252px; height: 159px; border-radius: 10px; position: relative; overflow: hidden; flex-shrink: 0; }
  .card-front { background: linear-gradient(135deg, #1a3a6b 0%, #0d2847 100%); border: 1px solid rgba(212,175,55,0.35); padding: 14px; display: flex; flex-direction: column; justify-content: space-between; }
  .card-front::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #D4AF37, transparent); }
  .card-front::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent); }
  .front-glow { position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; border-radius: 50%; background: radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%); pointer-events: none; }
  .front-top { display: flex; justify-content: space-between; align-items: flex-start; position: relative; }
  .hospital-name { font-size: 7.5px; font-weight: 700; color: #D4AF37; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 3px; }
  .card-title { font-size: 13px; font-weight: 800; color: #fff; margin-bottom: 2px; }
  .card-subtitle { font-size: 7.5px; color: rgba(255,255,255,0.38); }
  .logo-svg { flex-shrink: 0; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.35)); }
  .front-bottom { display: flex; justify-content: space-between; align-items: flex-end; position: relative; }
  .member-label { font-size: 7.5px; color: rgba(212,175,55,0.55); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
  .member-name { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 5px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .card-number { font-size: 9px; color: rgba(255,255,255,0.45); letter-spacing: 1.5px; font-family: 'Courier New', monospace; margin-bottom: 3px; }
  .card-validity { font-size: 7px; color: rgba(212,175,55,0.5); }
  .qr-box { width: 52px; height: 52px; background: #fff; border-radius: 6px; border: 2px solid rgba(212,175,55,0.6); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .qr-box img { width: 44px; height: 44px; }
  .card-back { background: linear-gradient(135deg, #fffdf5 0%, #fef9e7 100%); border: 1.5px solid #D4AF37; padding: 12px 14px; display: flex; flex-direction: column; justify-content: space-between; position: relative; }
  .back-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .benefits-label { font-size: 7px; font-weight: 700; color: #D4AF37; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 2px; }
  .back-expiry { font-size: 7px; color: #888; }
  .pills { display: flex; flex-wrap: wrap; gap: 4px; margin: 6px 0; }
  .pill { font-size: 7.5px; font-weight: 700; color: #1a3a6b; background: #fff; border: 1px solid #D4AF37; border-radius: 20px; padding: 2px 7px; white-space: nowrap; }
  .policy-note { font-size: 7px; color: #888; font-style: italic; line-height: 1.4; }
  .back-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 4px; }
  .footer-site { font-size: 7.5px; font-weight: 700; color: #1a3a6b; margin-bottom: 2px; }
  .footer-branches { font-size: 6.5px; color: #999; }
  .footer-policy { font-size: 6.5px; color: #bbb; line-height: 1.5; }
  .back-watermark { position: absolute; bottom: 8px; right: 10px; width: 70px; height: 70px; opacity: 0.06; pointer-events: none; }
  .actions { display: flex; gap: 12px; margin-top: 36px; }
  .btn-print { background: #1a3a6b; color: #fff; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .btn-print:hover { background: #0d2847; }
  .btn-close { background: #fff; color: #555; border: 1px solid #ddd; padding: 10px 20px; border-radius: 8px; font-size: 14px; cursor: pointer; }
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
        <div>
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
        <div>
          <div class="member-label">Card Holder</div>
          <div class="member-name">${primaryName}</div>
          <div class="card-number">${card.card_number}</div>
          <div class="card-validity">Valid thru: ${expiryStr}</div>
        </div>
        <div class="qr-box"><img src="${qr}" alt="QR" /></div>
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
        <div>
          <div class="footer-site">prasadhospitals.in</div>
          <div class="footer-branches">Nacharam · Pragathi Nagar · Manikonda</div>
        </div>
        <div style="text-align:right">
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
    <AdminLayout>
      <div className="flex items-center justify-center py-20 text-on-surface-variant">Loading...</div>
    </AdminLayout>
  );
  if (error || !card) return (
    <AdminLayout>
      <div className="flex items-center justify-center py-20 text-error">{error || 'Card not found'}</div>
    </AdminLayout>
  );

  const primaryMember = card.members.find(m => m.is_primary) ?? card.members[0];

  return (
    <AdminLayout>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-medium text-on-surface-variant mb-2">
        <button onClick={() => navigate('/admin/cards')} className="hover:text-primary transition-colors">Cards</button>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-primary font-bold">Card Detail ({card.card_number})</span>
      </nav>

      {/* Card Banner */}
      <section className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-headline font-extrabold text-primary tracking-tight">
                {primaryMember?.name ?? '—'}
              </h2>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm ${STATUS_PILL[card.status] ?? STATUS_PILL.active}`}>
                {card.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-mono text-sm tracking-widest bg-slate-50 px-3 py-1 rounded-md w-fit">
              <span className="material-symbols-outlined text-sm">credit_card</span>
              {card.card_number}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
            {card.status !== 'expired' && (
              <button
                onClick={toggleStatus}
                className="px-4 py-2.5 rounded-lg border border-outline-variant text-primary font-semibold text-sm hover:bg-slate-50 transition-all active:scale-95 whitespace-nowrap"
              >
                {card.status === 'active' ? 'Suspend Card' : 'Activate Card'}
              </button>
            )}
            <button
              onClick={handleGenerateCard}
              className="px-4 py-2.5 rounded-lg bg-[#1a3a6b] text-white font-semibold text-sm flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 shadow-[#1a3a6b]/20 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              Generate Card
            </button>
          </div>
        </div>
      </section>
      {cardGenError && <p className="text-error text-sm mt-2">{cardGenError}</p>}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Member Details */}
          <div className="bg-surface-container-lowest rounded-xl p-8 space-y-6">
            <h3 className="text-lg font-headline font-bold text-primary">Member Details</h3>
            {/* Primary */}
            {primaryMember && (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50/50">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface">{primaryMember.name}</p>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Primary Holder</p>
                </div>
              </div>
            )}
            {/* Dependents */}
            {card.members.filter(m => m.id !== primaryMember?.id).length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Dependents</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {card.members.filter(m => m.id !== primaryMember?.id).map(m => (
                    <MemberChip key={m.id} member={m} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Technical Metadata */}
          <div className="bg-surface-container-lowest rounded-xl p-8">
            <h3 className="text-lg font-headline font-bold text-primary mb-6">Technical Metadata</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issued Date</p>
                <p className="text-sm font-semibold text-on-surface">{card.issued_date}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expiry Date</p>
                <p className="text-sm font-semibold text-on-surface">{card.expiry_date}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Branch</p>
                <p className="text-sm font-semibold text-on-surface">{card.branch}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aadhaar Mapping</p>
                <p className="text-sm font-semibold text-on-surface">**** {card.aadhaar_last4}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Tabs */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-headline font-bold text-primary">Activity</h3>
              <div className="flex gap-1">
                {(['history', 'per-member'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      tab === t ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {t === 'history' ? 'History' : 'Members'}
                  </button>
                ))}
              </div>
            </div>

            {tab === 'history' && (
              <div className="space-y-1">
                <div className="grid grid-cols-3 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-50">
                  <span>Service</span>
                  <span>Date</span>
                  <span className="text-right">Branch</span>
                </div>
                {card.visits.slice(0, 10).map(v => (
                  <div key={v.id} className="grid grid-cols-3 py-3 items-center border-b border-slate-50 last:border-0">
                    <div className="text-xs font-bold text-on-surface">{v.service_type}</div>
                    <div className="text-[11px] text-slate-500">{v.visited_at.split('T')[0]}</div>
                    <div className="text-[10px] text-right text-slate-400 font-semibold">{v.branch}</div>
                  </div>
                ))}
                {!card.visits.length && (
                  <p className="py-6 text-center text-on-surface-variant text-sm">No visits recorded yet</p>
                )}
              </div>
            )}

            {tab === 'per-member' && (
              <div className="space-y-3">
                {card.members.map(m => {
                  const memberVisits = card.visits.filter(v => v.member_id === m.id);
                  const last = memberVisits[0];
                  return (
                    <div key={m.id} className="p-4 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-primary-fixed-dim rounded-full flex items-center justify-center text-primary text-xs font-bold">
                          {m.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{m.name}</p>
                          <p className="text-[10px] text-on-surface-variant capitalize">{m.relation}</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-primary">{memberVisits.length}</p>
                      <p className="text-[10px] text-on-surface-variant">total visits</p>
                      {last && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          Last: {last.service_type} · {last.visited_at.split('T')[0]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
