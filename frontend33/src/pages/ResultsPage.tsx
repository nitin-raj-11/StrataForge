import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BacktestResult } from '../api/types';
import { getBacktestResult } from '../api/backtests';
import { AppShell } from '../components/layout/AppShell';
import { ChartWrapper } from '../components/results/ChartWrapper';

export function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sorting
  const [sortCol, setSortCol] = useState<'entryDate' | 'pnlPercent'>('entryDate');
  const [sortDesc, setSortDesc] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBacktestResult(id)
      .then(setResult)
      .catch(e => setError(e.message || 'Failed to load result'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading backtest results...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !result) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-slate-200 mb-2">Result Not Found</h2>
          <p className="text-slate-400 mb-6">{error || 'The backtest result could not be found.'}</p>
          <Link to="/build" className="text-blue-400 hover:text-blue-300 font-medium">← Back to Builder</Link>
        </div>
      </AppShell>
    );
  }

  const { metrics, equityCurve, drawdownCurve, trades } = result;

  const sortedTrades = [...trades].sort((a, b) => {
    let valA = a[sortCol];
    let valB = b[sortCol];
    if (valA < valB) return sortDesc ? 1 : -1;
    if (valA > valB) return sortDesc ? -1 : 1;
    return 0;
  });

  const toggleSort = (col: 'entryDate' | 'pnlPercent') => {
    if (sortCol === col) setSortDesc(!sortDesc);
    else { setSortCol(col); setSortDesc(true); }
  };

  const fmtPct = (val: number) => `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
  const fmtCurr = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <AppShell>
      <div className="space-y-6 pb-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-100">Backtest Results</h1>
          <Link to="/build" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg font-medium transition-colors border border-slate-700">
            Run Another
          </Link>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
            <div className="text-sm text-slate-400 mb-1 font-medium">Total Return</div>
            <div className={`text-3xl font-mono ${metrics.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {fmtPct(metrics.totalReturn)}
            </div>
          </div>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
            <div className="text-sm text-slate-400 mb-1 font-medium">Max Drawdown</div>
            <div className="text-3xl font-mono text-red-400">
              {metrics.maxDrawdown.toFixed(1)}%
            </div>
          </div>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
            <div className="text-sm text-slate-400 mb-1 font-medium">Sharpe Ratio</div>
            <div className={`text-3xl font-mono ${metrics.sharpeRatio >= 1 ? 'text-green-400' : 'text-slate-200'}`}>
              {metrics.sharpeRatio.toFixed(2)}
            </div>
          </div>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
            <div className="text-sm text-slate-400 mb-1 font-medium">Win Rate</div>
            <div className={`text-3xl font-mono ${metrics.winRate >= 50 ? 'text-green-400' : 'text-slate-200'}`}>
              {metrics.winRate.toFixed(1)}% <span className="text-sm text-slate-500">({metrics.totalTrades} trades)</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <ChartWrapper data={equityCurve} color="#3b82f6" title="Equity Curve" height={350} />
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <ChartWrapper data={drawdownCurve} color="#ef4444" title="Drawdown" height={200} isArea />
          </div>
        </div>

        {/* Trade Log */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h3 className="font-semibold text-slate-200">Trade Log</h3>
          </div>
          {trades.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No trades were generated by this strategy over this period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-900/50 text-slate-400 font-medium">
                  <tr>
                    <th className="px-6 py-3 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('entryDate')}>
                      Entry Date {sortCol === 'entryDate' && (sortDesc ? '↓' : '↑')}
                    </th>
                    <th className="px-6 py-3">Exit Date</th>
                    <th className="px-6 py-3 text-right">Entry Price</th>
                    <th className="px-6 py-3 text-right">Exit Price</th>
                    <th className="px-6 py-3 text-right">P&L</th>
                    <th className="px-6 py-3 text-right cursor-pointer hover:text-slate-200" onClick={() => toggleSort('pnlPercent')}>
                      P&L % {sortCol === 'pnlPercent' && (sortDesc ? '↓' : '↑')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {sortedTrades.map((t, i) => (
                    <tr key={i} className="hover:bg-slate-700/20">
                      <td className="px-6 py-3">{fmtDate(t.entryDate)}</td>
                      <td className="px-6 py-3">{fmtDate(t.exitDate)}</td>
                      <td className="px-6 py-3 text-right font-mono text-slate-300">{fmtCurr(t.entryPrice)}</td>
                      <td className="px-6 py-3 text-right font-mono text-slate-300">{fmtCurr(t.exitPrice)}</td>
                      <td className={`px-6 py-3 text-right font-mono ${t.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {fmtCurr(t.pnl)}
                      </td>
                      <td className={`px-6 py-3 text-right font-mono ${t.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {fmtPct(t.pnlPercent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
