import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { ClockIcon, ChartIcon } from "../components/Icons";

interface HistoryItem { id:number; ticker:string; createdAt:string; startDate:string; endDate:string; totalReturn:number; maxDrawdown:number; sharpeRatio:number; winRate:number; strategyName:string|null; }
export default function History(){
  const [runs,setRuns]=useState<HistoryItem[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const navigate=useNavigate();
  useEffect(()=>{client.get<HistoryItem[]>("/backtests/history").then(r=>setRuns(r.data)).catch((err:any)=>setError(err?.response?.data?.error || "Backtest history could not be loaded.")).finally(()=>setLoading(false));},[]);
  return <div className="page-enter"><div className="results-hero"><div><div className="eyebrow">Research archive</div><h1 className="page-title">Backtest History</h1><p className="page-lede">A durable record of every run in this account. Re-open a result without rerunning the strategy.</p></div><div className="feature-icon"><ClockIcon/></div></div>
    {error&&<p className="form-error">{error}</p>}
    {loading?<div className="surface panel" style={{marginTop:24}}><p className="muted">Loading research history…</p></div>:!runs.length?<div className="surface panel" style={{marginTop:24}}><p className="muted">No backtest runs yet — run a strategy to start your archive.</p><button className="button button-primary" style={{marginTop:14}} onClick={()=>navigate("/build")}>Build a strategy</button></div>:<div className="surface panel" style={{marginTop:24}}>
      <div className="toolbar history-toolbar" style={{marginTop:0}}><div><div className="eyebrow">Saved runs</div><h2 style={{margin:"6px 0 0"}}>{runs.length} research {runs.length===1?"run":"runs"}</h2></div><span className="toolbar-spacer"/><button className="button button-primary compact" onClick={()=>navigate("/build")}><ChartIcon size={15}/>New backtest</button></div>
      <div className="table-wrap"><table><thead><tr><th>Date</th><th>Strategy</th><th>Ticker</th><th>Period</th><th className="num">Return</th><th className="num">Drawdown</th><th className="num">Sharpe</th><th className="num">Win rate</th><th></th></tr></thead><tbody>{runs.map(run=><tr className="history-row" key={run.id}><td className="mono-numeric">{new Date(run.createdAt).toLocaleString()}</td><td>{run.strategyName||"Unsaved strategy"}</td><td>{run.ticker}</td><td className="mono-numeric">{run.startDate} → {run.endDate}</td><td className={`num ${run.totalReturn>=0?"gain":"loss"}`}>{run.totalReturn.toFixed(2)}%</td><td className="num loss">{run.maxDrawdown.toFixed(2)}%</td><td className="num">{run.sharpeRatio.toFixed(2)}</td><td className="num">{run.winRate.toFixed(1)}%</td><td className="num"><button className="button button-secondary compact" onClick={()=>navigate(`/results?runId=${run.id}`)}>Open</button></td></tr>)}</tbody></table></div>
    </div>}
  </div>;
}
