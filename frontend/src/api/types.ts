export type IndicatorType = "SMA" | "EMA" | "RSI";
export type ConditionType = "CROSSOVER_ABOVE" | "CROSSOVER_BELOW" | "ABOVE_THRESHOLD" | "BELOW_THRESHOLD";

export interface IndicatorConfig { id: string; type: IndicatorType; period: number; }
export interface ConditionConfig { type: ConditionType; a: string; b?: string; threshold?: number; }
export interface RiskRules { stopLossPercent: number; takeProfitPercent: number; positionSizePercent: number; }
export interface StrategyDefinition { name: string; indicators: IndicatorConfig[]; entryCondition: ConditionConfig; exitCondition: ConditionConfig; riskRules: RiskRules; }
export interface BacktestPayload { ticker: string; startDate: string; endDate: string; strategy: StrategyDefinition; strategyId?: number; }
export interface TradeRecord { entryDate: string; exitDate: string; entryPrice: number; exitPrice: number; quantity: number; pnl: number; }
export interface BacktestResult { trades: TradeRecord[]; equityCurve: number[]; metrics: { totalTrades: number; winRate: number; totalReturn: number; maxDrawdown: number; sharpeRatio: number }; }
export interface SweepResult { parameters: Record<string, number>; result: BacktestResult; durationMs: number; }

export const DEFAULT_STRATEGY: BacktestPayload = {
  ticker: "AAPL", startDate: "2020-01-01", endDate: "2024-01-01",
  strategy: {
    name: "SMA Crossover",
    indicators: [
      { id: "smaShort", type: "SMA", period: 10 },
      { id: "smaLong", type: "SMA", period: 50 },
    ],
    entryCondition: { type: "CROSSOVER_ABOVE", a: "smaShort", b: "smaLong" },
    exitCondition: { type: "CROSSOVER_BELOW", a: "smaShort", b: "smaLong" },
    riskRules: { stopLossPercent: 5, takeProfitPercent: 10, positionSizePercent: 100 },
  },
};
