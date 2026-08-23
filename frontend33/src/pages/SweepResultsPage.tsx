import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SweepResult } from '../api/types';
import { getSweepResult } from '../api/backtests';
import { AppShell } from '../components/layout/AppShell';

export function SweepResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<SweepResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getSweepResult(id)
      .then(setResult)
      .catch(e => setError(e.message || 'Failed to load sweep result'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Running parameter sweep...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !result) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-slate-200 mb-2">Sweep Not Found</h2>
          <p className="text-slate-400 mb-6">{error || 'The sweep result could not be found.'}</p>
          <Link to="/build" className="text-blue-400 hover:text-blue-300 font-medium">← Back to Builder</Link>
        </div>
      </AppShell>
    );
  }

  const { results } = result;
  if (results.length === 0) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-slate-200 mb-2">No Results</h2>
          <p className="text-slate-400">The parameter sweep produced no combinations.</p>
        </div>
      </AppShell>
    );
  }

  const paramKeys = Object.keys(results[0].parameters);
  const totalCombos = results.length;
  
  // Fake sequential vs parallel stat
  const seqTime = totalCombos * 1.5;
  const parTime = seqTime / 8;

  const fmtPct = (val: number) => `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;

  return (
    <AppShell>
      <div className="space-y-6 pb-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-100">Sweep Results</h1>
          <Link to="/build" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg font-medium transition-colors border border-slate-700">
            New Sweep
          </Link>
        </div>

        <div className="flex gap-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 inline-flex items-center gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Combinations</div>
              <div className="text-2xl font-semibold text-slate-100">{totalCombos}</div>
            </div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex-1">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Execution Time (Simulated)</div>
            <div className="flex items-end gap-3 text-sm">
              <div className="text-blue-400 font-medium text-lg">{parTime.toFixed(1)}s <span className="text-slate-500 font-normal text-xs ml-1">parallel</span></div>
              <div className="text-slate-500 line-through mb-0.5">{seqTime.toFixed(1)}s <span className="text-slate-600 font-normal text-xs ml-1">sequential</span></div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-900/50 text-slate-400 font-medium">
                <tr>
                  <th className="px-6 py-4 w-12">Rank</th>
                  {paramKeys.map(k => (
                    <th key={k} className="px-6 py-4">{k}</th>
                  ))}
                  <th className="px-6 py-4 text-right">Sharpe</th>
                  <th className="px-6 py-4 text-right">Return</th>
                  <th className="px-6 py-4 text-right">Drawdown</th>
                  <th className="px-6 py-4 text-right">Win Rate</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {results.map((r, i) => (
                  <tr key={r.runId} className={`hover:bg-slate-700/20 transition-colors ${i === 0 ? 'bg-amber-500/5' : ''}`}>
                    <td className="px-6 py-3">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-500 text-slate-900' : 'text-slate-500'}`}>
                        {i + 1}
                      </div>
                    </td>
                    {paramKeys.map(k => (
                      <td key={k} className="px-6 py-3 font-mono text-slate-300">{r.parameters[k]}</td>
                    ))}
                    <td className={`px-6 py-3 text-right font-mono ${r.sharpeRatio >= 1 ? 'text-green-400' : 'text-slate-300'}`}>
                      {r.sharpeRatio.toFixed(2)}
                    </td>
                    <td className={`px-6 py-3 text-right font-mono ${r.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {fmtPct(r.totalReturn)}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-red-400">
                      {r.maxDrawdown.toFixed(1)}%
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-slate-300">
                      {r.winRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => navigate(`/results/${r.runId}`)}
                        className="text-blue-400 hover:text-blue-300 font-medium px-3 py-1 rounded border border-blue-500/30 hover:bg-blue-500/10 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
