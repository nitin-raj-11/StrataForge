import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { useLocation, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import client from "../api/client";
import ParameterSweepPanel, { type SweepParam } from "../components/ParameterSweepPanel";
import { ArrowIcon, BoltIcon, ChartIcon, SaveIcon } from "../components/Icons";
import { useCurrency } from "../context/CurrencyContext";
import { DEFAULT_STRATEGY, type BacktestPayload, type ConditionConfig, type ConditionType, type IndicatorConfig, type IndicatorType, type SweepResult } from "../api/types";

const fieldStyle = {
  background: "var(--ink-2)", color: "var(--paper)", border: "1px solid var(--border)",
  borderRadius: 10, padding: "11px 12px", width: "100%"
} as const;

const conditionOptions: [ConditionType, string][] = [
  ["CROSSOVER_ABOVE", "Crossover above"],
  ["CROSSOVER_BELOW", "Crossover below"],
  ["ABOVE_THRESHOLD", "Above threshold"],
  ["BELOW_THRESHOLD", "Below threshold"],
];

export default function StrategyBuilder() {
  const [payload, setPayload] = useState<BacktestPayload>(structuredClone(DEFAULT_STRATEGY));
  const [json, setJson] = useState(JSON.stringify(DEFAULT_STRATEGY, null, 2));
  const [mode, setMode] = useState<"form" | "json">("form");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sweepLoading, setSweepLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [sweepResults, setSweepResults] = useState<SweepResult[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [rankBy, setRankBy] = useState("sharpeRatio");
  const [sweepParams, setSweepParams] = useState<SweepParam[]>([]);
  const { currency, formatMoney, usdInr } = useCurrency();
  const location = useLocation();
  const navigate = useNavigate();

  const indicators = payload.strategy.indicators;
  const [tickers, setTickers] = useState<Array<{ ticker: string; companyName: string; lastClose: number; changePercent: number; availableStartDate: string; availableEndDate: string }>>([]);
  const [tickersLoading, setTickersLoading] = useState(true);
  const selectedTicker = tickers.find(item => item.ticker === payload.ticker);
  const availableStartDate = selectedTicker?.availableStartDate ?? "";
  const availableEndDate = selectedTicker?.availableEndDate ?? "";
  const dateRangeInvalid = !!selectedTicker && (payload.startDate < availableStartDate || payload.endDate > availableEndDate || payload.startDate > payload.endDate);

  useEffect(() => {
    let mounted = true;
    client.get("/tickers/summary")
      .then((res) => {
        if (!mounted) return;
        const items = (res.data ?? [])
          .filter((item: any) => item?.ticker && item.ticker !== "USDINR=X")
          .sort((a: any, b: any) => a.ticker.localeCompare(b.ticker));
        setTickers(items);
      })
      .catch(() => {
        if (mounted) setTickers([]);
      })
      .finally(() => {
        if (mounted) setTickersLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const loaded = (location.state as any)?.loadedStrategy;
    if (!loaded) return;
    try {
      const definition = JSON.parse(loaded.definitionJson);
      const next = { ...structuredClone(DEFAULT_STRATEGY), strategy: definition, strategyId: loaded.id } as BacktestPayload;
      setPayload(next);
      setJson(JSON.stringify(next, null, 2));
    } catch {
      setError("Saved strategy could not be loaded.");
    }
  }, [location.state]);

  useEffect(() => {
    setSweepParams(current => {
      const byKey = new Map(current.map(p => [p.key, p]));
      const indicatorParams = indicators.map(ind => {
        const existing = byKey.get(ind.id);
        return existing ?? {
          key: ind.id,
          min: Math.max(2, Math.floor(ind.period / 2)),
          max: Math.max(ind.period * 2, ind.period + 10),
          step: ind.type === "RSI" ? 1 : 5,
        };
      });
      return indicatorParams.length ? indicatorParams : [{ key: "period", min: 5, max: 20, step: 5 }];
    });
  }, [indicators.map(i => `${i.id}:${i.type}`).join("|")]);

  const update = (next: BacktestPayload) => { setPayload(next); setJson(JSON.stringify(next, null, 2)); };
  const syncFromJson = () => {
    try {
      const parsed = JSON.parse(json) as BacktestPayload;
      setPayload(parsed);
      setError("");
      return parsed;
    } catch {
      setError("The JSON is not valid. Fix the syntax before continuing.");
      return null;
    }
  };

  async function handleRun() {
    setError("");
    const parsed = mode === "json" ? syncFromJson() : payload;
    if (!parsed) return;
    if (mode === "form" && dateRangeInvalid && selectedTicker) {
      setError(`Data for ${selectedTicker.ticker} is available only from ${selectedTicker.availableStartDate} to ${selectedTicker.availableEndDate}. Please select dates within this range.`);
      return;
    }
    setLoading(true);
    try {
      const res = await client.post("/backtests/run", parsed);
      const runId = res.data?.runId;
      if (!runId) {
        throw new Error("Backtest completed, but the saved run ID was not returned.");
      }
      sessionStorage.removeItem("lastResult");
      sessionStorage.removeItem("lastRequest");
      navigate(`/results?runId=${runId}`);
    } catch (err: any) {
      setError(err.response?.data?.errors?.join(" ") || err.response?.data?.error || "Backtest failed. Check the strategy and date range.");
    } finally { setLoading(false); }
  }

  async function handleSave() {
    setError("");
    const parsed = mode === "json" ? syncFromJson() : payload;
    if (!parsed) return;
    try {
      const body = { name: parsed.strategy.name, definitionJson: JSON.stringify(parsed.strategy) };
      const res = parsed.strategyId ? await client.put(`/strategies/${parsed.strategyId}`, body) : await client.post("/strategies", body);
      if (res.data?.id && !parsed.strategyId) {
        const next = { ...parsed, strategyId: res.data.id } as BacktestPayload;
        setPayload(next);
        setJson(JSON.stringify(next, null, 2));
      }
      setToast({ message: parsed.strategyId ? "Strategy updated in your workspace." : "Strategy saved to your workspace.", type: "success" });
    } catch (err: any) {
      setToast({ message: err.response?.data?.error || "Could not save strategy.", type: "error" });
    }
  }

  async function handleSweep() {
    setError("");
    const parsed = mode === "json" ? syncFromJson() : payload;
    if (!parsed) return;
    if (mode === "form" && dateRangeInvalid && selectedTicker) {
      setError(`Data for ${selectedTicker.ticker} is available only from ${selectedTicker.availableStartDate} to ${selectedTicker.availableEndDate}. Please select dates within this range.`);
      return;
    }
    const cleaned = sweepParams.filter(p => p.key.trim());
    if (!cleaned.length) { setError("Add at least one sweep parameter."); return; }
    setSweepLoading(true);
    try {
      const ranges: Record<string, number[]> = {};
      for (const p of cleaned) {
        const min = Math.floor(p.min);
        const max = Math.floor(p.max);
        const step = Math.max(1, Math.floor(p.step));
        if (max < min) throw new Error(`${p.key}: maximum must be greater than or equal to minimum.`);
        ranges[p.key.trim()] = [min, max, step];
      }
      const count = cleaned.reduce((n, p) => n * (Math.floor((p.max - p.min) / Math.max(1, p.step)) + 1), 1);
      if (count > 10000) throw new Error("Sweep is too large; reduce the ranges to 10,000 combinations or fewer.");
      const res = await client.post("/backtests/sweep", {
        ticker: parsed.ticker, startDate: parsed.startDate, endDate: parsed.endDate,
        rankBy, parameterRanges: ranges, strategyTemplate: parsed.strategy,
      });
      setSweepResults(res.data); setSelected([]);
      sessionStorage.setItem("lastSweep", JSON.stringify({ ticker: parsed.ticker, startDate: parsed.startDate, endDate: parsed.endDate, rankBy, results: res.data }));
    } catch (err: any) {
      setError(err.response?.data?.errors?.join(" ") || err.message || "Sweep failed.");
    } finally { setSweepLoading(false); }
  }

  const selectedCurves = useMemo(() => selected.map(i => sweepResults[i]).filter(Boolean), [selected, sweepResults]);
  const best = sweepResults[0];

  const setIndicator = (index: number, patch: Partial<IndicatorConfig>) => {
    const nextIndicators = indicators.map((ind, i) => i === index ? { ...ind, ...patch } : ind);
    update({ ...payload, strategy: { ...payload.strategy, indicators: nextIndicators } });
  };

  const setCondition = (which: "entryCondition" | "exitCondition", next: ConditionConfig) => {
    update({ ...payload, strategy: { ...payload.strategy, [which]: next } });
  };

  const addIndicator = (type: IndicatorType) => {
    const base = type === "RSI" ? "rsi" : type.toLowerCase();
    let suffix = indicators.length + 1;
    let id = `${base}${suffix}`;
    while (indicators.some(i => i.id === id)) { suffix += 1; id = `${base}${suffix}`; }
    const next: IndicatorConfig = { id, type, period: type === "RSI" ? 14 : 20 };
    update({ ...payload, strategy: { ...payload.strategy, indicators: [...indicators, next] } });
  };

  const removeIndicator = (index: number) => {
    if (indicators.length <= 1) { setError("A strategy needs at least one indicator."); return; }
    const ids = new Set(indicators.filter((_, i) => i !== index).map(i => i.id));
    const fallback = [...ids][0];
    const nextIndicators = indicators.filter((_, i) => i !== index);
    const fix = (condition: ConditionConfig): ConditionConfig => {
      const result = { ...condition };
      if (!ids.has(result.a)) result.a = fallback;
      if (result.b && !ids.has(result.b)) result.b = fallback;
      if (["ABOVE_THRESHOLD", "BELOW_THRESHOLD"].includes(result.type)) delete result.b;
      return result;
    };
    update({ ...payload, strategy: { ...payload.strategy, indicators: nextIndicators, entryCondition: fix(payload.strategy.entryCondition), exitCondition: fix(payload.strategy.exitCondition) } });
  };
  const applyQuickStrategy = (kind: "SMA" | "EMA" | "RSI") => {
    const base = structuredClone(payload);
    if (kind === "SMA") {
      base.strategy = {
        ...base.strategy,
        name: "SMA Crossover",
        indicators: [
          { id: "smaShort", type: "SMA", period: 10 },
          { id: "smaLong", type: "SMA", period: 50 },
        ],
        entryCondition: { type: "CROSSOVER_ABOVE", a: "smaShort", b: "smaLong" },
        exitCondition: { type: "CROSSOVER_BELOW", a: "smaShort", b: "smaLong" },
      };
    } else if (kind === "EMA") {
      base.strategy = {
        ...base.strategy,
        name: "EMA Crossover",
        indicators: [
          { id: "emaFast", type: "EMA", period: 12 },
          { id: "emaSlow", type: "EMA", period: 26 },
        ],
        entryCondition: { type: "CROSSOVER_ABOVE", a: "emaFast", b: "emaSlow" },
        exitCondition: { type: "CROSSOVER_BELOW", a: "emaFast", b: "emaSlow" },
      };
    } else {
      base.strategy = {
        ...base.strategy,
        name: "RSI Mean Reversion",
        indicators: [{ id: "rsi", type: "RSI", period: 14 }],
        entryCondition: { type: "BELOW_THRESHOLD", a: "rsi", threshold: 30 },
        exitCondition: { type: "ABOVE_THRESHOLD", a: "rsi", threshold: 70 },
      };
    }
    update(base);
    setError("");
    setToast({ message: `${kind} quick strategy loaded. Review the rules, then run or save it.`, type: "success" });
  };


  return <div className="page-enter">
    <div className="results-hero">
      <div>
        <div className="eyebrow">Research workstation</div>
        <h1 className="page-title">Build a Strategy</h1>
        <p className="page-lede">Define the hypothesis, run a rigorous historical test, then search the parameter space without leaving the desk.</p>
      </div>
      <div className="results-actions"><span className="muted mono-numeric">Reference capital {formatMoney(10000)}</span></div>
    </div>

    <div className="toolbar">
      <button className={`button ${mode === "form" ? "button-primary" : "button-secondary"}`} onClick={() => setMode("form")}>Guided builder</button>
      <button className={`button ${mode === "json" ? "button-primary" : "button-secondary"}`} onClick={() => setMode("json")}>Advanced JSON</button>
      <span className="toolbar-spacer" />
      <span className="tag">Display: {currency}{usdInr ? ` · USD/INR ${usdInr.toFixed(2)}` : ""}</span>
    </div>

    {mode === "json" ? (
      <div className="editor-wrap"><Editor height="560px" defaultLanguage="json" value={json} onChange={v => setJson(v ?? "")} theme={document.documentElement.dataset.theme === "light" ? "light" : "vs-dark"} options={{ minimap: { enabled: false }, fontSize: 13, tabSize: 2, padding: { top: 14 } }} /></div>
    ) : (
      <div className="grid grid-2">
        <div className="surface panel">
          <div className="section-title"><span className="feature-icon"><ChartIcon size={16}/></span><div><h2>Market & strategy</h2><p className="muted">Choose what you want to test.</p></div></div>
          <div className="field"><label>Ticker</label><select style={fieldStyle} value={payload.ticker} onChange={e => update({ ...payload, ticker: e.target.value })} disabled={tickersLoading && tickers.length === 0}>
            {tickersLoading && !tickers.length ? <option value={payload.ticker}>{payload.ticker} · loading data…</option> : null}
            {!tickers.some(item => item.ticker === payload.ticker) ? <option value={payload.ticker}>{payload.ticker}</option> : null}
            {tickers.map(item => <option key={item.ticker} value={item.ticker}>{item.ticker} · {item.companyName} · {formatMoney(item.lastClose)} ({item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%)</option>)}
          </select></div>
          {selectedTicker && <div style={{marginTop:18,padding:"12px 14px",border:"1px solid var(--border)",borderRadius:10,background:"rgba(232,166,59,.045)"}}>
            <div className="eyebrow">Historical data availability</div>
            <p className="muted" style={{fontSize:12,lineHeight:1.6,margin:"5px 0 0"}}>
              {selectedTicker.ticker} data is available from <strong style={{color:"var(--paper)"}}>{selectedTicker.availableStartDate}</strong> to <strong style={{color:"var(--paper)"}}>{selectedTicker.availableEndDate}</strong>.
            </p>
          </div>}
          <div className="grid grid-2">
            <div className="field"><label>Start date</label><input style={fieldStyle} type="date" value={payload.startDate} onChange={e => update({ ...payload, startDate: e.target.value })}/></div>
            <div className="field"><label>End date</label><input style={fieldStyle} type="date" value={payload.endDate} onChange={e => update({ ...payload, endDate: e.target.value })}/></div>
          </div>
          {dateRangeInvalid && selectedTicker && <div className="form-error" role="alert" style={{marginTop:10}}>Data for {selectedTicker.ticker} is available only from {selectedTicker.availableStartDate} to {selectedTicker.availableEndDate}. Adjust the selected date range before running the backtest.</div>}
          <div className="field"><label>Strategy name</label><input style={fieldStyle} value={payload.strategy.name} onChange={e => update({ ...payload, strategy: { ...payload.strategy, name: e.target.value } })}/></div>
          <div className="quick-strategy-box">
            <div className="quick-strategy-head"><div><strong>Quick Strategies</strong><span>Start with a proven generalized template.</span></div><span className="tag inline">1 click</span></div>
            <div className="quick-strategy-grid">
              <button type="button" className="quick-strategy" onClick={() => applyQuickStrategy("SMA")}><span className="quick-icon">SMA</span><span><strong>SMA Crossover</strong><small>10 / 50 moving averages</small></span><ArrowIcon size={14}/></button>
              <button type="button" className="quick-strategy" onClick={() => applyQuickStrategy("EMA")}><span className="quick-icon">EMA</span><span><strong>EMA Crossover</strong><small>12 / 26 moving averages</small></span><ArrowIcon size={14}/></button>
              <button type="button" className="quick-strategy" onClick={() => applyQuickStrategy("RSI")}><span className="quick-icon">RSI</span><span><strong>RSI Mean Reversion</strong><small>14 period · 30 / 70 levels</small></span><ArrowIcon size={14}/></button>
            </div>
          </div>
        </div>

        <div className="surface panel">
          <div className="section-title"><span className="feature-icon"><BoltIcon size={16}/></span><div><h2>Risk rules</h2><p className="muted">Controls that shape each simulated position.</p></div></div>
          {([['stopLossPercent','Stop loss %'],['takeProfitPercent','Take profit %'],['positionSizePercent','Position size %']] as const).map(([key,label]) => <div className="field" key={key}><label>{label}</label><input style={fieldStyle} type="number" min="0.1" max="100" step="0.1" value={payload.strategy.riskRules[key]} onChange={e => update({ ...payload, strategy: { ...payload.strategy, riskRules: { ...payload.strategy.riskRules, [key]: Number(e.target.value) } } })}/></div>)}
          <div style={{marginTop:18,padding:"14px 16px",border:"1px solid var(--border)",borderRadius:10,background:"rgba(232,166,59,.035)"}}>
            <p className="muted" style={{fontSize:12,lineHeight:1.6,margin:0}}>
              <strong style={{color:"var(--paper)",display:"block",marginBottom:6}}>How risk rules work</strong>
              Stop loss closes the position at a loss threshold. Take profit locks in gains. Position size controls capital allocation per trade. All three shape the equity curve.
            </p>
          </div>
        </div>

        <div className="surface panel">
          <div className="section-title"><span className="feature-icon"><span className="mono-numeric">Σ</span></span><div><h2>Indicators</h2><p className="muted">SMA, EMA and RSI are available in the guided builder.</p></div></div>
          <div className="indicator-stack">
            {indicators.map((ind,i)=><div className="indicator-card" key={`${ind.id}-${i}`}>
              <div className="indicator-card-head"><strong>{ind.type}</strong><button className="icon-button danger" onClick={() => removeIndicator(i)} aria-label={`Remove ${ind.id}`}>×</button></div>
              <div className="grid grid-3">
                <div className="field"><label>Indicator ID</label><input style={fieldStyle} value={ind.id} onChange={e=>setIndicator(i,{id:e.target.value})}/></div>
                <div className="field"><label>Type</label><select style={fieldStyle} value={ind.type} onChange={e=>setIndicator(i,{type:e.target.value as IndicatorType})}><option>SMA</option><option>EMA</option><option>RSI</option></select></div>
                <div className="field"><label>Period</label><input style={fieldStyle} type="number" min="1" value={ind.period} onChange={e=>setIndicator(i,{period:Number(e.target.value)})}/></div>
              </div>
            </div>)}
          </div>
          <div className="toolbar" style={{marginTop:14}}><button className="button button-secondary compact" onClick={()=>addIndicator("SMA")}>+ SMA</button><button className="button button-secondary compact" onClick={()=>addIndicator("EMA")}>+ EMA</button><button className="button button-secondary compact" onClick={()=>addIndicator("RSI")}>+ RSI</button></div>
        </div>

        <div className="surface panel">
          <div className="section-title"><span className="feature-icon"><ArrowIcon size={16}/></span><div><h2>Signals</h2><p className="muted">Combine crossovers with RSI-style thresholds.</p></div></div>
          <ConditionEditor label="Entry" condition={payload.strategy.entryCondition} indicators={indicators} onChange={c=>setCondition("entryCondition",c)} />
          <ConditionEditor label="Exit" condition={payload.strategy.exitCondition} indicators={indicators} onChange={c=>setCondition("exitCondition",c)} />
        </div>
      </div>
    )}

    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="toolbar action-bar"><button className="button button-primary" disabled={loading} onClick={handleRun}><ChartIcon size={16}/>{loading ? "Running…" : "Run Backtest"}</button><button className="button button-secondary" onClick={handleSave}><SaveIcon size={16}/>Save Strategy</button></div>

    <ParameterSweepPanel parameters={sweepParams} setParameters={setSweepParams} rankBy={rankBy} setRankBy={setRankBy} onRun={handleSweep} loading={sweepLoading} />

    {!!sweepResults.length && <section className="surface panel sweep-results">
      <div className="results-hero"><div><div className="eyebrow">Optimization output</div><h2 style={{fontSize:32,margin:"6px 0"}}>Sweep Results</h2><p className="muted">{sweepResults.length.toLocaleString()} combinations · ranked by {rankBy === "sharpeRatio" ? "Sharpe ratio" : rankBy === "maxDrawdown" ? "lowest drawdown" : rankBy}</p></div><div>{best && <span className="tag">Best {Object.entries(best.parameters).map(([k,v])=>`${k}=${v}`).join(" · ")}</span>}</div></div>
      {best && <div className="grid grid-4" style={{marginTop:18}}><div className="metric"><div className="metric-label">Best return</div><div className={`metric-value ${best.result.metrics.totalReturn>=0?"gain":"loss"}`}>{best.result.metrics.totalReturn.toFixed(2)}%</div></div><div className="metric"><div className="metric-label">Best Sharpe</div><div className="metric-value">{best.result.metrics.sharpeRatio.toFixed(2)}</div></div><div className="metric"><div className="metric-label">Drawdown</div><div className="metric-value loss">{best.result.metrics.maxDrawdown.toFixed(2)}%</div></div><div className="metric"><div className="metric-label">Win rate</div><div className="metric-value">{best.result.metrics.winRate.toFixed(1)}%</div></div></div>}
      <div className="toolbar"><span className="muted">Select up to 3 candidates for comparison.</span><span className="toolbar-spacer"/><button className="button button-primary compact" disabled={!selectedCurves.length} onClick={()=>{sessionStorage.setItem("compareSelection", JSON.stringify(selected));navigate("/compare")}}>Compare selected ({selectedCurves.length})</button></div>
      <div className="table-wrap"><table><thead><tr><th></th><th>Parameters</th><th className="num">Return</th><th className="num">Drawdown</th><th className="num">Sharpe</th><th className="num">Win rate</th><th className="num">ms</th></tr></thead><tbody>{sweepResults.map((s,i)=><tr className="history-row" key={i}><td><input className="compare-select" type="checkbox" checked={selected.includes(i)} disabled={!selected.includes(i)&&selected.length>=3} onChange={e=>setSelected(v=>e.target.checked?[...v,i]:v.filter(x=>x!==i))}/></td><td>{Object.entries(s.parameters).map(([k,v])=><span className="tag inline" key={k}>{k}={v}</span>)}</td><td className={`num ${s.result.metrics.totalReturn>=0?"gain":"loss"}`}>{s.result.metrics.totalReturn.toFixed(2)}%</td><td className="num loss">{s.result.metrics.maxDrawdown.toFixed(2)}%</td><td className="num">{s.result.metrics.sharpeRatio.toFixed(2)}</td><td className="num">{s.result.metrics.winRate.toFixed(1)}%</td><td className="num">{s.durationMs}</td></tr>)}</tbody></table></div>
    </section>}
    {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>} 
  </div>;
}

function ConditionEditor({ label, condition, indicators, onChange }: { label:string; condition:ConditionConfig; indicators:IndicatorConfig[]; onChange:(next:ConditionConfig)=>void }) {
  const isThreshold = condition.type === "ABOVE_THRESHOLD" || condition.type === "BELOW_THRESHOLD";
  return <div className="signal-block">
    <div className="signal-block-head"><strong>{label}</strong><span>{isThreshold ? "Threshold rule" : "Crossover rule"}</span></div>
    <div className="grid grid-3">
      <div className="field"><label>Rule</label><select style={fieldStyle} value={condition.type} onChange={e=>onChange(e.target.value === "ABOVE_THRESHOLD" || e.target.value === "BELOW_THRESHOLD" ? { type:e.target.value as ConditionType, a:condition.a, threshold: condition.threshold ?? 50 } : { type:e.target.value as ConditionType, a:condition.a, b:condition.b ?? indicators[0]?.id })}>{conditionOptions.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></div>
      <div className="field"><label>Indicator</label><select style={fieldStyle} value={condition.a} onChange={e=>onChange({...condition,a:e.target.value})}>{indicators.map(i=><option key={i.id} value={i.id}>{i.id} · {i.type}</option>)}</select></div>
      {isThreshold ? <div className="field"><label>Threshold</label><input style={fieldStyle} type="number" value={condition.threshold ?? 50} onChange={e=>onChange({...condition,threshold:Number(e.target.value),b:undefined})}/><small className="muted">Useful for RSI, e.g. 30 / 70.</small></div> : <div className="field"><label>Compare against</label><select style={fieldStyle} value={condition.b ?? indicators[0]?.id} onChange={e=>onChange({...condition,b:e.target.value})}>{indicators.map(i=><option key={i.id} value={i.id}>{i.id} · {i.type}</option>)}</select></div>}
    </div>
  </div>;
}
