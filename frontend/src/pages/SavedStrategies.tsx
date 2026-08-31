import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

interface SavedStrategy { id:number; name:string; definitionJson:string; createdAt:string; }
export default function SavedStrategies() {
  const [strategies,setStrategies]=useState<SavedStrategy[]>([]); const [error,setError]=useState(""); const navigate=useNavigate();
  const load=()=>client.get<SavedStrategy[]>("/strategies").then(r=>setStrategies(r.data)).catch((err:any)=>setError(err?.response?.data?.error || "Saved strategies could not be loaded."));
  useEffect(()=>{load();},[]);
  async function remove(id:number){
    const confirmed = window.confirm("Delete this strategy? Existing backtest results will be kept in your history.");
    if (!confirmed) return;
    try {
      await client.delete(`/strategies/${id}`);
      setStrategies(v=>v.filter(s=>s.id!==id));
      setError("");
    } catch (err:any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.error ||
        (status === 404 ? "That strategy no longer exists." : "Could not delete strategy. Please try again.");
      setError(message);
    }
  }
  return <div className="page-enter"><div className="eyebrow">Personal library</div><h1 className="page-title">Saved Strategies</h1><p className="page-lede">Strategies belong to your account; other users cannot see them.</p>{error&&<p className="form-error">{error}</p>}
    {!strategies.length ? <div className="surface panel" style={{marginTop:24}}><p className="muted">No saved strategies yet — build one and save it to see it here.</p></div> : <div className="grid" style={{marginTop:24}}>{strategies.map(s=><div className="surface panel" key={s.id} style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"center"}}><div><div style={{fontWeight:600}}>{s.name}</div><div className="muted" style={{fontSize:13,marginTop:6}}>Saved {new Date(s.createdAt).toLocaleDateString()}</div></div><div className="toolbar" style={{margin:0}}><button className="button button-secondary compact" onClick={()=>remove(s.id)}>Delete</button><button className="button button-primary compact" onClick={()=>navigate("/build",{state:{loadedStrategy:s}})}>Load</button></div></div>)}</div>}
  </div>;
}
