import { BacktestRequest, BacktestResult, SweepRequest, SweepResult, Trade, DataPoint, SweepResultRow, StrategyDefinition } from './types';

const backtestResults = new Map<string, BacktestResult>();
const sweepResults = new Map<string, SweepResult>();

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function mockRunBacktest(request: BacktestRequest): Promise<BacktestResult> {
  await delay(Math.floor(Math.random() * 500) + 400); // 400-900ms delay

  const id = generateId('run');
  const start = new Date(request.startDate);
  const end = new Date(request.endDate);
  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  const equityCurve: DataPoint[] = [];
  const drawdownCurve: DataPoint[] = [];
  let currentEquity = 10000;
  let peakEquity = 10000;
  
  for (let i = 0; i <= days; i++) {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    // skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const time = date.toISOString().split('T')[0];
    const change = (Math.random() - 0.48) * 100; // Slight upward drift
    currentEquity += change;
    
    if (currentEquity > peakEquity) peakEquity = currentEquity;
    
    equityCurve.push({ time, value: currentEquity });
    drawdownCurve.push({ time, value: ((currentEquity - peakEquity) / peakEquity) * 100 });
  }

  const numTrades = Math.floor(Math.random() * 26) + 15; // 15-40 trades
  const trades: Trade[] = [];
  let winningTrades = 0;

  for (let i = 0; i < numTrades; i++) {
    const entryIdx = Math.floor(Math.random() * (equityCurve.length - 10));
    const exitIdx = entryIdx + Math.floor(Math.random() * 10) + 1;
    
    const entryPrice = 100 + Math.random() * 50;
    const isWin = Math.random() > 0.45;
    const pnlPercent = isWin ? Math.random() * 10 : -Math.random() * 8;
    const exitPrice = entryPrice * (1 + pnlPercent / 100);
    
    if (isWin) winningTrades++;

    trades.push({
      entryDate: equityCurve[entryIdx].time,
      exitDate: equityCurve[Math.min(exitIdx, equityCurve.length - 1)].time,
      entryPrice,
      exitPrice,
      pnl: (exitPrice - entryPrice) * 10, // Assuming 10 shares
      pnlPercent
    });
  }

  // Sort trades by entry date
  trades.sort((a, b) => a.entryDate.localeCompare(b.entryDate));

  const totalReturn = ((currentEquity - 10000) / 10000) * 100;
  const maxDrawdown = Math.min(...drawdownCurve.map(d => d.value));
  const winRate = (winningTrades / numTrades) * 100;
  const sharpeRatio = (totalReturn / 100) / 0.15 + (Math.random() * 0.5); // Mock Sharpe calculation

  const result: BacktestResult = {
    id,
    trades,
    equityCurve,
    drawdownCurve,
    metrics: {
      totalReturn,
      maxDrawdown,
      sharpeRatio,
      winRate,
      totalTrades: numTrades
    }
  };

  backtestResults.set(id, result);
  return result;
}

export async function mockGetBacktestResult(id: string): Promise<BacktestResult> {
  await delay(300);
  const result = backtestResults.get(id);
  if (!result) throw new Error('Result not found');
  return result;
}

export async function mockRunSweep(request: SweepRequest): Promise<SweepResult> {
  await delay(Math.floor(Math.random() * 500) + 400);

  const id = generateId('sweep');
  const results: SweepResultRow[] = [];
  
  // Generate parameter combinations
  const paramKeys = Object.keys(request.parameterRanges);
  
  const generateCombos = (index: number, currentCombo: Record<string, number>) => {
    if (index === paramKeys.length) {
      // Create a mock run for this combination
      const runId = generateId('run');
      
      // We don't actually run mockRunBacktest to save time, just generate metrics directly
      const totalReturn = (Math.random() - 0.2) * 50;
      results.push({
        runId,
        parameters: { ...currentCombo },
        totalReturn,
        sharpeRatio: (totalReturn / 100) / 0.15 + (Math.random() * 0.5),
        maxDrawdown: -Math.random() * 30,
        winRate: 40 + Math.random() * 30,
      });
      
      // Store a fake backtest result so clicking "View" works
      backtestResults.set(runId, {
        id: runId,
        trades: [],
        equityCurve: [{time: request.startDate, value: 10000}, {time: request.endDate, value: 10000 + (totalReturn * 100)}],
        drawdownCurve: [{time: request.startDate, value: 0}, {time: request.endDate, value: -Math.random() * 20}],
        metrics: {
          totalReturn,
          maxDrawdown: -20,
          sharpeRatio: 1.2,
          winRate: 55,
          totalTrades: 20
        }
      });
      return;
    }
    
    const key = paramKeys[index];
    const range = request.parameterRanges[key];
    for (let val = range.min; val <= range.max; val += range.step) {
      currentCombo[key] = val;
      generateCombos(index + 1, currentCombo);
    }
  };
  
  if (paramKeys.length > 0) {
    generateCombos(0, {});
  } else {
    // Fallback if no ranges
    generateCombos(0, {});
  }

  // Sort
  results.sort((a, b) => b[request.rankBy] - a[request.rankBy]);

  const sweepResult: SweepResult = { id, results };
  sweepResults.set(id, sweepResult);
  return sweepResult;
}

export async function mockGetSweepResult(id: string): Promise<SweepResult> {
  await delay(300);
  const result = sweepResults.get(id);
  if (!result) throw new Error('Result not found');
  return result;
}
