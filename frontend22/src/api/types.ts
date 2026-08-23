// Shared types matching the StrataForge API contract agreed with the backend team.
// Keep these in sync with the "API Contract" doc — this file is the single source
// of truth on the frontend for every shape sent to / received from the backend.

export type IndicatorType = 'SMA' | 'EMA' | 'RSI'

export interface IndicatorConfig {
  id: string
  type: IndicatorType
  period: number
}

export type ConditionType =
  | 'CROSSOVER_ABOVE'
  | 'CROSSOVER_BELOW'
  | 'GREATER_THAN'
  | 'LESS_THAN'

export interface ConditionConfig {
  type: ConditionType
  a: string // always an indicator id
  b: string | number // indicator id for crossovers, numeric threshold for GREATER_THAN/LESS_THAN
}

export interface RiskRules {
  stopLossPercent: number
  takeProfitPercent: number
  positionSizePercent: number
}

export interface StrategyDefinition {
  name: string
  indicators: IndicatorConfig[]
  entryCondition: ConditionConfig
  exitCondition: ConditionConfig
  riskRules: RiskRules
}

export interface BacktestRunRequest {
  strategy: StrategyDefinition
  ticker: string
  startDate: string // ISO yyyy-mm-dd
  endDate: string
}

export interface Trade {
  entryDate: string
  exitDate: string
  entryPrice: number
  exitPrice: number
  pnl: number
  pnlPercent: number
}

export interface CurvePoint {
  time: string
  value: number
}

export interface BacktestMetrics {
  totalReturn: number
  maxDrawdown: number
  sharpeRatio: number
  winRate: number
  totalTrades: number
}

export interface BacktestResult {
  id: string
  trades: Trade[]
  equityCurve: CurvePoint[]
  drawdownCurve: CurvePoint[]
  metrics: BacktestMetrics
  /** Echoes the request that produced this result — lets the UI offer
   * "edit & rerun", show a strategy summary, and export the exact DSL used.
   * Optional so the app degrades gracefully if a backend build omits it. */
  request?: BacktestRunRequest
  createdAt?: string
}

export interface ParameterRange {
  min: number
  max: number
  step: number
}

export type RankByMetric = 'sharpeRatio' | 'totalReturn' | 'winRate'

export interface SweepRequest {
  strategyTemplate: StrategyDefinition
  parameterRanges: Record<string, ParameterRange>
  ticker: string
  startDate: string
  endDate: string
  rankBy: RankByMetric
}

export interface SweepResultRow {
  runId: string
  parameters: Record<string, number>
  totalReturn: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
}

export interface SweepResult {
  id: string
  results: SweepResultRow[]
  rankBy: RankByMetric
  timing?: {
    sequentialMs: number
    parallelMs: number
    cores: number
  }
  request?: SweepRequest
  createdAt?: string
}
