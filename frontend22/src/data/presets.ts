import type { StrategyDefinition } from '../api/types'

export interface StrategyPreset {
  id: string
  label: string
  blurb: string
  strategy: StrategyDefinition
}

export const STRATEGY_PRESETS: StrategyPreset[] = [
  {
    id: 'sma-crossover',
    label: 'SMA Crossover',
    blurb: 'Classic trend-following: fast SMA crosses above/below a slow SMA.',
    strategy: {
      name: 'SMA Crossover',
      indicators: [
        { id: 'smaShort', type: 'SMA', period: 10 },
        { id: 'smaLong', type: 'SMA', period: 50 },
      ],
      entryCondition: { type: 'CROSSOVER_ABOVE', a: 'smaShort', b: 'smaLong' },
      exitCondition: { type: 'CROSSOVER_BELOW', a: 'smaShort', b: 'smaLong' },
      riskRules: { stopLossPercent: 5, takeProfitPercent: 10, positionSizePercent: 100 },
    },
  },
  {
    id: 'ema-trend',
    label: 'EMA Trend Ride',
    blurb: 'Faster-reacting EMA crossover, tighter stop, lets winners run.',
    strategy: {
      name: 'EMA Trend Ride',
      indicators: [
        { id: 'emaFast', type: 'EMA', period: 12 },
        { id: 'emaSlow', type: 'EMA', period: 26 },
      ],
      entryCondition: { type: 'CROSSOVER_ABOVE', a: 'emaFast', b: 'emaSlow' },
      exitCondition: { type: 'CROSSOVER_BELOW', a: 'emaFast', b: 'emaSlow' },
      riskRules: { stopLossPercent: 4, takeProfitPercent: 18, positionSizePercent: 80 },
    },
  },
  {
    id: 'rsi-mean-reversion',
    label: 'RSI Mean Reversion',
    blurb: 'Buys oversold conditions, exits once momentum recovers.',
    strategy: {
      name: 'RSI Mean Reversion',
      indicators: [{ id: 'rsi14', type: 'RSI', period: 14 }],
      entryCondition: { type: 'LESS_THAN', a: 'rsi14', b: 30 },
      exitCondition: { type: 'GREATER_THAN', a: 'rsi14', b: 55 },
      riskRules: { stopLossPercent: 6, takeProfitPercent: 12, positionSizePercent: 60 },
    },
  },
]
