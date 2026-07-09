interface PlaceholderPageProps {
  title: string
  description: string
  taskId?: string
}

export function PlaceholderPage({ title, description, taskId }: PlaceholderPageProps) {
  return (
    <div
      className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-8 text-center"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">
        {title}
      </h1>
      <p className="mt-2 font-[family-name:var(--font-body)] text-[var(--color-text-muted)]">
        {description}
      </p>
      {taskId && (
        <p className="mt-4 font-[family-name:var(--font-data)] text-xs text-[var(--color-text-muted)]">
          开发任务：{taskId}
        </p>
      )}
    </div>
  )
}
