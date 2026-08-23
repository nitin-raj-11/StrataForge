// The standard liquid-ticker universe agreed with Member 1 (backend/data lead).
// Member 1's ingestion script seeds TimescaleDB with daily OHLCV for exactly this
// list, so the frontend must not invent tickers outside of it.
export const TICKERS: string[] = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'JPM', 'V', 'META', 'NFLX',
  'DIS', 'BA', 'XOM', 'WMT', 'KO', 'PEP', 'INTC', 'AMD', 'CSCO', 'ORCL',
  'IBM', 'PYPL', 'ADBE', 'CRM', 'UBER',
]
