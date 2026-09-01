import { useEffect, useRef, useState } from "react";
import { createChart, LineSeries, type Time } from "lightweight-charts";

export default function EquityChart({ values, multiplier = 1, currency = "USD" }: { values: number[]; multiplier?: number; currency?: string }) {
  const ref = useRef<HTMLDivElement>(null);
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
    if (!ref.current || !values.length) return;
    const bgColor = theme === 'light' ? '#ffffff' : '#121820';
    const textColor = theme === 'light' ? '#14181f' : '#F6F3EC';
    const gridColor = theme === 'light' ? '#e1dacb' : '#252d37';
    const chart = createChart(ref.current, { width: ref.current.clientWidth, height: 280, layout: { background: { color: bgColor }, textColor }, grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } }, localization: { priceFormatter: (value: number) => `${currency === "INR" ? "₹" : "$"}${value.toFixed(0)}` } });
    const series = chart.addSeries(LineSeries, { color: "#E8A63B", lineWidth: 2 });
    const origin = new Date("2020-01-01T00:00:00Z").getTime();
    series.setData(values.map((value,i)=>({ time:(Math.floor(origin/1000)+i*86400) as Time, value:Number(value)*multiplier })));
    const resize=()=>ref.current&&chart.applyOptions({width:ref.current.clientWidth}); window.addEventListener("resize",resize); return()=>{window.removeEventListener("resize",resize);chart.remove();};
  }, [values,multiplier,currency,theme]);
  return <div ref={ref} className="chart-box"/>;
}
