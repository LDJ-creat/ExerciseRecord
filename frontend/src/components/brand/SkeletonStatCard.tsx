import { Skeleton } from './Skeleton'

export function SkeletonStatCard() {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="mt-3 h-8 w-24" />
    </div>
  )
}

export function SkeletonStatRow({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  )
}
