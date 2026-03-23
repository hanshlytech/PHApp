'use client';

import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { useVipWizard } from '@/context/VipWizardContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function safeStop(scanner: Html5Qrcode | null): Promise<void> {
  if (!scanner) return Promise.resolve();
  try { return scanner.stop().catch(() => {}); } catch { return Promise.resolve(); }
}

class ScanErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(err: Error) { return { error: err.message || String(err) }; }
  render() {
    if (this.state.error) {
      return (
        <div className="p-6 text-destructive">
          <h2 className="text-foreground font-bold mb-2">Something went wrong</h2>
          <p className="text-sm">{this.state.error}</p>
          <button onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ScanStepInner() {
  const router = useRouter();
  const { card, setCard } = useVipWizard();
  const inputRef = useRef<HTMLInputElement>(null);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerStarted, setScannerStarted] = useState(false);
  const [pendingNav, setPendingNav] = useState(false);
  const scanningRef = useRef(false);

  useEffect(() => {
    if (pendingNav && card) router.push('/vip/member');
  }, [pendingNav, card, router]);

  async function handleScan(qrCode: string) {
    const trimmed = qrCode.trim();
    if (!trimmed || scanningRef.current) return;
    scanningRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/scan/${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Card not found');
      setCard(data);
      setPendingNav(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to scan card.');
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
        html5Qrcode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            if (cancelled) return;
            safeStop(html5Qrcode).then(() => { if (!cancelled) handleScanRef.current(decodedText); });
          },
          () => {}
        ).then(() => { if (!cancelled) setScannerStarted(true); }).catch(() => {});
      } catch {}
    }, 150);
    inputRef.current?.focus();
    return () => { cancelled = true; clearTimeout(timerId); safeStop(html5QrcodeRef.current); };
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const value = e.currentTarget.value.trim();
      if (value) { handleScan(value); e.currentTarget.value = ''; }
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Scan VIP Card</h1>
        <p className="text-muted-foreground text-sm mt-1">Point camera at QR code or use the hardware scanner</p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-hidden rounded-lg">
          <div id="qr-reader" className="w-full" />
          {!scannerStarted && (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Camera unavailable — use input below</div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs uppercase tracking-widest">or</span>
        <Separator className="flex-1" />
      </div>

      <Input ref={inputRef} type="text" placeholder="Type / scan card ID here" onKeyDown={handleKeyDown} disabled={loading} autoFocus className="text-base py-6" />

      {loading && <p className="text-center text-primary font-medium">Scanning...</p>}
      {error && <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm">{error}</div>}
    </div>
  );
}

export default function ScanPage() {
  return <ScanErrorBoundary><ScanStepInner /></ScanErrorBoundary>;
}
