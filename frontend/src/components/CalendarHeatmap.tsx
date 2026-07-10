import type { CalendarDay, CalendarData } from '../api/calendar'

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'] as const

const HEAT_COLORS: Record<number, string> = {
  0: 'var(--color-heatmap-0)',
  1: 'var(--color-heatmap-1)',
  2: 'var(--color-heatmap-2)',
  3: 'var(--color-heatmap-3)',
  4: 'var(--color-heatmap-4)',
}

export function heatColor(level: number) {
  return HEAT_COLORS[level] ?? HEAT_COLORS[0]
}

export const HEAT_LEGEND = [
  { level: 0, label: '无运动' },
  { level: 1, label: '轻度' },
  { level: 2, label: '适中' },
  { level: 3, label: '活跃' },
  { level: 4, label: '高强度' },
] as const

interface CalendarHeatmapProps {
  year: number
  month: number
  days: CalendarDay[]
  onDayClick: (day: CalendarDay) => void
  legend?: React.ReactNode
  compact?: boolean
}

function buildGridCells(year: number, month: number, days: CalendarDay[]) {
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const byDate = new Map(days.map((d) => [d.date, d]))

  const cells: (CalendarDay | null)[] = []
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push(
      byDate.get(dateStr) ?? {
        date: dateStr,
        checked: false,
        count: 0,
        total_duration: 0,
        total_distance: 0,
        heat_level: 0,
      },
    )
  }
  return cells
}

function isToday(dateStr: string) {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return dateStr === `${y}-${m}-${d}`
}

export default function CalendarHeatmap({
  year,
  month,
  days,
  onDayClick,
  legend,
  compact = false,
}: CalendarHeatmapProps) {
  const cells = buildGridCells(year, month, days)

  const cellClass = compact
    ? 'min-h-[2.75rem] sm:min-h-[3rem]'
    : 'min-h-[4.5rem] sm:min-h-[5rem] md:min-h-[5.5rem]'

  const emptyClass = compact ? 'min-h-[2.75rem] sm:min-h-[3rem]' : 'min-h-[4.5rem] sm:min-h-[5rem] md:min-h-[5.5rem]'

  return (
    <div>
      {legend}

      <div className="mb-2 grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1 text-center font-[family-name:var(--font-body)] text-xs font-medium text-[var(--color-text-muted)] sm:text-sm"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="grid" aria-label={`${year}年${month}月运动日历`}>
        {cells.map((day, index) =>
          day ? (
            <button
              key={day.date}
              type="button"
              role="gridcell"
              onClick={() => onDayClick(day)}
              aria-label={`${day.date}${day.checked ? `，${day.count}次打卡，${day.total_duration}分钟` : '，未打卡'}`}
              title={
                day.checked
                  ? `${day.date} · ${day.total_duration} 分钟 · ${day.count} 次`
                  : `${day.date} · 未打卡`
              }
              className={[
                'flex w-full flex-col items-center justify-center rounded-[var(--radius-sm)]',
                cellClass,
                'font-[family-name:var(--font-data)] transition-transform',
                'hover:scale-[1.03] motion-reduce:hover:scale-100 pressable',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
                isToday(day.date) ? 'ring-2 ring-[var(--color-primary)] ring-offset-1' : '',
                day.checked ? 'shadow-sm' : '',
              ].join(' ')}
              style={{
                backgroundColor: heatColor(day.heat_level),
                color: day.heat_level >= 4 ? '#fff' : 'var(--color-text)',
              }}
            >
              <span className={compact ? 'text-xs' : 'text-sm sm:text-base'}>{Number(day.date.slice(-2))}</span>
              {day.checked && (
                <span className={compact ? 'mt-0.5 text-[9px] opacity-90' : 'mt-1 text-[10px] font-medium opacity-90 sm:text-xs'}>
                  {day.total_duration}′
                </span>
              )}
              {day.checked && day.count > 1 && !compact && (
                <span className="mt-0.5 text-[9px] opacity-75">{day.count}次</span>
              )}
            </button>
          ) : (
            <span key={`empty-${index}`} role="presentation" aria-hidden className={emptyClass} />
          ),
        )}
      </div>
    </div>
  )
}

export function computeMonthSummary(days: CalendarDay[]) {
  const activeDays = days.filter((d) => d.checked)
  return {
    checkInDays: activeDays.length,
    totalDuration: activeDays.reduce((sum, d) => sum + d.total_duration, 0),
    totalDistance: activeDays.reduce((sum, d) => sum + (d.total_distance ?? 0), 0),
    totalSessions: activeDays.reduce((sum, d) => sum + d.count, 0),
    peakDay: activeDays.reduce<CalendarDay | null>(
      (best, d) => (!best || d.total_duration > best.total_duration ? d : best),
      null,
    ),
  }
}

export function MonthSummaryPanel({ calendar }: { calendar: CalendarData }) {
  const summary = computeMonthSummary(calendar.days)

  return (
    <aside className="flex flex-col gap-4">
      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
        <h3 className="text-heading text-[var(--color-text)]">本月概览</h3>
        <dl className="mt-4 space-y-4">
          <div>
            <dt className="text-body-sm text-[var(--color-text-muted)]">打卡天数</dt>
            <dd className="text-data-lg text-streak-number">{summary.checkInDays}</dd>
          </div>
          <div>
            <dt className="text-body-sm text-[var(--color-text-muted)]">运动时长</dt>
            <dd>
              <span className="text-data-lg text-[var(--color-text)]">{summary.totalDuration}</span>
              <span className="ml-1 text-body-sm text-[var(--color-text-muted)]">分钟</span>
            </dd>
          </div>
          <div>
            <dt className="text-body-sm text-[var(--color-text-muted)]">打卡次数</dt>
            <dd>
              <span className="text-data-lg text-[var(--color-text)]">{summary.totalSessions}</span>
              <span className="ml-1 text-body-sm text-[var(--color-text-muted)]">次</span>
            </dd>
          </div>
          {summary.totalDistance > 0 && (
            <div>
              <dt className="text-body-sm text-[var(--color-text-muted)]">累计距离</dt>
              <dd>
                <span className="text-data-lg text-[var(--color-text)]">{summary.totalDistance.toFixed(1)}</span>
                <span className="ml-1 text-body-sm text-[var(--color-text-muted)]">km</span>
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
        <h3 className="text-heading text-[var(--color-text)]">连续记录</h3>
        <p className="mt-3 flex items-baseline gap-1.5">
          <span className="text-data-lg text-streak-number">{calendar.streak}</span>
          <span className="text-body-sm text-[var(--color-text-muted)]">天</span>
        </p>
        <p className="mt-2 text-body-sm text-[var(--color-text-muted)]">
          {calendar.streak > 0 ? '保持节奏，继续加油。' : '今天开始新的连续记录吧。'}
        </p>
      </div>

      {summary.peakDay && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
          <p className="text-xs font-medium text-[var(--color-text-muted)]">本月最长运动</p>
          <p className="mt-1 text-data-md text-[var(--color-text)]">
            {summary.peakDay.date.slice(5).replace('-', '/')} · {summary.peakDay.total_duration} 分钟
          </p>
        </div>
      )}
    </aside>
  )
}
