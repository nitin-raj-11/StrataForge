import client from './client'
import {
  mockRunBacktest,
  mockGetBacktestResult,
  mockRunSweep,
  mockGetSweepResult,
} from './mockApi'
import type { BacktestRunRequest, BacktestResult, SweepRequest, SweepResult } from './types'
import { addRunToHistory, addSweepToHistory } from '../lib/history'

// Single entry point for every screen in the app. Components must only ever
// import from this file — never from client.ts or mockApi.ts directly. That
// is what makes flipping VITE_USE_MOCK_API a zero-component-change operation
// once the real backend (Member 2) is live.

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'

export async function runBacktest(request: BacktestRunRequest): Promise<BacktestResult> {
  const result = USE_MOCK
    ? await mockRunBacktest(request)
    : (await client.post<BacktestResult>('/backtests/run', request)).data
  addRunToHistory({ ...result, request: result.request ?? request })
  return result
}

export async function getBacktestResult(id: string): Promise<BacktestResult> {
  if (USE_MOCK) return mockGetBacktestResult(id)
  const { data } = await client.get<BacktestResult>(`/backtests/run/${id}`)
  return data
}

export async function runSweep(request: SweepRequest): Promise<SweepResult> {
  const result = USE_MOCK
    ? await mockRunSweep(request)
    : (await client.post<SweepResult>('/backtests/sweep', request)).data
  addSweepToHistory({ ...result, request: result.request ?? request })
  return result
}

export async function getSweepResult(id: string): Promise<SweepResult> {
  if (USE_MOCK) return mockGetSweepResult(id)
  const { data } = await client.get<SweepResult>(`/backtests/sweep/${id}`)
  return data
}

export const isMockMode = USE_MOCK
