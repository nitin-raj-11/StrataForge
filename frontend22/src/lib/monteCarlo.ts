import type { Trade } from '../api/types'

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

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export interface MonteCarloResult {
  /** Percentile equity paths, indexed by trade step (0 = starting cash). */
  bands: {
    p5: number[]
    p25: number[]
    p50: number[]
    p75: number[]
    p95: number[]
  }
  finalReturns: number[] // % return per simulation
  probabilityOfProfit: number // 0-100
  medianReturn: number
  p5Return: number
  p95Return: number
  simulations: number
}

/**
 * Runs `simulations` random reorderings of the same trades and tracks the
 * resulting equity path each time. This answers "how much did trade order
 * luck matter?" rather than treating the one realized path as gospel — the
 * differentiator called out in the project's Monte Carlo stretch goal.
 */
export function runMonteCarlo(
  trades: Trade[],
  startingCash = 10000,
  simulations = 200
): MonteCarloResult | null {
  if (trades.length < 2) return null

  const rng = mulberry32(Date.now() & 0xffffffff)
  const paths: number[][] = []
  const finalReturns: number[] = []

  for (let s = 0; s < simulations; s++) {
    const order = shuffle(trades, rng)
    const path = [startingCash]
    let cash = startingCash
    for (const t of order) {
      cash += t.pnl
      path.push(cash)
    }
    paths.push(path)
    finalReturns.push(((cash - startingCash) / startingCash) * 100)
  }

  const steps = trades.length + 1
  const percentileAt = (step: number, p: number) => {
    const values = paths.map((path) => path[step]).sort((a, b) => a - b)
    const idx = Math.min(values.length - 1, Math.max(0, Math.round((p / 100) * (values.length - 1))))
    return values[idx]
  }

  const bands = { p5: [] as number[], p25: [] as number[], p50: [] as number[], p75: [] as number[], p95: [] as number[] }
  for (let step = 0; step < steps; step++) {
    bands.p5.push(percentileAt(step, 5))
    bands.p25.push(percentileAt(step, 25))
    bands.p50.push(percentileAt(step, 50))
    bands.p75.push(percentileAt(step, 75))
    bands.p95.push(percentileAt(step, 95))
  }

  const sortedReturns = [...finalReturns].sort((a, b) => a - b)
  const pct = (p: number) => sortedReturns[Math.round((p / 100) * (sortedReturns.length - 1))]

  return {
    bands,
    finalReturns,
    probabilityOfProfit: Number(((finalReturns.filter((r) => r > 0).length / simulations) * 100).toFixed(1)),
    medianReturn: Number(pct(50).toFixed(2)),
    p5Return: Number(pct(5).toFixed(2)),
    p95Return: Number(pct(95).toFixed(2)),
    simulations,
  }
}
