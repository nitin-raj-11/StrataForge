import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StrategyDefinition, Indicator, Condition, RiskRules, ParameterRange } from '../api/types';
import { runBacktest, runSweep } from '../api/backtests';
import { tickers } from '../data/tickers';
import { DslEditor } from '../components/strategy/DslEditor';
import { AppShell } from '../components/layout/AppShell';

export function StrategyBuilderPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'form' | 'json'>('form');
  const [isSweepMode, setIsSweepMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [strategy, setStrategy] = useState<StrategyDefinition>({
    name: 'My Strategy',
    indicators: [{ id: 'sma50', type: 'SMA', period: 50 }],
    entryCondition: { type: 'CROSSOVER_ABOVE', a: 'sma50', b: 100 },
    exitCondition: { type: 'CROSSOVER_BELOW', a: 'sma50', b: 50 },
    riskRules: { stopLossPercent: 5, takeProfitPercent: 10, positionSizePercent: 100 }
  });

  const [ticker, setTicker] = useState('AAPL');
  
  // Set default dates to a 4-year range ending today
  const today = new Date();
  const fourYearsAgo = new Date();
  fourYearsAgo.setFullYear(today.getFullYear() - 4);
  const [startDate, setStartDate] = useState(fourYearsAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  // Sweep ranges
  const [paramRanges, setParamRanges] = useState<Record<string, ParameterRange>>({
    'sma50': { min: 20, max: 100, step: 20 }
  });
  const [rankBy, setRankBy] = useState<'sharpeRatio' | 'totalReturn' | 'winRate'>('sharpeRatio');

  const updateStrategy = (update: Partial<StrategyDefinition>) => {
    setStrategy(prev => ({ ...prev, ...update }));
  };

  const handleIndicatorChange = (index: number, update: Partial<Indicator>) => {
    const newIndicators = [...strategy.indicators];
    newIndicators[index] = { ...newIndicators[index], ...update };
    updateStrategy({ indicators: newIndicators });
    
    // Update param ranges if id changes
    if (update.id && update.id !== strategy.indicators[index].id) {
      const oldId = strategy.indicators[index].id;
      const newId = update.id;
      setParamRanges(prev => {
        const next = { ...prev };
        if (next[oldId]) {
          next[newId] = next[oldId];
          delete next[oldId];
        }
        return next;
      });
    }
  };

  const addIndicator = () => {
    const id = `ind_${Math.random().toString(36).substring(2, 6)}`;
    updateStrategy({ indicators: [...strategy.indicators, { id, type: 'SMA', period: 14 }] });
    setParamRanges(prev => ({ ...prev, [id]: { min: 10, max: 50, step: 10 } }));
  };

  const removeIndicator = (index: number) => {
    const id = strategy.indicators[index].id;
    const newIndicators = strategy.indicators.filter((_, i) => i !== index);
    updateStrategy({ indicators: newIndicators });
    setParamRanges(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Validation
  const validate = () => {
    const indicatorIds = new Set(strategy.indicators.map(i => i.id));
    for (const ind of strategy.indicators) {
      if (ind.period <= 0 || !Number.isInteger(ind.period)) return 'Indicator periods must be positive integers.';
      if (!ind.id) return 'Indicators must have an ID.';
    }
    
    if (!indicatorIds.has(strategy.entryCondition.a)) return `Entry condition references unknown indicator '${strategy.entryCondition.a}'`;
    if (typeof strategy.entryCondition.b === 'string' && !indicatorIds.has(strategy.entryCondition.b) && strategy.entryCondition.type.startsWith('CROSSOVER')) {
      return `Entry condition references unknown indicator '${strategy.entryCondition.b}'`;
    }

    if (!indicatorIds.has(strategy.exitCondition.a)) return `Exit condition references unknown indicator '${strategy.exitCondition.a}'`;
    if (typeof strategy.exitCondition.b === 'string' && !indicatorIds.has(strategy.exitCondition.b) && strategy.exitCondition.type.startsWith('CROSSOVER')) {
      return `Exit condition references unknown indicator '${strategy.exitCondition.b}'`;
    }

    const { stopLossPercent, takeProfitPercent, positionSizePercent } = strategy.riskRules;
    if (stopLossPercent < 0 || stopLossPercent > 100) return 'Stop loss must be between 0 and 100.';
    if (takeProfitPercent < 0 || takeProfitPercent > 100) return 'Take profit must be between 0 and 100.';
    if (positionSizePercent < 0 || positionSizePercent > 100) return 'Position size must be between 0 and 100.';

    if (isSweepMode) {
      for (const ind of strategy.indicators) {
        const range = paramRanges[ind.id];
        if (!range) return `Missing parameter range for ${ind.id}`;
        if (range.min <= 0 || range.max < range.min || range.step <= 0) return `Invalid sweep range for ${ind.id}`;
      }
    }

    return null;
  };

  const validationError = validate();

  const handleSubmit = async () => {
    if (validationError) return;
    setIsLoading(true);
    setError(null);
    try {
      if (isSweepMode) {
        const req = {
          strategyTemplate: strategy,
          parameterRanges: paramRanges,
          ticker,
          startDate,
          endDate,
          rankBy
        };
        const result = await runSweep(req);
        navigate(`/sweeps/${result.id}`);
      } else {
        const req = { strategy, ticker, startDate, endDate };
        const result = await runBacktest(req);
        navigate(`/results/${result.id}`);
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred during submission.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCondition = (cond: Condition, onChange: (c: Condition) => void, title: string) => {
    const isThreshold = cond.type === 'GREATER_THAN' || cond.type === 'LESS_THAN';
    return (
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-4">
        <h3 className="font-semibold text-slate-300">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Indicator (a)</label>
            <select
              value={cond.a}
              onChange={e => onChange({ ...cond, a: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
            >
              {strategy.indicators.map(i => <option key={i.id} value={i.id}>{i.id}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Condition</label>
            <select
              value={cond.type}
              onChange={e => {
                const newType = e.target.value as any;
                const newIsThreshold = newType === 'GREATER_THAN' || newType === 'LESS_THAN';
                onChange({ 
                  ...cond, 
                  type: newType,
                  b: newIsThreshold ? 50 : (strategy.indicators[0]?.id || '')
                });
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
            >
              <option value="CROSSOVER_ABOVE">Crossover Above</option>
              <option value="CROSSOVER_BELOW">Crossover Below</option>
              <option value="GREATER_THAN">Greater Than</option>
              <option value="LESS_THAN">Less Than</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              {isThreshold ? 'Value (b)' : 'Indicator (b)'}
            </label>
            {isThreshold ? (
              <input
                type="number"
                value={cond.b}
                onChange={e => onChange({ ...cond, b: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <select
                value={cond.b as string}
                onChange={e => onChange({ ...cond, b: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
              >
                {strategy.indicators.map(i => <option key={i.id} value={i.id}>{i.id}</option>)}
              </select>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Strategy Builder</h1>
          <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setViewMode('form')}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'form' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Form
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'json' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Raw JSON
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {viewMode === 'json' ? (
          <div className="mb-8">
            <DslEditor value={strategy} onChange={setStrategy} />
          </div>
        ) : (
          <div className="space-y-6 mb-8">
            {/* General Settings */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Strategy Name</label>
                  <input
                    type="text"
                    value={strategy.name}
                    onChange={e => updateStrategy({ name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Ticker</label>
                  <select
                    value={ticker}
                    onChange={e => setTicker(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                  >
                    {tickers.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isSweepMode} onChange={e => setIsSweepMode(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-slate-300">Sweep Mode</span>
                </label>
                
                {isSweepMode && (
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-slate-400">Rank By:</span>
                    <select
                      value={rankBy}
                      onChange={e => setRankBy(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="sharpeRatio">Sharpe Ratio</option>
                      <option value="totalReturn">Total Return</option>
                      <option value="winRate">Win Rate</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Indicators */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Indicators</h2>
                <button onClick={addIndicator} className="text-sm text-blue-400 hover:text-blue-300">+ Add</button>
              </div>
              <div className="space-y-3">
                {strategy.indicators.map((ind, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-3 bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <input
                      type="text"
                      value={ind.id}
                      onChange={e => handleIndicatorChange(i, { id: e.target.value })}
                      placeholder="ID"
                      className="w-24 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
                    />
                    <select
                      value={ind.type}
                      onChange={e => handleIndicatorChange(i, { type: e.target.value as any })}
                      className="w-24 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="SMA">SMA</option>
                      <option value="EMA">EMA</option>
                      <option value="RSI">RSI</option>
                    </select>
                    
                    {isSweepMode ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={paramRanges[ind.id]?.min || 1}
                          onChange={e => setParamRanges(prev => ({...prev, [ind.id]: {...prev[ind.id], min: parseInt(e.target.value)||0}}))}
                          placeholder="Min"
                          className="w-16 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-slate-500">-</span>
                        <input
                          type="number"
                          value={paramRanges[ind.id]?.max || 10}
                          onChange={e => setParamRanges(prev => ({...prev, [ind.id]: {...prev[ind.id], max: parseInt(e.target.value)||0}}))}
                          placeholder="Max"
                          className="w-16 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-slate-500">step</span>
                        <input
                          type="number"
                          value={paramRanges[ind.id]?.step || 1}
                          onChange={e => setParamRanges(prev => ({...prev, [ind.id]: {...prev[ind.id], step: parseInt(e.target.value)||0}}))}
                          placeholder="Step"
                          className="w-16 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    ) : (
                      <input
                        type="number"
                        value={ind.period}
                        onChange={e => handleIndicatorChange(i, { period: parseInt(e.target.value) || 0 })}
                        placeholder="Period"
                        className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
                      />
                    )}
                    
                    <button onClick={() => removeIndicator(i)} className="ml-auto text-slate-500 hover:text-red-400">×</button>
                  </div>
                ))}
                {strategy.indicators.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No indicators defined.</p>
                )}
              </div>
            </div>

            {/* Conditions */}
            <div className="space-y-4">
              {renderCondition(strategy.entryCondition, c => updateStrategy({ entryCondition: c }), 'Entry Condition')}
              {renderCondition(strategy.exitCondition, c => updateStrategy({ exitCondition: c }), 'Exit Condition')}
            </div>

            {/* Risk Rules */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Risk Rules (%)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Stop Loss: {strategy.riskRules.stopLossPercent}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={strategy.riskRules.stopLossPercent}
                    onChange={e => updateStrategy({ riskRules: { ...strategy.riskRules, stopLossPercent: parseInt(e.target.value) }})}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Take Profit: {strategy.riskRules.takeProfitPercent}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={strategy.riskRules.takeProfitPercent}
                    onChange={e => updateStrategy({ riskRules: { ...strategy.riskRules, takeProfitPercent: parseInt(e.target.value) }})}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Position Size: {strategy.riskRules.positionSizePercent}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={strategy.riskRules.positionSizePercent}
                    onChange={e => updateStrategy({ riskRules: { ...strategy.riskRules, positionSizePercent: parseInt(e.target.value) }})}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="sticky bottom-6 flex justify-end">
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 shadow-xl flex items-center gap-4">
            {validationError && <span className="text-red-400 text-sm px-2">{validationError}</span>}
            <button
              onClick={handleSubmit}
              disabled={!!validationError || isLoading}
              className={`px-6 py-2.5 rounded-lg font-semibold text-white transition-all shadow-md ${
                validationError || isLoading ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/20'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Running...
                </span>
              ) : isSweepMode ? 'Run Parameter Sweep' : 'Run Backtest'}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
