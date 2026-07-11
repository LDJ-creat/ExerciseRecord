import type { PersonalStatsSummary, StatsPeriod, TrendPoint } from '../../api/stats'

export type TrendMetric = 'duration' | 'distance' | 'calories'

export const METRIC_CONFIG: Record<
  TrendMetric,
  {
    label: string
    unit: string
    title: string
    dataKey: TrendMetric
    color: string
    formatValue: (value: number) => string
  }
> = {
  duration: {
    label: '时长',
    unit: '分钟',
    title: '每日运动时长',
    dataKey: 'duration',
    color: 'var(--color-secondary)',
    formatValue: (value) => `${value} 分钟`,
  },
  distance: {
    label: '距离',
    unit: '公里',
    title: '每日运动距离',
    dataKey: 'distance',
    color: 'var(--color-primary)',
    formatValue: (value) => `${value.toFixed(1)} 公里`,
  },
  calories: {
    label: '卡路里',
    unit: '千卡',
    title: '每日消耗卡路里',
    dataKey: 'calories',
    color: 'var(--color-accent)',
    formatValue: (value) => `${value} 千卡`,
  },
}

export function getAvailableMetrics(summary: PersonalStatsSummary): TrendMetric[] {
  const metrics: TrendMetric[] = ['duration']
  if (summary.total_distance > 0) metrics.push('distance')
  if (summary.total_calories > 0) metrics.push('calories')
  return metrics
}

function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function beginningOfWeek(d: Date) {
  const copy = new Date(d)
  const weekday = copy.getDay()
  const offset = weekday === 0 ? 6 : weekday - 1
  copy.setDate(copy.getDate() - offset)
  return copy
}

function getPeriodRange(period: StatsPeriod): { start: Date; end: Date } | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  switch (period) {
    case 'day':
      return { start: today, end: today }
    case 'week':
      return { start: beginningOfWeek(today), end: today }
    case 'month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      return { start, end: today }
    }
    case 'all':
      return null
  }
}

function enumerateDates(start: Date, end: Date) {
  const dates: string[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    dates.push(formatDate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

function emptyTrendPoint(date: string): TrendPoint {
  return {
    date,
    duration: 0,
    distance: 0,
    calories: 0,
    count: 0,
  }
}

export function normalizeTrendDate(date: string) {
  return date.slice(0, 10)
}

export function normalizeTrendPoint(raw: TrendPoint): TrendPoint {
  return {
    date: normalizeTrendDate(raw.date),
    duration: Number(raw.duration ?? 0),
    distance: Number(raw.distance ?? 0),
    calories: Number(raw.calories ?? 0),
    count: Number(raw.count ?? 0),
    primary_sport: raw.primary_sport,
  }
}

export function fillTrendSeries(trend: TrendPoint[], period: StatsPeriod): TrendPoint[] {
  const sorted = trend.map(normalizeTrendPoint).sort((a, b) => a.date.localeCompare(b.date))
  const range = getPeriodRange(period)
  if (!range) return sorted

  const byDate = new Map(sorted.map((point) => [point.date, point]))
  return enumerateDates(range.start, range.end).map(
    (date) => byDate.get(date) ?? emptyTrendPoint(date),
  )
}

export function countActiveDays(series: TrendPoint[]) {
  return series.filter((point) => point.count > 0 || point.duration > 0).length
}

export function getMetricValue(point: TrendPoint, metric: TrendMetric) {
  return point[metric] ?? 0
}

export function formatTrendDateLabel(date: string) {
  const [, month, day] = date.split('-')
  return `${Number(month)}/${Number(day)}`
}
