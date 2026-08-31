import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ComparisonChart from "../components/ComparisonChart";
import { useCurrency } from "../context/CurrencyContext";
import CurrencyToggle from "../components/CurrencyToggle";

type Sweep = { parameters: Record<string,number>; result:{ equityCurve:number[]; metrics:{totalReturn:number;maxDrawdown:number;sharpeRatio:number;winRate:number} } };
export default function Compare(){
  const navigate=useNavigate(); const {currency,convertFromUsd,formatMoney}=useCurrency(); const stored=sessionStorage.getItem("lastSweep"); const data=stored?JSON.parse(stored):null; const results:Sweep[]=data?.results||[]; const selection:number[]=JSON.parse(sessionStorage.getItem("compareSelection")||"[]"); const picked=selection.length?selection.map(i=>results[i]).filter(Boolean):results.slice(0,3);
  const curves=useMemo(()=>picked.slice(0,3).map((r,i)=>({label:Object.entries(r.parameters).map(([k,v])=>`${k}=${v}`).join(", "),color:["#E8A63B","#3FA37B","#7A9CC6"][i],equityCurve:r.result.equityCurve.map(v=>convertFromUsd(Number(v)))})),[picked,convertFromUsd]);
  if(!results.length)return <div className="page-enter"><div className="eyebrow">Optimization</div><h1 className="page-title">Compare</h1><p className="muted">Run a parameter sweep first, then choose up to three candidates to compare.</p><button className="button button-primary" onClick={()=>navigate("/build")}>Open strategy builder</button></div>;
  return <div className="page-enter"><div className="results-hero"><div><div className="eyebrow">Optimization review</div><h1 className="page-title">Compare Sweep Results</h1><p className="page-lede">{data.ticker} · {data.startDate} → {data.endDate} · {results.length.toLocaleString()} combinations</p></div><CurrencyToggle/></div>
    <div className="surface panel" style={{marginTop:24}}><div className="section-title"><div><div className="eyebrow">Overlay</div><h2 style={{marginTop:5}}>Candidate equity curves ({currency})</h2></div></div><ComparisonChart curves={curves}/></div>
    <div className="surface panel" style={{marginTop:16}}><div className="toolbar" style={{marginTop:0}}><div><div className="eyebrow">Ranked output</div><h2 style={{margin:"6px 0 0"}}>Best candidates</h2></div></div><div className="table-wrap"><table><thead><tr><th>Parameters</th><th className="num">Return</th><th className="num">Drawdown</th><th className="num">Sharpe</th><th className="num">Win rate</th></tr></thead><tbody>{results.slice(0,20).map((r,i)=><tr key={i}><td>{Object.entries(r.parameters).map(([k,v])=><span className="tag inline" key={k}>{k}={v}</span>)}</td><td className={`num ${r.result.metrics.totalReturn>=0?"gain":"loss"}`}>{r.result.metrics.totalReturn.toFixed(2)}%</td><td className="num loss">{r.result.metrics.maxDrawdown.toFixed(2)}%</td><td className="num">{r.result.metrics.sharpeRatio.toFixed(2)}</td><td className="num">{r.result.metrics.winRate.toFixed(1)}%</td></tr>)}</tbody></table></div></div>
    <p className="form-note" style={{marginTop:12}}>Currency changes affect displayed monetary values such as equity and P&amp;L; percentage-based performance metrics remain unchanged.</p>
  </div>;
}
