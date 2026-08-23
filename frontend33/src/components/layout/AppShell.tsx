import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function AppShell({ children }: { children: ReactNode }) {
  const isMock = import.meta.env.VITE_USE_MOCK_API === 'true';

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <Link to="/build" className="text-xl font-bold tracking-tight text-blue-500 flex items-center gap-2">
            <span className="text-2xl">⚡</span> StrataForge
          </Link>
          <nav className="flex gap-4">
            <Link to="/build" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              New Strategy
            </Link>
          </nav>
        </div>
        {isMock && (
          <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold rounded-full uppercase tracking-wider">
            Mock Mode
          </div>
        )}
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
