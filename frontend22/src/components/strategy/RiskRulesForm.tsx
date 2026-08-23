import type { RiskRules } from '../../api/types'

const FIELDS: { key: keyof RiskRules; label: string; hint: string }[] = [
  { key: 'stopLossPercent', label: 'Stop-loss %', hint: 'Exit automatically if a position falls this much.' },
  { key: 'takeProfitPercent', label: 'Take-profit %', hint: 'Exit automatically once a position gains this much.' },
  { key: 'positionSizePercent', label: 'Position size %', hint: 'Portion of available cash used per trade.' },
]

export default function RiskRulesForm({
  riskRules,
  onChange,
  errors,
}: {
  riskRules: RiskRules
  onChange: (next: RiskRules) => void
  errors?: Partial<Record<keyof RiskRules, string>>
}) {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {FIELDS.map(({ key, label, hint }) => (
        <div key={key}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] font-medium text-ink-muted">{label}</span>
            <span className="mono-num text-[13px] text-accent-amber">{riskRules[key]}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={riskRules[key]}
            onChange={(e) => onChange({ ...riskRules, [key]: Number(e.target.value) })}
            className="w-full accent-accent-amber"
          />
          <p className="text-[12px] text-ink-faint mt-1">{hint}</p>
          {errors?.[key] && <p className="field-error">{errors[key]}</p>}
        </div>
      ))}
    </div>
  )
}
