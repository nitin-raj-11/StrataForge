import type { ConditionConfig, ConditionType, IndicatorConfig } from '../../api/types'

const CONDITION_TYPES: { value: ConditionType; label: string }[] = [
  { value: 'CROSSOVER_ABOVE', label: 'crosses above' },
  { value: 'CROSSOVER_BELOW', label: 'crosses below' },
  { value: 'GREATER_THAN', label: 'is greater than' },
  { value: 'LESS_THAN', label: 'is less than' },
]

function isThreshold(type: ConditionType) {
  return type === 'GREATER_THAN' || type === 'LESS_THAN'
}

export default function ConditionRow({
  label,
  condition,
  indicators,
  onChange,
  error,
}: {
  label: string
  condition: ConditionConfig
  indicators: IndicatorConfig[]
  onChange: (next: ConditionConfig) => void
  error?: string
}) {
  const threshold = isThreshold(condition.type)

  return (
    <div>
      <span className="text-[13px] font-medium text-ink-muted mb-1.5 block">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="input-base w-auto min-w-[110px]"
          value={condition.a}
          onChange={(e) => onChange({ ...condition, a: e.target.value })}
        >
          {indicators.map((ind) => (
            <option key={ind.id} value={ind.id}>
              {ind.id}
            </option>
          ))}
        </select>

        <select
          className="input-base w-auto min-w-[150px] text-ink-muted"
          value={condition.type}
          onChange={(e) => {
            const nextType = e.target.value as ConditionType
            const nextIsThreshold = isThreshold(nextType)
            onChange({
              ...condition,
              type: nextType,
              b: nextIsThreshold
                ? typeof condition.b === 'number'
                  ? condition.b
                  : 0
                : indicators.find((i) => i.id !== condition.a)?.id ?? '',
            })
          }}
        >
          {CONDITION_TYPES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        {threshold ? (
          <input
            type="number"
            className="input-base w-24"
            value={typeof condition.b === 'number' ? condition.b : 0}
            onChange={(e) => onChange({ ...condition, b: Number(e.target.value) })}
          />
        ) : (
          <select
            className="input-base w-auto min-w-[110px]"
            value={typeof condition.b === 'string' ? condition.b : ''}
            onChange={(e) => onChange({ ...condition, b: e.target.value })}
          >
            {indicators.map((ind) => (
              <option key={ind.id} value={ind.id}>
                {ind.id}
              </option>
            ))}
          </select>
        )}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
