import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, AreaSeries, type IChartApi } from 'lightweight-charts'
import type { CurvePoint } from '../../api/types'
import { formatCurrency, formatDate } from '../../lib/format'

export default function EquityCurveChart({ data }: { data: CurvePoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const [hover, setHover] = useState<CurvePoint | null>(null)

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
      height: 320,
    })
    chartRef.current = chart

    const series = chart.addSeries(AreaSeries, {
      lineColor: '#34D399',
      topColor: 'rgba(52, 211, 153, 0.24)',
      bottomColor: 'rgba(52, 211, 153, 0.02)',
      lineWidth: 2,
      priceFormat: { type: 'custom', formatter: (p: number) => `$${p.toFixed(0)}` },
    })
    series.setData(data.map((d) => ({ time: d.time, value: d.value })))
    chart.timeScale().fitContent()

    chart.subscribeCrosshairMove((param) => {
      if (!param.time) {
        setHover(null)
        return
      }
      const point = data.find((d) => d.time === param.time)
      setHover(point ?? null)
    })

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth })
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data])

  const latest = data[data.length - 1]
  const shown = hover ?? latest

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-2 text-[13px]">
        <span className="mono-num text-lg font-semibold">{shown ? formatCurrency(shown.value) : '—'}</span>
        <span className="text-ink-faint font-mono text-[12px]">{shown ? formatDate(shown.time) : ''}</span>
        {!hover && <span className="text-ink-faint text-[11px]">(latest — hover to inspect)</span>}
      </div>
      <div ref={containerRef} className="w-full" />
    </div>
  )
}
