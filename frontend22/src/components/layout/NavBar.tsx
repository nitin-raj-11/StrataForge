import { Link, useLocation } from 'react-router-dom'
import { isMockMode } from '../../api/backtests'

export default function NavBar() {
  const location = useLocation()

  return (
    <header className="border-b border-base-border bg-base-bg/95 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/build" className="flex items-center gap-2.5 group">
          <svg width="26" height="26" viewBox="0 0 32 32" className="shrink-0">
            <rect width="32" height="32" rx="7" fill="#151A24" />
            <line x1="9" y1="5" x2="9" y2="10" stroke="#34D399" strokeWidth="2" />
            <rect x="6" y="10" width="6" height="9" rx="1" fill="#34D399" />
            <line x1="9" y1="19" x2="9" y2="24" stroke="#34D399" strokeWidth="2" />
            <line x1="22" y1="7" x2="22" y2="12" stroke="#F0554B" strokeWidth="2" />
            <rect x="19" y="12" width="6" height="8" rx="1" fill="#F0554B" />
            <line x1="22" y1="20" x2="22" y2="25" stroke="#F0554B" strokeWidth="2" />
          </svg>
          <span className="font-display font-semibold text-[17px] tracking-tight group-hover:text-accent-amber transition">
            StrataForge
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {isMockMode && (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-accent-amberDim/60 bg-accent-amber/[0.08] px-2.5 py-1 text-[11px] font-mono text-accent-amber"
              title="Running on the built-in mock engine — no backend required. Switch VITE_USE_MOCK_API=false to use the real API."
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent-amber" />
              MOCK MODE
            </span>
          )}
          <Link
            to="/history"
            className={location.pathname === '/history' ? 'btn-primary' : 'btn-secondary'}
          >
            History
          </Link>
          <Link
            to="/build"
            className={location.pathname === '/build' ? 'btn-primary' : 'btn-secondary'}
          >
            New Strategy
          </Link>
        </nav>
      </div>
    </header>
  )
}
