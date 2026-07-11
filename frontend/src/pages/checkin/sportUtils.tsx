import type { SportType } from '../../api/checkin'
import { SportIcon as SportIconSvg } from '../../components/icons/AppIcons'

const SPORT_CLASS: Record<string, string> = {
  running: 'sport-running',
  walking: 'sport-walking',
  cycling: 'sport-cycling',
  swimming: 'sport-swimming',
  fitness: 'sport-fitness',
  other: 'sport-other',
}

export function getSportClass(code: string, isCustom?: number) {
  if (isCustom === 1 || code.startsWith('custom_')) return 'sport-custom'
  return SPORT_CLASS[code] ?? 'sport-other'
}

export function SportIcon({ code, className = 'h-6 w-6' }: { code: string; className?: string }) {
  return <SportIconSvg code={code} className={className} />
}

interface SportBadgeProps {
  sport?: SportType | null
  size?: 'sm' | 'md'
}

export function SportBadge({ sport, size = 'md' }: SportBadgeProps) {
  if (!sport) return null
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${getSportClass(sport.code, sport.is_custom)}`}
      style={{
        backgroundColor: 'color-mix(in srgb, var(--sport-color) 15%, white)',
        color: 'var(--sport-color)',
      }}
    >
      <SportIcon code={sport.code} className={iconSize} />
      {sport.name}
    </span>
  )
}

export function findSportType(types: SportType[], id: number) {
  return types.find((t) => t.id === id) ?? null
}
