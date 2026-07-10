interface PageHeaderProps {
  title: string
  subtitle?: string
  meta?: React.ReactNode
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, meta, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-display-lg text-[var(--color-text)]">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-body-sm text-[var(--color-text-muted)]">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        {meta}
        {actions}
      </div>
    </div>
  )
}
