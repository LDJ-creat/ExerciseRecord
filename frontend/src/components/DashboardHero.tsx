import { Link } from 'react-router-dom'
import { LaneStripe } from './brand/LaneStripe'

export function DashboardHero() {
  return (
    <section
      className="relative overflow-hidden rounded-[var(--radius-md)] p-6 md:p-8"
      style={{
        background: 'var(--gradient-dawn)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="relative z-10">
        <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-text-muted)]">
          今日状态
        </p>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="font-[family-name:var(--font-data)] text-4xl font-semibold text-[var(--color-primary)]">
            —
          </span>
          <span className="font-[family-name:var(--font-body)] text-sm text-[var(--color-text-muted)]">
            连续打卡天数
          </span>
        </div>
        <p className="mt-3 max-w-md font-[family-name:var(--font-body)] text-[var(--color-text-muted)]">
          今天还没有记录，选一种运动，把今天算进节奏里。
        </p>
        <div className="mt-5">
          <Link
            to="/checkin"
            className={[
              'inline-flex items-center justify-center rounded-[var(--radius-sm)] px-4 py-2',
              'bg-[var(--color-primary)] font-[family-name:var(--font-body)] text-sm font-medium text-white',
              'transition-colors hover:bg-[var(--color-primary-hover)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
            ].join(' ')}
          >
            快捷打卡
          </Link>
        </div>
      </div>
      <div className="absolute bottom-4 right-6 hidden md:block">
        <LaneStripe />
      </div>
    </section>
  )
}
