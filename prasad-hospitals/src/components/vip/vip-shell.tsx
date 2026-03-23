'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ScanLine, ClipboardList, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const NAV_ITEMS = [
  { href: '/vip/scan', label: 'Scan Card', icon: ScanLine },
  { href: '/vip/service', label: 'Log Visit', icon: ClipboardList },
];

export function VipShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/vip/login') return <>{children}</>;

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/vip/login');
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Sidebar - hidden on mobile for scan workflow */}
      <aside className="fixed top-0 left-0 z-50 h-full w-52 bg-card border-r border-border flex-col hidden lg:flex">
        <div className="p-5">
          <h2 className="text-lg font-bold">Prasad Hospitals</h2>
          <p className="text-xs text-muted-foreground">VIP Card Scanner</p>
        </div>
        <Separator />
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </nav>
        <div className="p-3">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-52">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4 h-14 lg:px-6">
          <div className="flex-1" />
          <Badge variant="secondary" className="font-mono text-xs">Reception</Badge>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
