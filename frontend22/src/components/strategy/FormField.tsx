import type { ReactNode } from 'react'

export function FormField({
  label,
  error,
  children,
  hint,
}: {
  label: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-ink-muted mb-1.5 block">{label}</span>
      {children}
      {hint && !error && <p className="text-[12px] text-ink-faint mt-1">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </label>
  )
}

export function SectionCard({
  title,
  eyebrow,
  action,
  children,
}: {
  title: string
  eyebrow?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="panel p-5 sm:p-6">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          {eyebrow && <p className="label-eyebrow mb-1">{eyebrow}</p>}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
