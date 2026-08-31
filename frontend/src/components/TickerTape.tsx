import { useEffect, useState } from "react";
import client from "../api/client";
import { useCurrency } from "../context/CurrencyContext";

interface TickerItem { ticker: string; companyName: string; lastClose: number; changePercent: number; }
export default function TickerTape() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const { formatMoney } = useCurrency();
  useEffect(() => { client.get<TickerItem[]>("/tickers/summary").then(res => setItems(res.data)).catch(() => {}); }, []);
  if (!items.length) return null;
  return <div className="ticker-wrap" aria-label="Market ticker"><div className="ticker-track">
    {[...items, ...items].map((item,i)=><span className="ticker-item" key={`${item.ticker}-${i}`}>{item.ticker} <span className={item.changePercent >= 0 ? "gain" : "loss"}>{formatMoney(item.lastClose)} ({item.changePercent>=0?"+":""}{item.changePercent.toFixed(2)}%)</span></span>)}
  </div></div>;
}
