import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="panel p-16 flex flex-col items-center text-center gap-3 max-w-lg mx-auto">
      <p className="mono-num text-4xl text-ink-faint">404</p>
      <p className="text-[15px] font-medium">This page doesn't exist.</p>
      <p className="text-[13px] text-ink-faint">Check the link, or start a new strategy from scratch.</p>
      <Link to="/build" className="btn-primary mt-2">
        Back to strategy builder
      </Link>
    </div>
  )
}
