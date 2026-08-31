import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PriceChart from "../components/PriceChart";
import EquityChart from "../components/EquityChart";
import CurrencyToggle from "../components/CurrencyToggle";
import client from "../api/client";
import { useCurrency } from "../context/CurrencyContext";
import type { BacktestResult } from "../api/types";

export default function Results() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [data, setData] = useState<BacktestResult | null>(null);
  const [meta, setMeta] = useState<any>(null);
  const [bars, setBars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currency, usdInr, formatMoney, convertFromUsd } = useCurrency();

  useEffect(() => {
    const runId = params.get("runId");
    setData(null);
    setMeta(null);
    setBars([]);
    setLoading(true);

    if (!runId) {
      setLoading(false);
      return;
    }

    client.get(`/backtests/history/${encodeURIComponent(runId)}`)
      .then(res => {
        setData(res.data.result);
        setMeta(res.data);
      })
      .catch(() => {
        setData(null);
        setMeta(null);
      })
      .finally(() => setLoading(false));
  }, [params]);

  useEffect(() => {
    if (!data || !meta) return;
    client.get("/backtests/bars", { params: { ticker: meta.ticker, startDate: meta.startDate, endDate: meta.endDate } })
      .then(res => setBars(res.data.map((b:any)=>({time:b.date,open:Number(b.open),high:Number(b.high),low:Number(b.low),close:Number(b.close)}))))
      .catch(() => {});
  }, [data, meta]);

  const multiplier = currency === "INR" && usdInr ? usdInr : 1;
  if (loading) return <div className="page-enter"><div className="eyebrow">Performance review</div><h1 className="page-title">Loading result…</h1><p className="muted">Restoring the saved run from your research history.</p></div>;
  if (!data) return <div className="page-enter"><div className="eyebrow">Performance review</div><h1 className="page-title">No result yet</h1><p className="muted">Run a backtest to create your first saved research result.</p><button className="button button-primary" onClick={()=>navigate("/build")}>Build a strategy</button></div>;

  return <div className="page-enter">
    <div className="results-hero"><div><div className="eyebrow">Performance review</div><h1 className="page-title">Backtest Results</h1><p className="page-lede">{meta?.ticker || "—"} · {meta?.strategyName || meta?.strategy?.name || "Strategy"} · {meta?.startDate} → {meta?.endDate}</p></div><CurrencyToggle/></div>
    <div className="toolbar"><span className="tag">Display currency: {currency}</span>{usdInr&&<span className="tag">USD/INR {usdInr.toFixed(2)}</span>}<span className="toolbar-spacer"/><button className="button button-secondary compact" onClick={()=>navigate("/history")}>Back to history</button></div>
    <div className="grid grid-4" style={{marginTop:18}}>
      <div className="surface metric"><div className="metric-label">Total return</div><div className={`metric-value ${data.metrics.totalReturn>=0?"gain":"loss"}`}>{data.metrics.totalReturn.toFixed(2)}%</div><small className="muted">Same regardless of display currency</small></div>
      <div className="surface metric"><div className="metric-label">Sharpe ratio</div><div className="metric-value">{data.metrics.sharpeRatio.toFixed(2)}</div><small className="muted">Annualized daily-return measure</small></div>
      <div className="surface metric"><div className="metric-label">Max drawdown</div><div className="metric-value loss">{data.metrics.maxDrawdown.toFixed(2)}%</div><small className="muted">Peak-to-trough</small></div>
      <div className="surface metric"><div className="metric-label">Win rate</div><div className="metric-value">{data.metrics.winRate.toFixed(1)}%</div><small className="muted">Closed trades won</small></div>
    </div>
    <div className="surface panel" style={{marginTop:16}}><div className="section-title"><div><div className="eyebrow">Equity</div><h2 style={{marginTop:5}}>Equity curve ({currency})</h2></div><span className="tag">Reference {formatMoney(10000)}</span></div><EquityChart values={data.equityCurve.map(Number)} multiplier={multiplier} currency={currency}/></div>
    <div className="surface panel" style={{marginTop:16}}><div className="section-title"><div><div className="eyebrow">Market structure</div><h2 style={{marginTop:5}}>Price action ({currency})</h2></div></div>{bars.length?<PriceChart bars={bars} trades={data.trades} multiplier={multiplier} currency={currency}/>:<p className="muted">Price history could not be loaded.</p>}</div>
    <div className="surface panel" style={{marginTop:16}}><div className="section-title"><div><div className="eyebrow">Execution</div><h2 style={{marginTop:5}}>Trade log</h2></div><span className="tag">{data.metrics.totalTrades} trades</span></div>
      {!data.trades.length?<p className="muted">No trades were triggered for this configuration.</p>:<div className="table-wrap"><table><thead><tr><th>Entry</th><th>Exit</th><th className="num">Quantity</th><th className="num">Entry price</th><th className="num">Exit price</th><th className="num">P&amp;L ({currency})</th></tr></thead><tbody>{data.trades.map((t,i)=><tr key={i}><td>{t.entryDate}</td><td>{t.exitDate}</td><td className="num">{Number(t.quantity).toFixed(4)}</td><td className="num">{formatMoney(t.entryPrice)}</td><td className="num">{formatMoney(t.exitPrice)}</td><td className={`num ${t.pnl>=0?"gain":"loss"}`}>{formatMoney(t.pnl)}</td></tr>)}</tbody></table></div>}
    </div>
  </div>;
}
