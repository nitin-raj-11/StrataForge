import { useEffect, useRef } from 'react'
import { createChart, ColorType, AreaSeries, type IChartApi } from 'lightweight-charts'
import type { CurvePoint } from '../../api/types'

export default function DrawdownChart({ data }: { data: CurvePoint[] }) {
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
      grid: {
        vertLines: { color: '#1B212D' },
        horzLines: { color: '#1B212D' },
      },
      rightPriceScale: { borderColor: '#232938' },
      timeScale: { borderColor: '#232938' },
      width: containerRef.current.clientWidth,
      height: 180,
    })
    chartRef.current = chart

    const series = chart.addSeries(AreaSeries, {
      lineColor: '#F0554B',
      topColor: 'rgba(240, 85, 75, 0.02)',
      bottomColor: 'rgba(240, 85, 75, 0.26)',
      lineWidth: 2,
      priceFormat: { type: 'custom', formatter: (p: number) => `${p.toFixed(1)}%` },
    })
    series.setData(data.map((d) => ({ time: d.time, value: d.value })))
    chart.timeScale().fitContent()

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth })
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data])

  return <div ref={containerRef} className="w-full" />
}
