import type { CalendarDay } from '../api/calendar'

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

interface CalendarHeatmapProps {
  year: number
  month: number
  days: CalendarDay[]
  onDayClick: (day: CalendarDay) => void
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

export default function CalendarHeatmap({ year, month, days, onDayClick }: CalendarHeatmapProps) {
  const cells = buildGridCells(year, month, days)

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1 text-center font-[family-name:var(--font-body)] text-xs font-medium text-[var(--color-text-muted)]"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5" role="grid" aria-label={`${year}年${month}月运动日历`}>
        {cells.map((day, index) =>
          day ? (
            <button
              key={day.date}
              type="button"
              role="gridcell"
              onClick={() => onDayClick(day)}
              aria-label={`${day.date}${day.checked ? `，${day.count}次打卡，${day.total_duration}分钟` : '，未打卡'}`}
              className={[
                'flex aspect-square flex-col items-center justify-center rounded-[var(--radius-sm)]',
                'font-[family-name:var(--font-data)] text-sm transition-transform',
                'hover:scale-105 motion-reduce:hover:scale-100',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
                isToday(day.date) ? 'ring-2 ring-[var(--color-primary)] ring-offset-1' : '',
              ].join(' ')}
              style={{
                backgroundColor: heatColor(day.heat_level),
                color: day.heat_level >= 4 ? '#fff' : 'var(--color-text)',
              }}
            >
              <span>{Number(day.date.slice(-2))}</span>
              {day.checked && (
                <span className="mt-0.5 text-[10px] opacity-80">{day.total_duration}′</span>
              )}
            </button>
          ) : (
            <span key={`empty-${index}`} role="presentation" aria-hidden />
          ),
        )}
      </div>
    </div>
  )
}

export const HEAT_LEGEND = [
  { level: 0, label: '无运动' },
  { level: 1, label: '轻度' },
  { level: 2, label: '适中' },
  { level: 3, label: '活跃' },
  { level: 4, label: '高强度' },
] as const
