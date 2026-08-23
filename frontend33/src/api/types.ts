export interface Indicator {
  id: string;
  type: 'SMA' | 'EMA' | 'RSI';
  period: number;
}

export interface Condition {
  type: 'CROSSOVER_ABOVE' | 'CROSSOVER_BELOW' | 'GREATER_THAN' | 'LESS_THAN';
  a: string;
  b: string | number;
}

export interface RiskRules {
  stopLossPercent: number;
  takeProfitPercent: number;
  positionSizePercent: number;
}

export interface StrategyDefinition {
  name: string;
  indicators: Indicator[];
  entryCondition: Condition;
  exitCondition: Condition;
  riskRules: RiskRules;
}

export interface Trade {
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface DataPoint {
  time: string;
  value: number;
}

export interface Metrics {
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  totalTrades: number;
}

export interface BacktestRequest {
  strategy: StrategyDefinition;
  ticker: string;
  startDate: string;
  endDate: string;
}

export interface BacktestResult {
  id: string;
  trades: Trade[];
  equityCurve: DataPoint[];
  drawdownCurve: DataPoint[];
  metrics: Metrics;
}

export interface ParameterRange {
  min: number;
  max: number;
  step: number;
}

export interface SweepRequest {
  strategyTemplate: StrategyDefinition;
  parameterRanges: Record<string, ParameterRange>;
  ticker: string;
  startDate: string;
  endDate: string;
  rankBy: 'sharpeRatio' | 'totalReturn' | 'winRate';
}

export interface SweepResultRow {
  runId: string;
  parameters: Record<string, number>;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
}

export interface SweepResult {
  id: string;
  results: SweepResultRow[];
}
