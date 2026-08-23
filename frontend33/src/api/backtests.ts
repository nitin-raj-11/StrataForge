import { BacktestRequest, BacktestResult, SweepRequest, SweepResult } from './types';
import { apiClient } from './client';
import { mockRunBacktest, mockGetBacktestResult, mockRunSweep, mockGetSweepResult } from './mockApi';

const useMock = import.meta.env.VITE_USE_MOCK_API === 'true';

export async function runBacktest(request: BacktestRequest): Promise<BacktestResult> {
  if (useMock) {
    return mockRunBacktest(request);
  }
  const response = await apiClient.post<BacktestResult>('/backtests/run', request);
  return response.data;
}

export async function getBacktestResult(id: string): Promise<BacktestResult> {
  if (useMock) {
    return mockGetBacktestResult(id);
  }
  const response = await apiClient.get<BacktestResult>(`/backtests/run/${id}`);
  return response.data;
}

export async function runSweep(request: SweepRequest): Promise<SweepResult> {
  if (useMock) {
    return mockRunSweep(request);
  }
  const response = await apiClient.post<SweepResult>('/backtests/sweep', request);
  return response.data;
}

export async function getSweepResult(id: string): Promise<SweepResult> {
  if (useMock) {
    return mockGetSweepResult(id);
  }
  const response = await apiClient.get<SweepResult>(`/backtests/sweep/${id}`);
  return response.data;
}
