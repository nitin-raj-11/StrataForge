import { useEffect, useState, Suspense, lazy } from 'react'
import { useNavigate } from 'react-router-dom'
import type {
  StrategyDefinition,
  IndicatorConfig,
  ParameterRange,
  RankByMetric,
} from '../../api/types'
import { TICKERS } from '../../data/tickers'
import { STRATEGY_PRESETS } from '../../data/presets'
import { runBacktest, runSweep } from '../../api/backtests'
import { validateStrategy, isValid, type ValidationErrors } from '../../lib/validateStrategy'
import { consumePrefill } from '../../lib/prefill'
import { FormField, SectionCard } from './FormField'
import IndicatorRow from './IndicatorRow'
import ConditionRow from './ConditionRow'
import RiskRulesForm from './RiskRulesForm'
// Monaco is ~300kB alone — only load it once the user actually opens the JSON tab.
const DslEditor = lazy(() => import('./DslEditor'))

function defaultStrategy(): StrategyDefinition {
  return {
    name: 'SMA Crossover',
    indicators: [
      { id: 'smaShort', type: 'SMA', period: 10 },
      { id: 'smaLong', type: 'SMA', period: 50 },
    ],
    entryCondition: { type: 'CROSSOVER_ABOVE', a: 'smaShort', b: 'smaLong' },
    exitCondition: { type: 'CROSSOVER_BELOW', a: 'smaShort', b: 'smaLong' },
    riskRules: { stopLossPercent: 5, takeProfitPercent: 10, positionSizePercent: 100 },
  }
}

function defaultRangeFor(period: number): ParameterRange {
  return { min: Math.max(1, period - 5), max: period + 20, step: 5 }
}

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

let indicatorIdSeq = 0

