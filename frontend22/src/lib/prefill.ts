import type { BacktestRunRequest } from '../api/types'
import { readJSON, removeKey, writeJSON } from './storage'

const KEY = 'strataforge.prefill.v1'

export function setPrefill(request: BacktestRunRequest) {
  writeJSON(KEY, request)
}

/** Reads and clears the pending prefill in one call — it's meant to be consumed once. */
export function consumePrefill(): BacktestRunRequest | null {
  const value = readJSON<BacktestRunRequest | null>(KEY, null)
  if (value) removeKey(KEY)
  return value
}
