import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { BacktestResult } from '../api/types'
import { getBacktestResult } from '../api/backtests'
import { LoadingPanel, ErrorPanel } from '../components/layout/StatusPanel'
import MetricsCards from '../components/results/MetricsCards'
import EquityCurveChart from '../components/results/EquityCurveChart'
import DrawdownChart from '../components/results/DrawdownChart'
import TradeLogTable from '../components/results/TradeLogTable'
import MonteCarloPanel from '../components/results/MonteCarloPanel'
import { SectionCard } from '../components/strategy/FormField'
import { formatDate } from '../lib/format'
import { setPrefill } from '../lib/prefill'
import { downloadTradesCSV, downloadJSON, copyJSONToClipboard } from '../lib/exportUtils'

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getBacktestResult(id)
      .then((r) => {
        if (!cancelled) setResult(r)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load result.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <LoadingPanel label="Loading backtest result…" />
  if (error || !result) {
    return (
      <ErrorPanel
        title="We couldn't find that backtest"
        message={error ?? `No result exists for id "${id}". It may have expired with your session.`}
      />
    )
  }

  function handleEditRerun() {
    if (!result?.request) return
    setPrefill(result.request)
    navigate('/build')
  }

  async function handleCopyJSON() {
    if (!result?.request) return
    const ok = await copyJSONToClipboard(result.request.strategy)
    setCopied(ok)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="label-eyebrow mb-1">Backtest result</p>
          <h1 className="text-xl sm:text-2xl font-semibold mono-num">{result.id}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/history" className="btn-secondary">
            History
          </Link>
          <Link to="/build" className="btn-secondary">
            New strategy
          </Link>
        </div>
      </div>

      {result.request && (
        <SectionCard title="Strategy used">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 text-[13px]">
              <p>
                <span className="text-ink-faint">Name</span>{' '}
                <span className="font-medium">{result.request.strategy.name}</span>
              </p>
              <p>
                <span className="text-ink-faint">Ticker</span>{' '}
                <span className="mono-num">{result.request.ticker}</span>
                <span className="text-ink-faint mx-2">·</span>
                <span className="text-ink-faint">
                  {formatDate(result.request.startDate)} – {formatDate(result.request.endDate)}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleEditRerun} className="btn-secondary text-[13px]">
                Edit &amp; rerun
              </button>
              <button type="button" onClick={handleCopyJSON} className="btn-secondary text-[13px]">
                {copied ? 'Copied ✓' : 'Copy strategy JSON'}
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadJSON(
                    result.request!.strategy,
                    `${result.request!.strategy.name.replace(/\s+/g, '_')}.json`
                  )
                }
                className="btn-secondary text-[13px]"
              >
                Download JSON
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      <MetricsCards metrics={result.metrics} />

      <SectionCard title="Equity curve">
        <EquityCurveChart data={result.equityCurve} />
      </SectionCard>

      <SectionCard title="Drawdown">
        <DrawdownChart data={result.drawdownCurve} />
      </SectionCard>

      <SectionCard
        title="Trade log"
        action={
          result.trades.length > 0 && (
            <button
              type="button"
              onClick={() => downloadTradesCSV(result.trades, `${result.id}_trades.csv`)}
              className="btn-secondary text-[13px]"
            >
              Export CSV
            </button>
          )
        }
      >
        <TradeLogTable trades={result.trades} />
      </SectionCard>

      <SectionCard title="Monte Carlo — trade sequence simulation" eyebrow="How much of this was ordering luck?">
        <MonteCarloPanel trades={result.trades} />
      </SectionCard>
    </div>
  )
}
