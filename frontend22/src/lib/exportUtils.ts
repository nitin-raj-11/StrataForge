import type { Trade } from '../api/types'

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function downloadTradesCSV(trades: Trade[], filename: string) {
  const header = ['Entry Date', 'Exit Date', 'Entry Price', 'Exit Price', 'P&L', 'P&L %']
  const rows = trades.map((t) => [
    t.entryDate,
    t.exitDate,
    t.entryPrice.toFixed(2),
    t.exitPrice.toFixed(2),
    t.pnl.toFixed(2),
    t.pnlPercent.toFixed(2),
  ])
  const csv = [header, ...rows].map((row) => row.join(',')).join('\n')
  download(filename, csv, 'text/csv;charset=utf-8;')
}

export function downloadJSON(data: unknown, filename: string) {
  download(filename, JSON.stringify(data, null, 2), 'application/json;charset=utf-8;')
}

export async function copyJSONToClipboard(data: unknown): Promise<boolean> {
  const text = JSON.stringify(data, null, 2)
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
