import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { SweepResult } from '../api/types'
import { getSweepResult } from '../api/backtests'
import { LoadingPanel, ErrorPanel } from '../components/layout/StatusPanel'
import { SectionCard } from '../components/strategy/FormField'
import SweepResultsTable from '../components/sweep/SweepResultsTable'

export default function SweepResultsPage() {
  const { id } = useParams<{ id: string }>()
  const [result, setResult] = useState<SweepResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getSweepResult(id)
      .then((r) => {
        if (!cancelled) setResult(r)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load sweep result.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <LoadingPanel label="Running parameter sweep…" />
  if (error || !result) {
    return (
      <ErrorPanel
        title="We couldn't find that sweep"
        message={error ?? `No sweep exists for id "${id}". It may have expired with your session.`}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="label-eyebrow mb-1">Parameter sweep</p>
          <h1 className="text-xl sm:text-2xl font-semibold mono-num">{result.id}</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/history" className="btn-secondary">
            History
          </Link>
          <Link to="/build" className="btn-secondary">
            Run another sweep
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3.5">
        <div className="panel p-4">
          <p className="label-eyebrow mb-2">Combinations run</p>
          <p className="mono-num text-2xl font-semibold">{result.results.length}</p>
        </div>
        <div className="panel p-4">
          <p className="label-eyebrow mb-2">Sequential (illustrative)</p>
          <p className="mono-num text-2xl font-semibold text-ink-muted">
            {result.timing ? `${(result.timing.sequentialMs / 1000).toFixed(2)}s` : '—'}
          </p>
        </div>
        <div className="panel p-4">
          <p className="label-eyebrow mb-2">
            Parallel · {result.timing?.cores ?? '—'} cores (illustrative)
          </p>
          <p className="mono-num text-2xl font-semibold text-gain">
            {result.timing ? `${(result.timing.parallelMs / 1000).toFixed(2)}s` : '—'}
          </p>
        </div>
      </div>
      <p className="text-[12px] text-ink-faint -mt-2">
        Timing figures above are illustrative placeholders generated on this device — they'll be
        replaced with real ExecutorService benchmark numbers once wired to the live backend.
      </p>

      <SectionCard title={`Ranked by ${labelForRankBy(result.rankBy)}`}>
        <SweepResultsTable rows={result.results} defaultRankBy={result.rankBy} />
      </SectionCard>
    </div>
  )
}

function labelForRankBy(key: SweepResult['rankBy']) {
  if (key === 'sharpeRatio') return 'Sharpe ratio'
  if (key === 'totalReturn') return 'total return'
  return 'win rate'
}
