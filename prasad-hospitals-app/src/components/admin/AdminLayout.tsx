import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { icon: 'credit_card', label: 'Cards', path: '/admin/cards' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      {/* Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 border-r border-slate-100 bg-slate-50 flex flex-col p-4 overflow-y-auto z-50">
        {/* Logo / Brand */}
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl signature-gradient flex items-center justify-center text-white">
            <span className="material-symbols-outlined">clinical_notes</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-blue-900 leading-none">Prasad Hospitals</h2>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-1 font-semibold">VIP Management</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 py-4">
          {NAV_ITEMS.map(item => {
            const active = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm tracking-wide transition-all font-headline ${
                  active
                    ? 'bg-white text-blue-900 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-blue-700 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto pt-4 border-t border-slate-200 space-y-2">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container rounded-lg transition-all text-sm tracking-wide font-headline"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 flex justify-between items-center w-full px-8 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md z-40">
          <div className="text-xl font-bold tracking-tight text-blue-900 flex items-center gap-2 font-headline">
            <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            Prasad Hospitals
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-on-surface">Admin</p>
              <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-fixed-dim flex items-center justify-center font-bold text-primary text-sm">A</div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-10 space-y-8 max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
