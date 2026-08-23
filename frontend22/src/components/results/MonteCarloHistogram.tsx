import { useMemo } from 'react'
import type { MonteCarloResult } from '../../lib/monteCarlo'

export default function MonteCarloHistogram({ result }: { result: MonteCarloResult }) {
  const bins = useMemo(() => {
    const values = result.finalReturns
    const min = Math.min(...values)
    const max = Math.max(...values)
    const bucketCount = 14
    const width = (max - min || 1) / bucketCount
    const counts = new Array(bucketCount).fill(0)
    for (const v of values) {
      const idx = Math.min(bucketCount - 1, Math.max(0, Math.floor((v - min) / width)))
      counts[idx] += 1
    }
    const maxCount = Math.max(...counts)
    return counts.map((count, i) => ({
      count,
      heightPct: maxCount > 0 ? (count / maxCount) * 100 : 0,
      rangeStart: min + i * width,
      positive: min + i * width >= 0,
    }))
  }, [result])

  return (
    <div className="flex items-end gap-1 h-28">
      {bins.map((b, i) => (
        <div key={i} className="flex-1 group relative flex flex-col justify-end h-full">
          <div
            className={`w-full rounded-sm transition-all ${b.positive ? 'bg-gain/60 group-hover:bg-gain' : 'bg-loss/60 group-hover:bg-loss'}`}
            style={{ height: `${Math.max(2, b.heightPct)}%` }}
          />
          <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition text-[10px] font-mono bg-base-card border border-base-border px-1.5 py-0.5 rounded whitespace-nowrap">
            {b.rangeStart.toFixed(1)}% · {b.count} runs
          </div>
        </div>
      ))}
    </div>
  )
}
