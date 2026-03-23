// src/pages/vip/ScanStep.tsx
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { scanQr } from '../../api/scan';
import { useVipWizard } from '../../context/VipWizardContext';
import { useAuth } from '../../hooks/useAuth';

// html5-qrcode throws SYNCHRONOUSLY in many cases (stop when not running, etc.)
function safeStop(scanner: Html5Qrcode | null): Promise<void> {
  if (!scanner) return Promise.resolve();
  try {
    return scanner.stop().catch(() => {});
  } catch {
    return Promise.resolve();
  }
}

// Error boundary to catch rendering crashes and show them visibly on mobile
class ScanErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(err: Error) {
    return { error: err.message || String(err) };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, background: '#0f172a', minHeight: '100vh', color: '#fca5a5', fontFamily: 'monospace' }}>
          <h2 style={{ color: '#fff', marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ fontSize: 14 }}>{this.state.error}</p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{ marginTop: 16, padding: '8px 16px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8 }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ScanStepInner() {
  const navigate = useNavigate();
  const { card, setCard } = useVipWizard();
  const { logout } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerStarted, setScannerStarted] = useState(false);
  const [pendingNav, setPendingNav] = useState(false);

  // DEBUG: visible log for mobile (no dev tools)
  const [debugLog, setDebugLog] = useState<string[]>([]);
  function addDebug(msg: string) {
    console.log('[ScanStep]', msg);
    setDebugLog(prev => [...prev.slice(-14), `${new Date().toLocaleTimeString()}: ${msg}`]);
  }

  const scanningRef = useRef(false);

  // Catch unhandled errors globally so they show in the debug panel
  useEffect(() => {
    const handler = (e: ErrorEvent) => addDebug(`UNCAUGHT: ${e.message}`);
    const rejHandler = (e: PromiseRejectionEvent) => addDebug(`UNHANDLED: ${e.reason}`);
    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', rejHandler);
    return () => {
      window.removeEventListener('error', handler);
      window.removeEventListener('unhandledrejection', rejHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navigate only after React has committed the card into context
  useEffect(() => {
    if (pendingNav && card) {
      addDebug('navigating to /vip/member');
      navigate('/vip/member');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingNav, card, navigate]);

  async function handleScan(qrCode: string) {
    const trimmed = qrCode.trim();
    if (!trimmed || scanningRef.current) {
      addDebug(`skipped: empty="${!trimmed}", busy=${scanningRef.current}`);
      return;
    }
    scanningRef.current = true;
    setLoading(true);
    setError(null);
    addDebug(`API call: "${trimmed}"`);
    try {
      const scanned = await scanQr(trimmed);
      addDebug(`OK: card=${scanned.card_number}, members=${scanned.members?.length}`);
      setCard(scanned);
      setPendingNav(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to scan card.';
      addDebug(`API error: ${msg}`);
      setError(msg);
      scanningRef.current = false;
    } finally {
      setLoading(false);
    }
  }

  const handleScanRef = useRef(handleScan);
  handleScanRef.current = handleScan;

  useEffect(() => {
    let cancelled = false;

    const timerId = setTimeout(() => {
      if (cancelled) return;

      try {
        const container = document.getElementById('qr-reader');
        if (container) container.innerHTML = '';

        const html5Qrcode = new Html5Qrcode('qr-reader');
        html5QrcodeRef.current = html5Qrcode;

        html5Qrcode
          .start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
              if (cancelled) return;
              addDebug(`QR decoded: "${decodedText}"`);
              safeStop(html5Qrcode).then(() => {
                if (!cancelled) handleScanRef.current(decodedText);
              });
            },
            () => {}
          )
          .then(() => {
            if (!cancelled) {
              addDebug('scanner started');
              setScannerStarted(true);
            }
          })
          .catch((err) => {
            addDebug(`scanner start error: ${err}`);
          });
      } catch (err) {
        addDebug(`scanner init error: ${err}`);
      }
    }, 150);

    inputRef.current?.focus();

    return () => {
      cancelled = true;
      clearTimeout(timerId);
      safeStop(html5QrcodeRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const value = (e.currentTarget as HTMLInputElement).value.trim();
      if (value) {
        handleScan(value);
        (e.currentTarget as HTMLInputElement).value = '';
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Scan VIP Card</h1>
          <p className="text-slate-400 text-sm mt-1">
            Point camera at QR code or use the hardware scanner
          </p>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
          <div id="qr-reader" className="w-full" />
          {!scannerStarted && (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
              Camera unavailable — use input below
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-slate-500 text-xs uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder="Or type / scan card ID here"
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
          autoFocus
        />

        {loading && (
          <p className="text-center text-sky-400 font-medium">Scanning...</p>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* DEBUG — visible on mobile since there's no dev console */}
        <div className="bg-slate-900 border border-yellow-700 rounded-xl px-3 py-2 text-xs font-mono text-yellow-300 space-y-0.5">
          <p className="text-yellow-500 font-semibold mb-1">DEBUG (mobile):</p>
          {debugLog.length === 0
            ? <p className="text-slate-500">waiting for events...</p>
            : debugLog.map((line, i) => <p key={i}>{line}</p>)
          }
        </div>

        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/vip/login');
            }}
            className="w-full py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScanStep() {
  return (
    <ScanErrorBoundary>
      <ScanStepInner />
    </ScanErrorBoundary>
  );
}
