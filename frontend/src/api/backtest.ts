import api from "./api";

export interface BacktestRequest {
  strategy: Record<string, unknown>;
  initialCapital?: number;
}

export interface BacktestResponse {
  id?: string;
  status?: string;
  message?: string;
  [key: string]: unknown;
}

export async function runBacktest(
  data: BacktestRequest
): Promise<BacktestResponse> {
  const response = await api.post(
    "/backtest",
    data
  );

  return response.data;
}

export async function getBacktestResult(
  id: string
): Promise<BacktestResponse> {
  const response = await api.get(
    `/backtest/${id}`
  );

  return response.data;
}