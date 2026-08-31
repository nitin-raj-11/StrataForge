import { useMemo, useState } from "react";

export type SweepParam = { key: string; min: number; max: number; step: number };

const labelMap: Record<string, string> = {
  smaShort: "SMA Short Period",
  smaLong: "SMA Long Period",
  emaShort: "EMA Short Period",
  emaLong: "EMA Long Period",
  stopLossPercent: "Stop Loss %",
  takeProfitPercent: "Take Profit %",
  positionSizePercent: "Position Size %",
};

const countFor = (p: SweepParam) => p.step > 0 && p.max >= p.min ? Math.floor((p.max - p.min) / p.step) + 1 : 0;
const labelFor = (key: string) => labelMap[key] ?? key;

export default function ParameterSweepPanel({ parameters, setParameters, rankBy, setRankBy, onRun, loading }: {
  parameters: SweepParam[];
  setParameters: (next: SweepParam[]) => void;
  rankBy: string;
  setRankBy: (next: string) => void;
  onRun: () => void;
  loading: boolean;
}) {
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const count = useMemo(() => parameters.reduce((n, p) => n * Math.max(0, countFor(p)), 1), [parameters]);
  const update = (index: number, key: keyof SweepParam, value: number | string) => setParameters(parameters.map((p, i) => i === index ? { ...p, [key]: key === "key" ? String(value) : Number(value) } : p));
  const addAdvanced = () => setParameters([...parameters, { key: "newParameter", min: 1, max: 10, step: 1 }]);
  const remove = (index: number) => setParameters(parameters.filter((_, i) => i !== index));

  return <section className="sweep-card surface">
    <div className="sweep-head">
      <div><div className="eyebrow">Optimization lab</div><h2>Parameter Sweep</h2><p className="muted">Run a controlled grid search, then inspect the strongest candidates.</p></div>
      <div className="mode-switch" role="tablist" aria-label="Sweep mode">
        <button type="button" className={mode === "simple" ? "selected" : ""} onClick={() => setMode("simple")}>Simple</button>
        <button type="button" className={mode === "advanced" ? "selected" : ""} onClick={() => setMode("advanced")}>Advanced</button>
      </div>
    </div>

    {mode === "simple" ? <div className="sweep-simple">
      {parameters.length ? parameters.map((p, i) => <div className="sweep-param" key={`${p.key}-${i}`}>
        <div className="sweep-param-title"><strong>{labelFor(p.key)}</strong><span>{countFor(p)} values</span></div>
        <div className="sweep-inputs">
          <label>Min<input type="number" value={p.min} onChange={e => update(i, "min", e.target.value)} /></label>
          <label>Max<input type="number" value={p.max} onChange={e => update(i, "max", e.target.value)} /></label>
          <label>Step<input type="number" min="1" value={p.step} onChange={e => update(i, "step", e.target.value)} /></label>
        </div>
        <div className="range-visual"><span style={{ left: "3%" }} /><span style={{ left: "97%" }} /><div /></div>
      </div>) : <div className="empty-sweep"><strong>No parameters detected.</strong><p>Add an SMA, EMA, or RSI indicator to create a simple sweep.</p></div>}
      <p className="form-note">Simple mode automatically uses the strategy's indicator periods. Switch to Advanced to optimize risk settings or custom IDs.</p>
    </div> : <div className="sweep-advanced">
      <div className="advanced-grid advanced-grid-head"><span>Parameter</span><span>Min</span><span>Max</span><span>Step</span><span /></div>
      {parameters.map((p, i) => <div className="advanced-grid" key={`${p.key}-${i}`}>
        <input value={p.key} onChange={e => update(i, "key", e.target.value)} aria-label="Parameter name" />
        <input type="number" value={p.min} onChange={e => update(i, "min", e.target.value)} aria-label="Minimum" />
        <input type="number" value={p.max} onChange={e => update(i, "max", e.target.value)} aria-label="Maximum" />
        <input type="number" min="1" value={p.step} onChange={e => update(i, "step", e.target.value)} aria-label="Step" />
        <button type="button" className="icon-button danger" onClick={() => remove(i)} aria-label={`Remove ${p.key}`}>×</button>
      </div>)}
      <button type="button" className="button button-secondary" onClick={addAdvanced}>+ Add parameter</button>
      <p className="form-note">Advanced keys can target indicator IDs, stopLossPercent, takeProfitPercent, and positionSizePercent.</p>
    </div>}

    <div className="sweep-foot">
      <label className="select-field">Rank by<select value={rankBy} onChange={e => setRankBy(e.target.value)}><option value="sharpeRatio">Sharpe Ratio</option><option value="totalReturn">Total Return</option><option value="winRate">Win Rate</option><option value="maxDrawdown">Lowest Drawdown</option></select></label>
      <div className="sweep-count"><span>Estimated tests</span><strong>{count.toLocaleString()}</strong><small>{count > 10000 ? "Reduce the ranges" : "parallel backtests"}</small></div>
      <button type="button" className="button button-primary sweep-run" disabled={loading || count < 1 || count > 10000} onClick={onRun}>{loading ? "Optimizing…" : `Run Optimization · ${count.toLocaleString()}`}</button>
    </div>
  </section>;
}
