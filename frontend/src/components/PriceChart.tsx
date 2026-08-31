import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, CrosshairMode, type IChartApi, type CandlestickData, type Time, createSeriesMarkers } from "lightweight-charts";

interface Bar { time: string; open: number; high: number; low: number; close: number; }
interface Trade { entryDate: string; exitDate: string; entryPrice: number; exitPrice: number; pnl: number; }

export default function PriceChart({ bars, trades, multiplier = 1, currency = "USD" }: { bars: Bar[]; trades: Trade[]; multiplier?: number; currency?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<string>(document.documentElement.dataset.theme || 'dark');

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.dataset.theme || 'dark';
      setTheme(newTheme);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !bars.length) return;
    const bgColor = theme === 'light' ? '#ffffff' : '#121820';
    const textColor = theme === 'light' ? '#14181f' : '#F6F3EC';
    const gridColor = theme === 'light' ? '#e1dacb' : '#252d37';
    const chart: IChartApi = createChart(containerRef.current, { width: containerRef.current.clientWidth, height: 420, layout: { background: { color: bgColor }, textColor }, grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } }, crosshair: { mode: CrosshairMode.Normal }, localization: { priceFormatter: (value) => `${currency === "INR" ? "₹" : "$"}${value.toFixed(2)}` } });
    const series = chart.addSeries(CandlestickSeries, { upColor: "#3FA37B", downColor: "#D1554E", borderVisible: false, wickUpColor: "#3FA37B", wickDownColor: "#D1554E" });
    const data: CandlestickData[] = bars.map(b => ({ time: b.time as Time, open: b.open * multiplier, high: b.high * multiplier, low: b.low * multiplier, close: b.close * multiplier }));
    series.setData(data);
    const markers = trades.flatMap(t => [
      { time: t.entryDate as Time, position: "belowBar" as const, color: "#E8A63B", shape: "arrowUp" as const, text: "Buy" },
      { time: t.exitDate as Time, position: "aboveBar" as const, color: t.pnl >= 0 ? "#3FA37B" : "#D1554E", shape: "arrowDown" as const, text: "Sell" },
    ]);
    createSeriesMarkers(series, markers);
    const resize = () => containerRef.current && chart.applyOptions({ width: containerRef.current.clientWidth });
    window.addEventListener("resize", resize); return () => { window.removeEventListener("resize", resize); chart.remove(); };
  }, [bars, trades, multiplier, currency, theme]);
  return <div ref={containerRef} className="chart-box" />;
}
