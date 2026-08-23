import { useState } from 'react'
import type { Trade } from '../../api/types'
import { runMonteCarlo, type MonteCarloResult } from '../../lib/monteCarlo'
import { formatPercent, gainLossClass } from '../../lib/format'
import MonteCarloFanChart from './MonteCarloFanChart'
import MonteCarloHistogram from './MonteCarloHistogram'

export default function MonteCarloPanel({ trades }: { trades: Trade[] }) {
  const [result, setResult] = useState<MonteCarloResult | null>(null)
  const [running, setRunning] = useState(false)

  async function handleRun() {
    setRunning(true)
    // brief artificial pause so 200 simulations reads as real work happening,
    // matching the "observability" framing from the project docs
    await new Promise((r) => setTimeout(r, 350))
    setResult(runMonteCarlo(trades, 10000, 200))
    setRunning(false)
  }

  if (trades.length < 2) {
    return (
      <p className="text-[13px] text-ink-faint">
        Need at least 2 trades to simulate alternate orderings.
      </p>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-[13px] text-ink-muted max-w-xl">
          Your equity curve above is <em>one</em> realized ordering of these trades. Monte Carlo
          reshuffles the same {trades.length} trades 200 times to show how much of the result was
          sequencing luck versus a genuinely durable edge.
        </p>
        <button type="button" onClick={handleRun} disabled={running} className="btn-secondary">
          {running ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-ink-faint/40 border-t-ink-primary animate-spin" />
              Simulating 200 trade orderings…
            </>
          ) : (
            'Run Monte Carlo simulation'
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatBox label="Probability of profit" value={`${result.probabilityOfProfit}%`} tone="text-ink-primary" />
        <StatBox label="Median outcome" value={formatPercent(result.medianReturn)} tone={gainLossClass(result.medianReturn)} />
        <StatBox label="5th percentile" value={formatPercent(result.p5Return)} tone={gainLossClass(result.p5Return)} />
        <StatBox label="95th percentile" value={formatPercent(result.p95Return)} tone={gainLossClass(result.p95Return)} />
      </div>

      <div>
        <div className="flex items-center gap-4 mb-2 text-[11px] font-mono text-ink-faint">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 bg-accent-amber inline-block" /> median path
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 bg-accent-amber/30 inline-block rounded-sm" /> 25th–75th
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 bg-accent-amber/10 inline-block rounded-sm" /> 5th–95th
          </span>
        </div>
        <MonteCarloFanChart result={result} />
      </div>

      <div>
        <p className="text-[13px] font-medium text-ink-muted mb-2">Distribution of final outcomes</p>
        <MonteCarloHistogram result={result} />
      </div>

      <button type="button" onClick={handleRun} disabled={running} className="text-[12px] text-ink-faint hover:text-ink-primary transition">
        Re-run simulation
      </button>
    </div>
  )
}

function StatBox({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-lg border border-base-border bg-base-panel p-3.5">
      <p className="label-eyebrow mb-1.5">{label}</p>
      <p className={`mono-num text-xl font-semibold ${tone}`}>{value}</p>
    </div>
  )
}
