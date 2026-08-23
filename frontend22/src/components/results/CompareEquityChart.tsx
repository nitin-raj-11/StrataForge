import { useEffect, useRef } from 'react'
import { createChart, ColorType, LineSeries, type IChartApi } from 'lightweight-charts'
import type { CurvePoint } from '../../api/types'

export default function CompareEquityChart({
  seriesA,
  seriesB,
  labelA,
  labelB,
}: {
  seriesA: CurvePoint[]
  seriesB: CurvePoint[]
  labelA: string
  labelB: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8890A0',
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: 11,
      },
      grid: { vertLines: { color: '#1B212D' }, horzLines: { color: '#1B212D' } },
      rightPriceScale: { borderColor: '#232938' },
      timeScale: { borderColor: '#232938' },
      width: containerRef.current.clientWidth,
      height: 340,
    })
    chartRef.current = chart

    const a = chart.addSeries(LineSeries, { color: '#E3A008', lineWidth: 2 })
    a.setData(seriesA.map((d) => ({ time: d.time, value: d.value })))

    const b = chart.addSeries(LineSeries, { color: '#38BDF8', lineWidth: 2 })
    b.setData(seriesB.map((d) => ({ time: d.time, value: d.value })))

    chart.timeScale().fitContent()

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth })
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [seriesA, seriesB])

  return (
    <div>
      <div className="flex items-center gap-4 mb-2 text-[12px] font-mono">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 bg-accent-amber inline-block" /> {labelA}
        </span>
        <span className="flex items-center gap-1.5 text-[#38BDF8]">
          <span className="h-0.5 w-3 bg-[#38BDF8] inline-block" /> {labelB}
        </span>
      </div>
      <div ref={containerRef} className="w-full" />
    </div>
  )
}
