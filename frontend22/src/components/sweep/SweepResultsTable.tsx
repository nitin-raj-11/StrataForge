import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { SweepResultRow, RankByMetric } from '../../api/types'
import { formatPercent, gainLossClass } from '../../lib/format'

type MetricKey = 'totalReturn' | 'sharpeRatio' | 'maxDrawdown' | 'winRate'
type SortKey = MetricKey | string // parameter columns are dynamic

export default function SweepResultsTable({
  rows,
  defaultRankBy,
}: {
  rows: SweepResultRow[]
  defaultRankBy: RankByMetric
}) {
  const paramKeys = useMemo(
    () => Array.from(new Set(rows.flatMap((r) => Object.keys(r.parameters)))),
    [rows]
  )
  const [sortKey, setSortKey] = useState<SortKey>(defaultRankBy)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = paramKeys.includes(sortKey) ? a.parameters[sortKey] : (a as any)[sortKey]
      const bv = paramKeys.includes(sortKey) ? b.parameters[sortKey] : (b as any)[sortKey]
      const cmp = (av ?? 0) - (bv ?? 0)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [rows, sortKey, sortDir, paramKeys])

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function headerButton(key: SortKey, label: string) {
    return (
      <button
        type="button"
        onClick={() => toggleSort(key)}
        className="flex items-center gap-1 text-ink-faint hover:text-ink-primary transition uppercase tracking-wide text-[11px] font-medium"
      >
        {label}
        {sortKey === key && <span className="text-accent-amber">{sortDir === 'asc' ? '↑' : '↓'}</span>}
      </button>
    )
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-[13px] min-w-[720px]">
        <thead>
          <tr className="border-b border-base-border text-left">
            <th className="px-3 py-2.5 w-10" />
            {paramKeys.map((key) => (
              <th key={key} className="px-3 py-2.5">
                {headerButton(key, key)}
              </th>
            ))}
            <th className="px-3 py-2.5">{headerButton('totalReturn', 'Total return')}</th>
            <th className="px-3 py-2.5">{headerButton('sharpeRatio', 'Sharpe')}</th>
            <th className="px-3 py-2.5">{headerButton('maxDrawdown', 'Max drawdown')}</th>
            <th className="px-3 py-2.5">{headerButton('winRate', 'Win rate')}</th>
            <th className="px-3 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.runId}
              className={`border-b border-base-borderMuted hover:bg-white/[0.015] ${
                i === 0 ? 'bg-accent-amber/[0.05] border-l-2 border-l-accent-amber' : ''
              }`}
            >
              <td className="px-3 py-2.5 mono-num text-ink-faint">{i === 0 ? '★' : i + 1}</td>
              {paramKeys.map((key) => (
                <td key={key} className="px-3 py-2.5 mono-num text-ink-muted">
                  {row.parameters[key] ?? '—'}
                </td>
              ))}
              <td className={`px-3 py-2.5 mono-num font-medium ${gainLossClass(row.totalReturn)}`}>
                {formatPercent(row.totalReturn)}
              </td>
              <td className="px-3 py-2.5 mono-num">{row.sharpeRatio.toFixed(2)}</td>
              <td className={`px-3 py-2.5 mono-num font-medium ${gainLossClass(row.maxDrawdown)}`}>
                {formatPercent(row.maxDrawdown)}
              </td>
              <td className="px-3 py-2.5 mono-num">{row.winRate.toFixed(1)}%</td>
              <td className="px-3 py-2.5">
                <Link to={`/results/${row.runId}`} className="text-accent-amber hover:brightness-110 text-[12px] font-medium">
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
