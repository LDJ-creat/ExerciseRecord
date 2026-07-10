import { Skeleton } from './Skeleton'

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
      <Skeleton className="mb-4 h-5 w-32" />
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  )
}
