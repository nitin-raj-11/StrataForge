import type { ReactNode } from 'react'
import BiasGuardStrip from './BiasGuardStrip'
import NavBar from './NavBar'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <BiasGuardStrip />
      <NavBar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">{children}</main>
      <footer className="border-t border-base-borderMuted py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-[12px] text-ink-faint font-mono">
          StrataForge — backtest your edge, before you bet on it.
        </div>
      </footer>
    </div>
  )
}
