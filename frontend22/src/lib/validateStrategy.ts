import type { StrategyDefinition } from '../api/types'

export interface ValidationErrors {
  name?: string
  indicators?: Record<string, string> // keyed by indicator id
  entryCondition?: string
  exitCondition?: string
  riskRules?: Partial<Record<keyof StrategyDefinition['riskRules'], string>>
}

export function validateStrategy(strategy: StrategyDefinition): ValidationErrors {
  const errors: ValidationErrors = {}

  if (!strategy.name || !strategy.name.trim()) {
    errors.name = 'Give the strategy a name.'
  }

  const indicatorErrors: Record<string, string> = {}
  const ids = new Set(strategy.indicators.map((i) => i.id))

  if (strategy.indicators.length === 0) {
    indicatorErrors['_'] = 'Add at least one indicator.'
  }

  for (const ind of strategy.indicators) {
    if (!Number.isFinite(ind.period) || ind.period <= 0 || !Number.isInteger(ind.period)) {
      indicatorErrors[ind.id] = 'Period must be a positive whole number.'
    }
  }
  if (Object.keys(indicatorErrors).length > 0) errors.indicators = indicatorErrors

  const checkCondition = (
    cond: StrategyDefinition['entryCondition'],
    label: string
  ): string | undefined => {
    if (!cond.a || !ids.has(cond.a)) {
      return `${label}: operand A must reference an indicator defined above.`
    }
    const isThreshold = cond.type === 'GREATER_THAN' || cond.type === 'LESS_THAN'
    if (isThreshold) {
      if (typeof cond.b !== 'number' || Number.isNaN(cond.b)) {
        return `${label}: enter a numeric threshold for operand B.`
      }
    } else {
      if (typeof cond.b !== 'string' || !ids.has(cond.b)) {
        return `${label}: operand B must reference an indicator defined above.`
      }
      if (cond.a === cond.b) {
        return `${label}: operand A and B must be different indicators.`
      }
    }
    return undefined
  }

  const entryErr = checkCondition(strategy.entryCondition, 'Entry condition')
  if (entryErr) errors.entryCondition = entryErr

  const exitErr = checkCondition(strategy.exitCondition, 'Exit condition')
  if (exitErr) errors.exitCondition = exitErr

  const riskErrors: Partial<Record<keyof StrategyDefinition['riskRules'], string>> = {}
  const rr = strategy.riskRules
  ;(['stopLossPercent', 'takeProfitPercent', 'positionSizePercent'] as const).forEach((key) => {
    const v = rr[key]
    if (!Number.isFinite(v) || v < 0 || v > 100) {
      riskErrors[key] = 'Must be between 0 and 100.'
    }
  })
  if (Object.keys(riskErrors).length > 0) errors.riskRules = riskErrors

  return errors
}

export function isValid(errors: ValidationErrors): boolean {
  return (
    !errors.name &&
    !errors.indicators &&
    !errors.entryCondition &&
    !errors.exitCondition &&
    !errors.riskRules
  )
}
