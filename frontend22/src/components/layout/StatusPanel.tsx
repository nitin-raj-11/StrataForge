import { Link } from 'react-router-dom'

export function LoadingPanel({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="panel p-14 flex flex-col items-center justify-center gap-3 text-ink-faint">
      <span className="h-6 w-6 rounded-full border-2 border-base-border border-t-accent-amber animate-spin" />
      <p className="text-[13px] font-mono">{label}</p>
    </div>
  )
}

export function ErrorPanel({ title, message }: { title: string; message?: string }) {
  return (
    <div className="panel p-14 flex flex-col items-center justify-center gap-3 text-center">
      <div className="h-10 w-10 rounded-full bg-loss/10 border border-loss/30 flex items-center justify-center text-loss text-lg">
        !
      </div>
      <p className="text-[15px] font-medium">{title}</p>
      {message && <p className="text-[13px] text-ink-faint max-w-sm">{message}</p>}
      <Link to="/build" className="btn-secondary mt-2">
        Back to strategy builder
      </Link>
    </div>
  )
}
