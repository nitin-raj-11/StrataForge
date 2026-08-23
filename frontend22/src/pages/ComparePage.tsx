import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { BacktestResult } from '../api/types'
import { getBacktestResult } from '../api/backtests'
import { getHistory } from '../lib/history'
import { LoadingPanel, ErrorPanel } from '../components/layout/StatusPanel'
import { SectionCard } from '../components/strategy/FormField'
import CompareEquityChart from '../components/results/CompareEquityChart'
import { formatPercent, gainLossClass } from '../lib/format'

const METRIC_ROWS: { key: keyof BacktestResult['metrics']; label: string; percent?: boolean }[] = [
  { key: 'totalReturn', label: 'Total return', percent: true },
  { key: 'maxDrawdown', label: 'Max drawdown', percent: true },
  { key: 'sharpeRatio', label: 'Sharpe ratio' },
  { key: 'winRate', label: 'Win rate', percent: true },
  { key: 'totalTrades', label: 'Total trades' },
]

export default function ComparePage() {
  const [params, setParams] = useSearchParams()
  const idA = params.get('a') ?? ''
  const idB = params.get('b') ?? ''

  const [resultA, setResultA] = useState<BacktestResult | null>(null)
  const [resultB, setResultB] = useState<BacktestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runOptions = getHistory().filter((e) => e.kind === 'run')

  useEffect(() => {
    if (!idA || !idB) return
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([getBacktestResult(idA), getBacktestResult(idB)])
      .then(([a, b]) => {
        if (!cancelled) {
          setResultA(a)
          setResultB(b)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load one of the runs.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [idA, idB])

  function update(key: 'a' | 'b', value: string) {
    const next = new URLSearchParams(params)
    next.set(key, value)
    setParams(next, { replace: true })
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="label-eyebrow mb-1">Side by side</p>
        <h1 className="text-2xl font-semibold">Compare two runs</h1>
      </div>

      <SectionCard title="Pick two runs from history">
        {runOptions.length < 2 ? (
          <p className="text-[13px] text-ink-faint">
            Run at least two backtests first — visit{' '}
            <Link to="/build" className="text-accent-amber">
              the strategy builder
            </Link>
            , then come back here.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <select className="input-base" value={idA} onChange={(e) => update('a', e.target.value)}>
              <option value="">Select run A…</option>
              {runOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.strategyName} · {o.ticker} · {o.id}
                </option>
              ))}
            </select>
            <select className="input-base" value={idB} onChange={(e) => update('b', e.target.value)}>
              <option value="">Select run B…</option>
              {runOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.strategyName} · {o.ticker} · {o.id}
                </option>
              ))}
            </select>
          </div>
        )}
      </SectionCard>

      {loading && <LoadingPanel label="Loading both runs…" />}
      {error && <ErrorPanel title="Couldn't load one of the runs" message={error} />}

      {resultA && resultB && !loading && (
        <>
          <SectionCard title="Equity curves">
            <CompareEquityChart
              seriesA={resultA.equityCurve}
              seriesB={resultB.equityCurve}
              labelA={resultA.request?.strategy.name ?? resultA.id}
              labelB={resultB.request?.strategy.name ?? resultB.id}
            />
          </SectionCard>

          <SectionCard title="Metrics">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] min-w-[420px]">
                <thead>
                  <tr className="border-b border-base-border text-left text-[11px] uppercase tracking-wide text-ink-faint">
                    <th className="px-3 py-2">Metric</th>
                    <th className="px-3 py-2 text-accent-amber">
                      {resultA.request?.strategy.name ?? 'Run A'}
                    </th>
                    <th className="px-3 py-2 text-[#38BDF8]">
                      {resultB.request?.strategy.name ?? 'Run B'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {METRIC_ROWS.map((row) => {
                    const va = resultA.metrics[row.key]
                    const vb = resultB.metrics[row.key]
                    return (
                      <tr key={row.key} className="border-b border-base-borderMuted">
                        <td className="px-3 py-2.5 text-ink-muted">{row.label}</td>
                        <td className={`px-3 py-2.5 mono-num font-medium ${row.percent ? gainLossClass(va) : ''}`}>
                          {row.percent ? formatPercent(va) : va}
                        </td>
                        <td className={`px-3 py-2.5 mono-num font-medium ${row.percent ? gainLossClass(vb) : ''}`}>
                          {row.percent ? formatPercent(vb) : vb}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  )
}
