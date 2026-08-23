import { useState } from 'react'
import Modal from './Modal'

// The signature element of the app. StrataForge's whole differentiator (per the
// project docs) is that it structurally prevents look-ahead bias — this strip
// makes that a persistent, felt part of the interface rather than a line in a
// README, echoing a terminal-style system status readout.
export default function BiasGuardStrip() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative overflow-hidden border-b border-base-borderMuted bg-base-panel">
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-accent-amber/[0.06] to-transparent animate-scan" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-1.5 flex items-center gap-2 text-[11px] font-mono tracking-wide text-ink-faint">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-gain animate-pulseDot" />
        </span>
        <span className="text-gain/90">FORWARD-ONLY EXECUTION</span>
        <span className="text-ink-faint">·</span>
        <span>NO LOOK-AHEAD BY CONSTRUCTION</span>
        <span className="hidden sm:inline text-ink-faint">·</span>
        <span className="hidden sm:inline">BAR i SEES ONLY BARS 0…i</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-auto shrink-0 h-4 w-4 rounded-full border border-ink-faint/40 text-[10px] flex items-center justify-center hover:border-accent-amber hover:text-accent-amber transition"
          aria-label="What does this mean?"
        >
          ?
        </button>
      </div>

      {open && (
        <Modal title="What the bias guards actually do" onClose={() => setOpen(false)}>
          <p>
            <strong className="text-ink-primary">Look-ahead bias</strong> — the engine walks
            forward one bar at a time and calculates indicators using only bars up to and
            including the current one. There's no code path that lets a strategy see tomorrow's
            close, so this isn't a convention that could be violated by accident — it's
            structural.
          </p>
          <p>
            <strong className="text-ink-primary">Survivorship bias</strong> — the fixed ticker
            universe only includes companies that are still listed today. Backtests can look
            better than a live strategy would have performed historically, since delisted or
            failed companies aren't represented in the data.
          </p>
          <p className="text-ink-faint">
            Per the project docs: describe this system as protecting against look-ahead bias
            through forward-only execution, not as completely "bias-free."
          </p>
        </Modal>
      )}
    </div>
  )
}
