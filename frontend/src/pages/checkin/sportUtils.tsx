import type { SportType } from '../../api/checkin'

const SPORT_CLASS: Record<string, string> = {
  running: 'sport-running',
  walking: 'sport-walking',
  cycling: 'sport-cycling',
  swimming: 'sport-swimming',
  fitness: 'sport-fitness',
  other: 'sport-other',
}

export function getSportClass(code: string) {
  return SPORT_CLASS[code] ?? 'sport-other'
}

interface SportBadgeProps {
  sport?: SportType | null
  size?: 'sm' | 'md'
}

export function SportBadge({ sport, size = 'md' }: SportBadgeProps) {
  if (!sport) return null
  const dim = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${getSportClass(sport.code)}`}
      style={{
        backgroundColor: 'color-mix(in srgb, var(--sport-color) 15%, white)',
        color: 'var(--sport-color)',
      }}
    >
      <span
        className={`${dim} rounded-full`}
        style={{ backgroundColor: 'var(--sport-color)' }}
        aria-hidden
      />
      {sport.name}
    </span>
  )
}

export function findSportType(types: SportType[], id: number) {
  return types.find((t) => t.id === id) ?? null
}
