import { useEffect, useRef } from "react";
import { createChart, LineSeries, type Time } from "lightweight-charts";

interface NamedCurve { label: string; color: string; equityCurve: number[]; }
export default function ComparisonChart({ curves }: { curves: NamedCurve[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || !curves.length) return;
    const chart = createChart(ref.current, { width: ref.current.clientWidth, height: 340, layout: { background: { color: "#181D26" }, textColor: "#F6F3EC" }, grid: { vertLines: { color: "#2A2F3A" }, horzLines: { color: "#2A2F3A" } } });
    curves.forEach(curve => {
      const series = chart.addSeries(LineSeries, { color: curve.color, title: curve.label, lineWidth: 2 });
      const origin = Math.floor(new Date("2020-01-01T00:00:00Z").getTime() / 1000);
      series.setData(curve.equityCurve.map((value, i) => ({ time: (origin + i * 86400) as Time, value: Number(value) })));
    });
    const resize = () => ref.current && chart.applyOptions({ width: ref.current.clientWidth });
    window.addEventListener("resize", resize);
    return () => { window.removeEventListener("resize", resize); chart.remove(); };
  }, [curves]);
  return <div ref={ref} className="chart-box" />;
}