export default function StrategyForm() {
  const navigate = useNavigate()

  const [strategy, setStrategy] = useState<StrategyDefinition>(defaultStrategy)
  const [ticker, setTicker] = useState('AAPL')
  const [startDate, setStartDate] = useState(isoDaysAgo(365 * 4))
  const [endDate, setEndDate] = useState(isoDaysAgo(0))
  const [viewMode, setViewMode] = useState<'form' | 'json'>('form')
  const [sweepMode, setSweepMode] = useState(false)
  const [rankBy, setRankBy] = useState<RankByMetric>('sharpeRatio')
  const [sweepRanges, setSweepRanges] = useState<Record<string, ParameterRange>>(() => ({
    smaShort: defaultRangeFor(10),
    smaLong: defaultRangeFor(50),
  }))

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [sweepRangeError, setSweepRangeError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [prefillBanner, setPrefillBanner] = useState(false)

  // If Results/History sent a strategy back here via "Edit & rerun", load it once.
  useEffect(() => {
    const pf = consumePrefill()
    if (!pf) return
    setStrategy(pf.strategy)
    setTicker(pf.ticker)
    setStartDate(pf.startDate)
    setEndDate(pf.endDate)
    setSweepRanges((r) => {
      const next = { ...r }
      for (const ind of pf.strategy.indicators) {
        if (!next[ind.id]) next[ind.id] = defaultRangeFor(ind.period)
      }
      return next
    })
    setPrefillBanner(true)
  }, [])

  function applyPreset(id: string) {
    const preset = STRATEGY_PRESETS.find((p) => p.id === id)
    if (!preset) return
    setStrategy(preset.strategy)
    setSweepRanges(
      Object.fromEntries(preset.strategy.indicators.map((ind) => [ind.id, defaultRangeFor(ind.period)]))
    )
    setErrors({})
  }

  function updateIndicator(index: number, next: IndicatorConfig) {
    const prevId = strategy.indicators[index].id
    setStrategy((s) => {
      const indicators = s.indicators.map((ind, i) => (i === index ? next : ind))
      const rename = (v: string) => (v === prevId ? next.id : v)
      return {
        ...s,
        indicators,
        entryCondition: {
          ...s.entryCondition,
          a: rename(s.entryCondition.a),
          b: typeof s.entryCondition.b === 'string' ? rename(s.entryCondition.b) : s.entryCondition.b,
        },
        exitCondition: {
          ...s.exitCondition,
          a: rename(s.exitCondition.a),
          b: typeof s.exitCondition.b === 'string' ? rename(s.exitCondition.b) : s.exitCondition.b,
        },
      }
    })
    if (prevId !== next.id) {
      setSweepRanges((r) => {
        const { [prevId]: existing, ...rest } = r
        return { ...rest, [next.id]: existing ?? defaultRangeFor(next.period) }
      })
    }
  }

  function addIndicator() {
    indicatorIdSeq += 1
    const id = `indicator${indicatorIdSeq}`
    const next: IndicatorConfig = { id, type: 'SMA', period: 20 }
    setStrategy((s) => ({ ...s, indicators: [...s.indicators, next] }))
    setSweepRanges((r) => ({ ...r, [id]: defaultRangeFor(20) }))
  }

  function removeIndicator(index: number) {
    const id = strategy.indicators[index].id
    setStrategy((s) => ({ ...s, indicators: s.indicators.filter((_, i) => i !== index) }))
    setSweepRanges((r) => {
      const { [id]: _drop, ...rest } = r
      return rest
    })
  }

  function toggleSweepMode() {
    setSweepMode((on) => {
      if (!on) {
        // turning sweep mode ON — seed any indicators missing a range
        setSweepRanges((r) => {
          const next = { ...r }
          for (const ind of strategy.indicators) {
            if (!next[ind.id]) next[ind.id] = defaultRangeFor(ind.period)
          }
          return next
        })
      }
      return !on
    })
  }

  function validateSweepRanges(): boolean {
    for (const ind of strategy.indicators) {
      const range = sweepRanges[ind.id]
      if (!range || range.min <= 0 || range.step <= 0 || range.min > range.max) {
        setSweepRangeError(
          `Check the sweep range for "${ind.id}" — min must be ≤ max, and step must be positive.`
        )
        return false
      }
    }
    setSweepRangeError(null)
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validation = validateStrategy(strategy)
    setErrors(validation)
    if (!isValid(validation)) return
    if (sweepMode && !validateSweepRanges()) return

    setSubmitting(true)
    setApiError(null)
    try {
      if (sweepMode) {
        const result = await runSweep({
          strategyTemplate: strategy,
          parameterRanges: sweepRanges,
          ticker,
          startDate,
          endDate,
          rankBy,
        })
        navigate(`/sweeps/${result.id}`)
      } else {
        const result = await runBacktest({ strategy, ticker, startDate, endDate })
        navigate(`/results/${result.id}`)
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong running the backtest.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        document.getElementById('strategy-submit-btn')?.dispatchEvent(
          new MouseEvent('click', { bubbles: true })
        )
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {prefillBanner && (
        <div className="panel border-accent-amberDim/50 bg-accent-amber/[0.06] p-3.5 text-[13px] text-ink-muted flex items-center justify-between gap-3">
          <span>Loaded from a previous result — adjust and rerun whenever you're ready.</span>
          <button type="button" onClick={() => setPrefillBanner(false)} className="text-ink-faint hover:text-ink-primary text-lg leading-none">
            ×
          </button>
        </div>
      )}

      <SectionCard title="Quick start" eyebrow="Optional">
        <div className="flex flex-wrap gap-2.5">
          {STRATEGY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              title={preset.blurb}
              className="btn-secondary text-[13px] py-2"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Strategy"
        eyebrow="Step 1"
        action={
          <div className="inline-flex rounded-lg border border-base-border p-0.5 bg-base-panel">
            <button
              type="button"
              onClick={() => setViewMode('form')}
              className={`px-3 py-1.5 text-[13px] rounded-md transition ${
                viewMode === 'form' ? 'bg-accent-amber text-base-bg font-medium' : 'text-ink-muted'
              }`}
            >
              Form
            </button>
            <button
              type="button"
              onClick={() => setViewMode('json')}
              className={`px-3 py-1.5 text-[13px] rounded-md transition ${
                viewMode === 'json' ? 'bg-accent-amber text-base-bg font-medium' : 'text-ink-muted'
              }`}
            >
              Raw JSON
            </button>
          </div>
        }
      >
        {viewMode === 'json' ? (
          <Suspense
            fallback={
              <div className="h-[360px] rounded-lg border border-base-border bg-base-panel flex items-center justify-center text-ink-faint text-[13px] font-mono">
                Loading editor…
              </div>
            }
          >
            <DslEditor value={strategy} onChange={setStrategy} />
          </Suspense>
        ) : (
          <div className="space-y-6">
            <FormField label="Strategy name" error={errors.name}>
              <input
                className="input-base"
                value={strategy.name}
                onChange={(e) => setStrategy({ ...strategy, name: e.target.value })}
                placeholder="e.g. SMA Crossover"
              />
            </FormField>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-medium text-ink-muted">
                  Indicators {sweepMode && <span className="text-ink-faint">(min / max / step)</span>}
                </span>
                <button type="button" onClick={addIndicator} className="text-[13px] text-accent-amber hover:brightness-110">
                  + Add indicator
                </button>
              </div>
              <div className="space-y-2.5">
                {strategy.indicators.map((ind, i) => (
                  <IndicatorRow
                    key={i}
                    indicator={ind}
                    onChange={(next) => updateIndicator(i, next)}
                    onRemove={() => removeIndicator(i)}
                    canRemove={strategy.indicators.length > 1}
                    error={errors.indicators?.[ind.id] ?? errors.indicators?.['_']}
                    sweepMode={sweepMode}
                    sweepRange={sweepRanges[ind.id] ?? defaultRangeFor(ind.period)}
                    onSweepRangeChange={(next) =>
                      setSweepRanges((r) => ({ ...r, [ind.id]: next }))
                    }
                  />
                ))}
              </div>
              {sweepMode && sweepRangeError && <p className="field-error">{sweepRangeError}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <ConditionRow
                label="Entry condition"
                condition={strategy.entryCondition}
                indicators={strategy.indicators}
                onChange={(next) => setStrategy({ ...strategy, entryCondition: next })}
                error={errors.entryCondition}
              />
              <ConditionRow
                label="Exit condition"
                condition={strategy.exitCondition}
                indicators={strategy.indicators}
                onChange={(next) => setStrategy({ ...strategy, exitCondition: next })}
                error={errors.exitCondition}
              />
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Market & date range" eyebrow="Step 2">
        <div className="grid sm:grid-cols-3 gap-4">
          <FormField label="Ticker">
            <input
              className="input-base font-mono"
              list="ticker-options"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
            />
            <datalist id="ticker-options">
              {TICKERS.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </FormField>
          <FormField label="Start date">
            <input
              type="date"
              className="input-base"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FormField>
          <FormField label="End date">
            <input
              type="date"
              className="input-base"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Risk rules" eyebrow="Step 3">
        <RiskRulesForm
          riskRules={strategy.riskRules}
          onChange={(next) => setStrategy({ ...strategy, riskRules: next })}
          errors={errors.riskRules}
        />
      </SectionCard>

      <SectionCard
        title="Parameter sweep"
        eyebrow="Step 4 (optional)"
        action={
          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
            <span className="text-[13px] text-ink-muted">Sweep mode</span>
            <span
              onClick={toggleSweepMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                sweepMode ? 'bg-accent-amber' : 'bg-base-border'
              }`}
            >
              <span
                className={`inline-block h-4.5 w-4.5 transform rounded-full bg-base-bg transition ${
                  sweepMode ? 'translate-x-6' : 'translate-x-1'
                }`}
                style={{ height: 18, width: 18 }}
              />
            </span>
          </label>
        }
      >
        {sweepMode ? (
          <FormField
            label="Rank results by"
            hint="Sweep will grid-search every indicator's min/max/step range above and rank combinations by this metric."
          >
            <select
              className="input-base w-auto min-w-[180px]"
              value={rankBy}
              onChange={(e) => setRankBy(e.target.value as RankByMetric)}
            >
              <option value="sharpeRatio">Sharpe ratio</option>
              <option value="totalReturn">Total return</option>
              <option value="winRate">Win rate</option>
            </select>
          </FormField>
        ) : (
          <p className="text-[13px] text-ink-faint">
            Turn this on to grid-search a range of periods for each indicator instead of running a
            single backtest — set min/max/step per indicator above.
          </p>
        )}
      </SectionCard>

      {apiError && (
        <div className="panel border-loss/40 bg-loss/[0.06] p-4 text-[13px] text-loss">{apiError}</div>
      )}

      <div className="flex items-center justify-end gap-3 pt-1">
        <span className="text-[11px] text-ink-faint font-mono hidden sm:inline">⌘/Ctrl + Enter</span>
        <button id="strategy-submit-btn" type="submit" disabled={submitting} className="btn-primary min-w-[160px]">
          {submitting ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-base-bg/40 border-t-base-bg animate-spin" />
              Running…
            </>
          ) : sweepMode ? (
            'Run parameter sweep'
          ) : (
            'Run backtest'
          )}
        </button>
      </div>
    </form>
  )
}
