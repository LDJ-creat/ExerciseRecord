import type { RankingDimension, RankingEntry } from '../../api/stats'

const PODIUM_ORDER = [2, 1, 3] as const
const PODIUM_HEIGHTS: Record<number, string> = {
  1: 'h-32',
  2: 'h-24',
  3: 'h-20',
}
const PODIUM_COLORS: Record<number, string> = {
  1: 'var(--color-primary)',
  2: 'var(--color-accent)',
  3: '#CD7F32',
}

interface RankingPodiumProps {
  topThree: RankingEntry[]
  dimension: RankingDimension
  unit: string
  currentUserId?: number
  formatValue: (dimension: RankingDimension, value: number) => string
}

export function RankingPodium({
  topThree,
  dimension,
  unit,
  currentUserId,
  formatValue,
}: RankingPodiumProps) {
  const byRank = new Map(topThree.map((entry) => [entry.rank, entry]))

  if (byRank.size === 0) return null

  return (
    <div className="flex items-end justify-center gap-3 px-2 py-4 sm:gap-6">
      {PODIUM_ORDER.map((rank) => {
        const entry = byRank.get(rank)
        if (!entry) {
          return <div key={rank} className="w-24 sm:w-28" aria-hidden />
        }
        const isMe = entry.user_id === currentUserId
        return (
          <div
            key={entry.user_id}
            className={[
              'flex w-24 flex-col items-center sm:w-28',
              'transition-transform duration-[var(--motion-fast)] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 pressable',
            ].join(' ')}
          >
            <p
              className={[
                'mb-2 max-w-full truncate text-center text-sm font-medium',
                isMe ? 'text-[var(--color-secondary)]' : 'text-[var(--color-text)]',
              ].join(' ')}
            >
              {entry.nickname}
              {isMe ? '（我）' : ''}
            </p>
            <div
              className={[
                'flex w-full flex-col items-center justify-end rounded-t-[var(--radius-md)] px-2 pb-3 pt-4',
                PODIUM_HEIGHTS[rank],
              ].join(' ')}
              style={{ backgroundColor: `color-mix(in srgb, ${PODIUM_COLORS[rank]} 18%, white)` }}
            >
              <span
                className="font-[family-name:var(--font-display)] text-2xl font-bold"
                style={{ color: PODIUM_COLORS[rank] }}
              >
                #{rank}
              </span>
              <span className="mt-1 font-[family-name:var(--font-data)] text-sm font-semibold text-[var(--color-text)]">
                {formatValue(dimension, entry.value)}
                <span className="ml-0.5 text-xs font-normal text-[var(--color-text-muted)]">{unit}</span>
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
