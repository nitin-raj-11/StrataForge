import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearHistory, getHistory, removeFromHistory, type HistoryEntry } from '../lib/history'
import { formatDate } from '../lib/format'
import { SectionCard } from '../components/strategy/FormField'

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => getHistory())
  const [selected, setSelected] = useState<string[]>([])
  const navigate = useNavigate()

  const runEntries = useMemo(() => entries.filter((e) => e.kind === 'run'), [entries])

  function refresh() {
    setEntries(getHistory())
  }

  function handleRemove(id: string) {
    removeFromHistory(id)
    refresh()
    setSelected((s) => s.filter((x) => x !== id))
  }

  function handleClearAll() {
    if (!confirm('Clear all local run history? This only affects this browser.')) return
    clearHistory()
    refresh()
    setSelected([])
  }

  function toggleSelect(id: string) {
    setSelected((s) => {
      if (s.includes(id)) return s.filter((x) => x !== id)
      if (s.length >= 2) return [s[1], id]
      return [...s, id]
    })
  }

  function goCompare() {
    if (selected.length !== 2) return
    navigate(`/compare?a=${selected[0]}&b=${selected[1]}`)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="label-eyebrow mb-1">Local history</p>
          <h1 className="text-2xl font-semibold">Past runs &amp; sweeps</h1>
          <p className="text-ink-muted text-[13px] mt-1">
            Stored in this browser only — pick two runs to compare, or jump back into any result.
          </p>
        </div>
        <div className="flex gap-2">
          {selected.length === 2 && (
            <button type="button" onClick={goCompare} className="btn-primary text-[13px]">
              Compare selected
            </button>
          )}
          {entries.length > 0 && (
            <button type="button" onClick={handleClearAll} className="btn-secondary text-[13px]">
              Clear all
            </button>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="panel p-14 text-center text-ink-faint">
          <p className="text-[14px]">No runs yet.</p>
          <Link to="/build" className="btn-primary mt-4 inline-flex">
            Build a strategy
          </Link>
        </div>
      ) : (
        <SectionCard
          title={`${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`}
          eyebrow={runEntries.length >= 2 ? 'Tip: select two runs (checkboxes) to compare' : undefined}
        >
          <div className="divide-y divide-base-borderMuted">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center gap-3 py-3">
                {e.kind === 'run' ? (
                  <input
                    type="checkbox"
                    checked={selected.includes(e.id)}
                    onChange={() => toggleSelect(e.id)}
                    className="accent-accent-amber h-4 w-4 shrink-0"
                    aria-label="Select for comparison"
                  />
                ) : (
                  <span className="w-4 shrink-0" />
                )}

                <span
                  className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded shrink-0 ${
                    e.kind === 'run'
                      ? 'bg-accent-amber/10 text-accent-amber'
                      : 'bg-gain/10 text-gain'
                  }`}
                >
                  {e.kind}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium truncate">{e.strategyName}</p>
                  <p className="text-[12px] text-ink-faint font-mono">
                    {e.ticker} · {e.startDate && formatDate(e.startDate)} – {e.endDate && formatDate(e.endDate)}
                  </p>
                </div>

                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-[11px] text-ink-faint">{e.headlineLabel}</p>
                  <p className="mono-num text-[13px]">{e.headlineValue.toFixed(2)}</p>
                </div>

                <Link
                  to={e.kind === 'run' ? `/results/${e.id}` : `/sweeps/${e.id}`}
                  className="text-accent-amber hover:brightness-110 text-[12px] font-medium shrink-0"
                >
                  View →
                </Link>

                <button
                  type="button"
                  onClick={() => handleRemove(e.id)}
                  className="text-ink-faint hover:text-loss transition text-[16px] leading-none px-1 shrink-0"
                  aria-label="Remove from history"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}
