import { Link } from 'react-router-dom'
import { IconFlame } from '../icons/AppIcons'
import { useDashboardStatus } from '../../hooks/useDashboardStatus'

export function StreakBadge() {
  const { streak, loading } = useDashboardStatus()

  if (loading) return null

  return (
    <Link
      to="/calendar"
      className={[
        'hidden items-center gap-1.5 rounded-[var(--radius-full)] px-3 py-1',
        'bg-[color-mix(in_srgb,var(--color-primary)_12%,white)]',
        'text-xs font-medium text-[var(--color-primary)]',
        'transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--color-primary)_20%,white)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
        'sm:inline-flex pressable',
      ].join(' ')}
      aria-label={`连续打卡 ${streak} 天，查看日历`}
    >
      <IconFlame size={14} />
      <span>连续 {streak} 天</span>
    </Link>
  )
}
