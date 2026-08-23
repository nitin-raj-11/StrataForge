import type { BacktestMetrics } from '../../api/types'
import { formatPercent, gainLossClass } from '../../lib/format'

export default function MetricsCards({ metrics }: { metrics: BacktestMetrics }) {
  const cards = [
    { label: 'Total return', value: formatPercent(metrics.totalReturn), tone: gainLossClass(metrics.totalReturn) },
    { label: 'Max drawdown', value: formatPercent(metrics.maxDrawdown), tone: gainLossClass(metrics.maxDrawdown) },
    {
      label: 'Sharpe ratio',
      value: metrics.sharpeRatio.toFixed(2),
      tone: gainLossClass(metrics.sharpeRatio),
    },
    { label: 'Win rate', value: `${metrics.winRate.toFixed(1)}%`, tone: 'text-ink-primary' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      {cards.map((c) => (
        <div key={c.label} className="panel p-4">
          <p className="label-eyebrow mb-2">{c.label}</p>
          <p className={`mono-num text-2xl font-semibold ${c.tone}`}>{c.value}</p>
        </div>
      ))}
      <div className="col-span-2 sm:col-span-4 text-[12px] text-ink-faint">
        {metrics.totalTrades} total trade{metrics.totalTrades === 1 ? '' : 's'}
      </div>
    </div>
  )
}
