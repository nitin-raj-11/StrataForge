import type { IndicatorConfig, IndicatorType } from '../../api/types'
import type { ParameterRange } from '../../api/types'

const INDICATOR_TYPES: IndicatorType[] = ['SMA', 'EMA', 'RSI']

interface Props {
  indicator: IndicatorConfig
  onChange: (next: IndicatorConfig) => void
  onRemove: () => void
  canRemove: boolean
  error?: string
  sweepMode: boolean
  sweepRange: ParameterRange
  onSweepRangeChange: (next: ParameterRange) => void
}

export default function IndicatorRow({
  indicator,
  onChange,
  onRemove,
  canRemove,
  error,
  sweepMode,
  sweepRange,
  onSweepRangeChange,
}: Props) {
  return (
    <div className="rounded-lg border border-base-border bg-base-panel p-3.5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-28">
          <span className="text-[11px] text-ink-faint block mb-1">ID</span>
          <input
            className="input-base font-mono text-[13px]"
            value={indicator.id}
            onChange={(e) => onChange({ ...indicator, id: e.target.value.replace(/\s/g, '') })}
          />
        </div>

        <div className="w-32">
          <span className="text-[11px] text-ink-faint block mb-1">Type</span>
          <select
            className="input-base"
            value={indicator.type}
            onChange={(e) => onChange({ ...indicator, type: e.target.value as IndicatorType })}
          >
            {INDICATOR_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {!sweepMode ? (
          <div className="w-28">
            <span className="text-[11px] text-ink-faint block mb-1">Period</span>
            <input
              type="number"
              min={1}
              className="input-base"
              value={indicator.period}
              onChange={(e) => onChange({ ...indicator, period: Number(e.target.value) })}
            />
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <div className="w-20">
              <span className="text-[11px] text-ink-faint block mb-1">Min</span>
              <input
                type="number"
                min={1}
                className="input-base"
                value={sweepRange.min}
                onChange={(e) => onSweepRangeChange({ ...sweepRange, min: Number(e.target.value) })}
              />
            </div>
            <div className="w-20">
              <span className="text-[11px] text-ink-faint block mb-1">Max</span>
              <input
                type="number"
                min={1}
                className="input-base"
                value={sweepRange.max}
                onChange={(e) => onSweepRangeChange({ ...sweepRange, max: Number(e.target.value) })}
              />
            </div>
            <div className="w-20">
              <span className="text-[11px] text-ink-faint block mb-1">Step</span>
              <input
                type="number"
                min={1}
                className="input-base"
                value={sweepRange.step}
                onChange={(e) => onSweepRangeChange({ ...sweepRange, step: Number(e.target.value) })}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="ml-auto text-[12px] text-ink-faint hover:text-loss disabled:opacity-30 disabled:hover:text-ink-faint transition px-2 py-1.5"
        >
          Remove
        </button>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
