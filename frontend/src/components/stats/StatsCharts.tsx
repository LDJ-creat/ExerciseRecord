import { useEffect, useMemo, useState } from 'react'
import { Button } from '@heroui/react'
import {
  Area,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
} from 'recharts'
import type { PersonalStatsData, StatsPeriod } from '../../api/stats'
import { EmptyState } from '../brand/EmptyState'
import {
  METRIC_CONFIG,
  countActiveDays,
  fillTrendSeries,
  formatTrendDateLabel,
  getAvailableMetrics,
  getMetricValue,
  type TrendMetric,
} from './trendUtils'

const SPORT_COLORS: Record<number, string> = {
  1: '#FF5C35',
  2: '#8B5CF6',
  3: '#3B82F6',
  4: '#06B6D4',
  5: '#F59E0B',
  6: '#94A3B8',
}

function sportColor(sportTypeId: number) {
  return SPORT_COLORS[sportTypeId] ?? SPORT_COLORS[6]
}

export function StatsDistributionChart({ data }: { data: PersonalStatsData }) {
  const pieData = useMemo(
    () =>
      (data.by_sport_type ?? []).map((item) => ({
        name: item.name,
        value: item.count,
        percent: item.percent,
        fill: sportColor(item.sport_type_id),
      })),
    [data],
  )

  return (
    <section
      className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-5"
      style={{ boxShadow: 'var(--shadow-card)' }}
      aria-label="运动类型分布"
    >
      <h2 className="text-lg font-semibold text-[var(--color-text)]">类型分布</h2>
      {pieData.length === 0 ? (
        <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
          当前周期暂无打卡记录
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={280} className="mt-4">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
            >
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, item) => {
                const count = typeof value === 'number' ? value : Number(value ?? 0)
                const percent = item.payload?.percent ?? 0
                const name = item.payload?.name ?? ''
                return [`${count} 次 (${percent}%)`, name]
              }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </section>
  )
}

interface StatsTrendChartProps {
  data: PersonalStatsData
  period: StatsPeriod
}

export function StatsTrendChart({ data, period }: StatsTrendChartProps) {
  const availableMetrics = useMemo(
    () => getAvailableMetrics(data.summary),
    [data.summary],
  )
  const [metric, setMetric] = useState<TrendMetric>('duration')

  useEffect(() => {
    if (!availableMetrics.includes(metric)) {
      setMetric('duration')
    }
  }, [availableMetrics, metric])

  const config = METRIC_CONFIG[metric]
  const chartData = useMemo(() => {
    const filled = fillTrendSeries(data.trend ?? [], period)
    return filled.map((point) => ({
      ...point,
      value: getMetricValue(point, metric),
    }))
  }, [data.trend, period, metric])

  const activeDays = useMemo(() => countActiveDays(chartData), [chartData])
  const hasData = data.summary.total_count > 0

  return (
    <section
      className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-5"
      style={{ boxShadow: 'var(--shadow-card)' }}
      aria-label="运动趋势"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">{config.title}</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {hasData ? `本周期共打卡 ${activeDays} 天` : '记录每日运动变化'}
          </p>
        </div>

        {availableMetrics.length > 1 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="趋势指标">
            {availableMetrics.map((key) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={metric === key ? 'primary' : 'ghost'}
                onPress={() => setMetric(key)}
              >
                {METRIC_CONFIG[key].label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="mt-4">
          <EmptyState
            title="当前周期暂无运动记录"
            description="完成打卡后，这里会展示每日运动趋势"
          />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280} className="mt-4">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`trendGradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={config.color} stopOpacity={0.18} />
                <stop offset="100%" stopColor={config.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              tickFormatter={formatTrendDateLabel}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              width={52}
              allowDecimals={metric !== 'calories'}
              domain={[0, 'auto']}
              label={{
                value: config.unit,
                angle: -90,
                position: 'insideLeft',
                offset: 8,
                style: { fill: 'var(--color-text-muted)', fontSize: 12 },
              }}
            />
            <Tooltip
              labelFormatter={(label) => {
                const point = chartData.find((item) => item.date === label)
                const dateText = String(label).replace(/-/g, '/')
                if (point?.primary_sport) {
                  return `${dateText} · ${point.primary_sport}`
                }
                return dateText
              }}
              formatter={(value) => {
                const num = typeof value === 'number' ? value : Number(value ?? 0)
                return [config.formatValue(num), config.label]
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              name={config.label}
              stroke={config.color}
              strokeWidth={2}
              fill={`url(#trendGradient-${metric})`}
              dot={{ fill: config.color, r: 3 }}
              activeDot={{ fill: config.color, r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </section>
  )
}
