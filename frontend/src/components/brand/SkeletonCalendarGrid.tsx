import { Skeleton } from './Skeleton'

export function SkeletonCalendarGrid() {
  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {Array.from({ length: 35 }, (_, i) => (
        <Skeleton key={i} className="min-h-[4.5rem] w-full sm:min-h-[5rem] md:min-h-[5.5rem]" />
      ))}
    </div>
  )
}

export function SkeletonTimeline({ items = 3 }: { items?: number }) {
  return (
    <ul className="relative flex flex-col gap-4 pl-4">
      {Array.from({ length: items }, (_, i) => (
        <li key={i} className="relative pl-6">
          <Skeleton className="absolute left-0 top-3 h-3.5 w-3.5 rounded-full" />
          <Skeleton className="min-h-24 w-full rounded-[var(--radius-md)]" />
        </li>
      ))}
    </ul>
  )
}
