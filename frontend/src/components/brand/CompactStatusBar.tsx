import { Button } from '@heroui/react'
import { Link } from 'react-router-dom'
import { LaneStripe } from './LaneStripe'

interface CompactStatusBarProps {
  streak: number
  todayChecked: boolean
  todayDuration: number
  loading?: boolean
  onQuickCheckIn?: () => void
}

export function CompactStatusBar({
  streak,
  todayChecked,
  todayDuration,
  loading = false,
  onQuickCheckIn,
}: CompactStatusBarProps) {
  return (
    <section
      className="flex flex-wrap items-center gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--surface-status)] px-4 py-3 md:px-5 md:py-3.5"
      style={{ boxShadow: 'var(--shadow-card)' }}
      aria-label="今日运动状态"
    >
      <LaneStripe className="hidden max-w-[100px] shrink-0 sm:flex" />

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          to="/calendar"
          className="flex items-baseline gap-1.5 transition-colors hover:text-[var(--color-primary)]"
        >
          <span className="text-body-sm text-[var(--color-text-muted)]">连续</span>
          <span className={loading ? 'text-data-lg text-[var(--color-text-muted)]' : 'text-data-lg text-streak-number'}>
            {loading ? '—' : streak}
          </span>
          <span className="text-body-sm text-[var(--color-text-muted)]">天</span>
        </Link>

        <span className="hidden h-4 w-px bg-[var(--color-border)] sm:block" aria-hidden />

        {loading ? (
          <span className="text-body-sm text-[var(--color-text-muted)]">加载中…</span>
        ) : todayChecked ? (
          <span className="rounded-full bg-[var(--color-secondary)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--color-secondary)]">
            今日已完成 · {todayDuration} 分钟
          </span>
        ) : (
          <span className="text-body-sm text-[var(--color-text-muted)]">
            今天还没有记录
          </span>
        )}
      </div>

      {!todayChecked && !loading && onQuickCheckIn && (
        <Button variant="primary" size="sm" className="pressable shrink-0" onPress={onQuickCheckIn}>
          快捷打卡
        </Button>
      )}
    </section>
  )
}
