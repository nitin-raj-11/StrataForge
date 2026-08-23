import { readJSON, writeJSON } from './storage'
import type { BacktestResult, SweepResult } from '../api/types'

const KEY = 'strataforge.history.v1'
const MAX_ENTRIES = 60

export interface HistoryEntry {
  id: string
  kind: 'run' | 'sweep'
  strategyName: string
  ticker: string
  startDate: string
  endDate: string
  createdAt: string
  headlineLabel: string
  headlineValue: number
}

export function getHistory(): HistoryEntry[] {
  return readJSON<HistoryEntry[]>(KEY, [])
}

export function addRunToHistory(result: BacktestResult) {
  const entry: HistoryEntry = {
    id: result.id,
    kind: 'run',
    strategyName: result.request?.strategy.name ?? 'Untitled strategy',
    ticker: result.request?.ticker ?? '—',
    startDate: result.request?.startDate ?? '',
    endDate: result.request?.endDate ?? '',
    createdAt: result.createdAt ?? new Date().toISOString(),
    headlineLabel: 'Sharpe',
    headlineValue: result.metrics.sharpeRatio,
  }
  prepend(entry)
}

export function addSweepToHistory(result: SweepResult) {
  const best = result.results[0]
  const entry: HistoryEntry = {
    id: result.id,
    kind: 'sweep',
    strategyName: result.request?.strategyTemplate.name ?? 'Untitled sweep',
    ticker: result.request?.ticker ?? '—',
    startDate: result.request?.startDate ?? '',
    endDate: result.request?.endDate ?? '',
    createdAt: result.createdAt ?? new Date().toISOString(),
    headlineLabel: `${result.results.length} combos`,
    headlineValue: best ? best.sharpeRatio : 0,
  }
  prepend(entry)
}

function prepend(entry: HistoryEntry) {
  const current = getHistory()
  const next = [entry, ...current.filter((e) => e.id !== entry.id)].slice(0, MAX_ENTRIES)
  writeJSON(KEY, next)
}

export function removeFromHistory(id: string) {
  writeJSON(KEY, getHistory().filter((e) => e.id !== id))
}

export function clearHistory() {
  writeJSON(KEY, [])
}
