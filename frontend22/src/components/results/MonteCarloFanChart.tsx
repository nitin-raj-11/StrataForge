import type { MonteCarloResult } from '../../lib/monteCarlo'

const WIDTH = 720
const HEIGHT = 220
const PAD = 8

function toPoints(values: number[], min: number, max: number): string {
  const range = max - min || 1
  return values
    .map((v, i) => {
      const x = PAD + (i / (values.length - 1)) * (WIDTH - PAD * 2)
      const y = HEIGHT - PAD - ((v - min) / range) * (HEIGHT - PAD * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function toArea(top: number[], bottom: number[], min: number, max: number): string {
  const range = max - min || 1
  const n = top.length
  const topPts = top.map((v, i) => {
    const x = PAD + (i / (n - 1)) * (WIDTH - PAD * 2)
    const y = HEIGHT - PAD - ((v - min) / range) * (HEIGHT - PAD * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const bottomPts = [...bottom]
    .map((v, i) => {
      const x = PAD + (i / (n - 1)) * (WIDTH - PAD * 2)
      const y = HEIGHT - PAD - ((v - min) / range) * (HEIGHT - PAD * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .reverse()
  return `M${topPts.join(' L')} L${bottomPts.join(' L')} Z`
}

export default function MonteCarloFanChart({ result }: { result: MonteCarloResult }) {
  const { bands } = result
  const allValues = [...bands.p5, ...bands.p95]
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" preserveAspectRatio="none">
      <path d={toArea(bands.p95, bands.p5, min, max)} fill="rgba(227, 160, 8, 0.08)" />
      <path d={toArea(bands.p75, bands.p25, min, max)} fill="rgba(227, 160, 8, 0.16)" />
      <polyline points={toPoints(bands.p50, min, max)} fill="none" stroke="#E3A008" strokeWidth={2} />
      <polyline
        points={toPoints(bands.p5, min, max)}
        fill="none"
        stroke="#8890A0"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <polyline
        points={toPoints(bands.p95, min, max)}
        fill="none"
        stroke="#8890A0"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
    </svg>
  )
}
