import type {
  BacktestRunRequest,
  BacktestResult,
  SweepRequest,
  SweepResult,
  SweepResultRow,
  Trade,
  CurvePoint,
  StrategyDefinition,
} from './types'
import { readJSON, writeJSON } from '../lib/storage'

// ---------------------------------------------------------------------------
// StrataForge mock backend.
//
// This mirrors the real /api/backtests/run and /api/backtests/sweep contract
// exactly (same request/response shapes), so the app is fully demoable before
// the real Spring Boot backend exists, and swapping to it later requires no
// component changes — only VITE_USE_MOCK_API=false in .env.
// ---------------------------------------------------------------------------

// --- deterministic seeded RNG -----------------------------------------------

function hashString(str: string): number {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// --- persisted stores --------------------------------------------------------
//
// Every result also lives in-memory for the tab's lifetime, and "primary"
// results (ones a user directly submitted from /build, as opposed to the
// many child runs generated inside a sweep) are additionally persisted to
// localStorage so /results/:id and /sweeps/:id survive a page refresh — a
// real backend would of course persist server-side instead. Sweep child runs
// are intentionally kept in-memory only, since a 200-combination sweep would
// otherwise blow past localStorage's ~5MB quota.

const RUNS_KEY = 'strataforge.mock.runs.v1'
const SWEEPS_KEY = 'strataforge.mock.sweeps.v1'
const MAX_PERSISTED_RUNS = 25
const MAX_PERSISTED_SWEEPS = 15

const backtestStore = new Map<string, BacktestResult>(
  Object.entries(readJSON<Record<string, BacktestResult>>(RUNS_KEY, {}))
)
const sweepStore = new Map<string, SweepResult>(
  Object.entries(readJSON<Record<string, SweepResult>>(SWEEPS_KEY, {}))
)

function persistRun(result: BacktestResult) {
  const all = readJSON<Record<string, BacktestResult>>(RUNS_KEY, {})
  all[result.id] = result
  const ids = Object.keys(all)
  if (ids.length > MAX_PERSISTED_RUNS) {
    const oldest = ids
      .sort((a, b) => (all[a].createdAt ?? '').localeCompare(all[b].createdAt ?? ''))
      .slice(0, ids.length - MAX_PERSISTED_RUNS)
    for (const id of oldest) delete all[id]
  }
  writeJSON(RUNS_KEY, all)
}

function persistSweep(result: SweepResult) {
  const all = readJSON<Record<string, SweepResult>>(SWEEPS_KEY, {})
  all[result.id] = result
  const ids = Object.keys(all)
  if (ids.length > MAX_PERSISTED_SWEEPS) {
    const oldest = ids
      .sort((a, b) => (all[a].createdAt ?? '').localeCompare(all[b].createdAt ?? ''))
      .slice(0, ids.length - MAX_PERSISTED_SWEEPS)
    for (const id of oldest) delete all[id]
  }
  writeJSON(SWEEPS_KEY, all)
}

let idCounter = 0
function nextId(prefix: string): string {
  idCounter += 1
  return `${prefix}_${Date.now().toString(36)}${idCounter.toString(36)}`
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// --- trading-day calendar ----------------------------------------------------

function tradingDays(start: string, end: string): Date[] {
  const days: Date[] = []
  const cur = new Date(start + 'T00:00:00Z')
  const endDate = new Date(end + 'T00:00:00Z')
  while (cur <= endDate) {
    const dow = cur.getUTCDay()
    if (dow !== 0 && dow !== 6) days.push(new Date(cur))
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return days
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// --- core fake-backtest generator -------------------------------------------

interface GeneratedBacktest {
  trades: Trade[]
  equityCurve: CurvePoint[]
  drawdownCurve: CurvePoint[]
  metrics: BacktestResult['metrics']
}

function generateBacktest(
  strategy: StrategyDefinition,
  ticker: string,
  startDate: string,
  endDate: string,
  seedSuffix = ''
): GeneratedBacktest {
  const seed = hashString(
    `${ticker}|${strategy.name}|${startDate}|${endDate}|${JSON.stringify(
      strategy.indicators
    )}|${seedSuffix}`
  )
  const rng = mulberry32(seed)

  const days = tradingDays(startDate, endDate)
  const n = Math.max(days.length, 10)

  const stopLoss = strategy.riskRules?.stopLossPercent ?? 5
  const takeProfit = strategy.riskRules?.takeProfitPercent ?? 10
  const positionSize = strategy.riskRules?.positionSizePercent ?? 100

  // Decide trade windows across the timeline first, then build the equity
  // curve to actually reflect those trades — so charts, trade log, and
  // metrics are all internally consistent with each other.
  const targetTradeCount = Math.min(40, Math.max(12, Math.round(n / 18)))
  const trades: Trade[] = []
  const tradeWindows: { startIdx: number; endIdx: number; pnlPercent: number }[] = []

  let cursor = Math.floor(rng() * 6) + 2
  const basePrice = 40 + rng() * 380

  while (cursor < n - 3 && tradeWindows.length < targetTradeCount) {
    const holdDays = 3 + Math.floor(rng() * 22)
    const endIdx = Math.min(cursor + holdDays, n - 1)

    // Skew slightly positive so the demo strategy looks plausible, then
    // clip to the strategy's own risk rules — a trade can never show a loss
    // deeper than stopLossPercent or a gain beyond takeProfitPercent.
    const raw = (rng() - 0.42) * (takeProfit + stopLoss) * 0.9
    const pnlPercent = Math.max(-stopLoss, Math.min(takeProfit, raw))

    tradeWindows.push({ startIdx: cursor, endIdx, pnlPercent })

    const gapDays = 2 + Math.floor(rng() * 10)
    cursor = endIdx + gapDays
  }

  // Build equity curve day by day, applying trade P&L proportionally to the
  // days the position is held, flat (with tiny noise) when out of position.
  let cash = 10000
  const equityCurve: CurvePoint[] = []
  let activeWindowIdx = 0
  let entryCash = cash

  for (let i = 0; i < n; i++) {
    const window = tradeWindows[activeWindowIdx]
    if (window && i === window.startIdx) {
      entryCash = cash
    }

    if (window && i >= window.startIdx && i <= window.endIdx) {
      const progress = (i - window.startIdx) / Math.max(1, window.endIdx - window.startIdx)
      const posValue = entryCash * (positionSize / 100)
      const flatValue = entryCash * (1 - positionSize / 100)
      const tradeGain = posValue * (window.pnlPercent / 100) * progress
      cash = flatValue + posValue + tradeGain

      if (i === window.endIdx) {
        const entryPrice = Number((basePrice * (0.85 + rng() * 0.3)).toFixed(2))
        const exitPrice = Number((entryPrice * (1 + window.pnlPercent / 100)).toFixed(2))
        const pnl = Number((entryCash * (positionSize / 100) * (window.pnlPercent / 100)).toFixed(2))
        trades.push({
          entryDate: fmt(days[window.startIdx]),
          exitDate: fmt(days[window.endIdx]),
          entryPrice,
          exitPrice,
          pnl,
          pnlPercent: Number(window.pnlPercent.toFixed(2)),
        })
        activeWindowIdx += 1
      }
    } else {
      // small daily noise while flat, so the line isn't dead straight
      cash = cash * (1 + (rng() - 0.5) * 0.0015)
    }

    equityCurve.push({ time: fmt(days[i]), value: Number(cash.toFixed(2)) })
  }

  // Drawdown curve derived from the running peak of the equity curve.
  let peak = equityCurve[0]?.value ?? 10000
  const drawdownCurve: CurvePoint[] = equityCurve.map((point) => {
    peak = Math.max(peak, point.value)
    const dd = peak > 0 ? ((point.value - peak) / peak) * 100 : 0
    return { time: point.time, value: Number(dd.toFixed(2)) }
  })

  // Metrics computed from the generated data itself (not invented separately).
  const startEquity = equityCurve[0]?.value ?? 10000
  const endEquity = equityCurve[equityCurve.length - 1]?.value ?? startEquity
  const totalReturn = Number((((endEquity - startEquity) / startEquity) * 100).toFixed(2))
  const maxDrawdown = Number(Math.min(0, ...drawdownCurve.map((d) => d.value)).toFixed(2))

  const winningTrades = trades.filter((t) => t.pnl > 0).length
  const winRate = trades.length > 0 ? Number(((winningTrades / trades.length) * 100).toFixed(1)) : 0

  const dailyReturns: number[] = []
  for (let i = 1; i < equityCurve.length; i++) {
    const prev = equityCurve[i - 1].value
    const cur = equityCurve[i].value
    if (prev > 0) dailyReturns.push((cur - prev) / prev)
  }
  const meanReturn = dailyReturns.reduce((a, b) => a + b, 0) / (dailyReturns.length || 1)
  const variance =
    dailyReturns.reduce((a, b) => a + (b - meanReturn) ** 2, 0) / (dailyReturns.length || 1)
  const stdDev = Math.sqrt(variance)
  const sharpeRatio = stdDev > 0 ? Number(((meanReturn / stdDev) * Math.sqrt(252)).toFixed(2)) : 0

  return {
    trades,
    equityCurve,
    drawdownCurve,
    metrics: {
      totalReturn,
      maxDrawdown,
      sharpeRatio,
      winRate,
      totalTrades: trades.length,
    },
  }
}

// --- public mock endpoints ---------------------------------------------------

export async function mockRunBacktest(request: BacktestRunRequest): Promise<BacktestResult> {
  await delay(400 + Math.random() * 500)
  const generated = generateBacktest(
    request.strategy,
    request.ticker,
    request.startDate,
    request.endDate
  )
  const result: BacktestResult = {
    id: nextId('run'),
    ...generated,
    request,
    createdAt: new Date().toISOString(),
  }
  backtestStore.set(result.id, result)
  persistRun(result)
  return result
}

export async function mockGetBacktestResult(id: string): Promise<BacktestResult> {
  await delay(150)
  const found = backtestStore.get(id)
  if (!found) throw new Error(`No backtest result found for id "${id}"`)
  return found
}

function cartesianProduct(ranges: Record<string, { min: number; max: number; step: number }>) {
  const keys = Object.keys(ranges)
  let combos: Record<string, number>[] = [{}]
  for (const key of keys) {
    const { min, max, step } = ranges[key]
    const values: number[] = []
    for (let v = min; v <= max; v += Math.max(1, step)) values.push(v)
    const next: Record<string, number>[] = []
    for (const combo of combos) {
      for (const v of values) next.push({ ...combo, [key]: v })
    }
    combos = next
  }
  return combos
}

export async function mockRunSweep(request: SweepRequest): Promise<SweepResult> {
  await delay(500)

  const combos = cartesianProduct(request.parameterRanges).slice(0, 200)
  const rows: SweepResultRow[] = []

  for (const combo of combos) {
    const strategy: StrategyDefinition = {
      ...request.strategyTemplate,
      indicators: request.strategyTemplate.indicators.map((ind) =>
        combo[ind.id] !== undefined ? { ...ind, period: combo[ind.id] } : ind
      ),
    }
    const generated = generateBacktest(
      strategy,
      request.ticker,
      request.startDate,
      request.endDate,
      JSON.stringify(combo)
    )
    const runId = nextId('run')
    // Sweep child runs stay in-memory only (see comment above) — still
    // drillable via "View" for the lifetime of the tab, just not persisted.
    backtestStore.set(runId, {
      id: runId,
      ...generated,
      request: { strategy, ticker: request.ticker, startDate: request.startDate, endDate: request.endDate },
      createdAt: new Date().toISOString(),
    })
    rows.push({
      runId,
      parameters: combo,
      totalReturn: generated.metrics.totalReturn,
      sharpeRatio: generated.metrics.sharpeRatio,
      maxDrawdown: generated.metrics.maxDrawdown,
      winRate: generated.metrics.winRate,
    })
  }

  rows.sort((a, b) => (b[request.rankBy] ?? 0) - (a[request.rankBy] ?? 0))

  const cores = 8
  const perRunMs = 45 + Math.random() * 35
  const sequentialMs = Math.round(combos.length * perRunMs)
  const parallelMs = Math.round(sequentialMs / cores + perRunMs * 1.5)

  const result: SweepResult = {
    id: nextId('sweep'),
    results: rows,
    rankBy: request.rankBy,
    timing: { sequentialMs, parallelMs, cores },
    request,
    createdAt: new Date().toISOString(),
  }
  sweepStore.set(result.id, result)
  persistSweep(result)
  return result
}

export async function mockGetSweepResult(id: string): Promise<SweepResult> {
  await delay(150)
  const found = sweepStore.get(id)
  if (!found) throw new Error(`No sweep result found for id "${id}"`)
  return found
}
