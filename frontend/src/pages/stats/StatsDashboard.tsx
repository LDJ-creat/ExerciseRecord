import { useCallback, useEffect, useMemo, useState } from 'react'
import { Label, ListBox, ListBoxItem, Select } from '@heroui/react'
import {
  Area,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  getPersonalStats,
  type PersonalStatsData,
  type StatsPeriod,
} from '../../api/stats'

const PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: 'day', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'all', label: '全部' },
]

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

function formatNumber(value: number) {
  return value.toLocaleString('zh-CN')
}

interface SummaryCardProps {
  label: string
  value: string
  unit: string
}

function SummaryCard({ label, value, unit }: SummaryCardProps) {
  return (
    <div
      className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-5 transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-[family-name:var(--font-data)] text-3xl font-semibold text-[var(--color-text)]">
          {value}
        </span>
        <span className="text-sm text-[var(--color-text-muted)]">{unit}</span>
      </div>
    </div>
  )
}

export default function StatsDashboard() {
  const [period, setPeriod] = useState<StatsPeriod>('month')
  const [data, setData] = useState<PersonalStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStats = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError('')
    try {
      const res = await getPersonalStats(period)
      if (signal?.aborted) return
      if (res.code !== 0 || !res.data) {
        setError(res.message || '加载统计数据失败')
        setData(null)
        return
      }
      setData(res.data)
    } catch {
      if (signal?.aborted) return
      setError('加载统计数据失败')
      setData(null)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [period])

  useEffect(() => {
    const controller = new AbortController()
    void loadStats(controller.signal)
    return () => controller.abort()
  }, [loadStats])

  const pieData = useMemo(
    () =>
      (data?.by_sport_type ?? []).map((item) => ({
        name: item.name,
        value: item.count,
        percent: item.percent,
        fill: sportColor(item.sport_type_id),
      })),
    [data],
  )

  const trendData = data?.trend ?? []
  const summary = data?.summary

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_200ms_ease-out]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">数据统计</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            个人运动概览与趋势分析
          </p>
        </div>
        <Select
          aria-label="统计周期"
          selectedKey={period}
          onSelectionChange={(key) => {
            if (key) setPeriod(String(key) as StatsPeriod)
          }}
          className="w-36"
        >
          <Label>统计周期</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {PERIOD_OPTIONS.map((opt) => (
                <ListBoxItem key={opt.value} id={opt.value} textValue={opt.label}>
                  {opt.label}
                </ListBoxItem>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {error && (
        <div className="rounded-[var(--radius-sm)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[var(--color-text-muted)]">加载中…</p>
      ) : summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="打卡次数"
              value={formatNumber(summary.total_count)}
              unit="次"
            />
            <SummaryCard
              label="运动时长"
              value={formatNumber(summary.total_duration)}
              unit="分钟"
            />
            <SummaryCard
              label="运动距离"
              value={summary.total_distance.toFixed(1)}
              unit="km"
            />
            <SummaryCard
              label="消耗卡路里"
              value={formatNumber(summary.total_calories)}
              unit="kcal"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
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

            <section
              className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-5"
              style={{ boxShadow: 'var(--shadow-card)' }}
              aria-label="运动趋势"
            >
              <h2 className="text-lg font-semibold text-[var(--color-text)]">趋势分析</h2>
              {trendData.length === 0 ? (
                <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
                  当前周期暂无趋势数据
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={280} className="mt-4">
                  <LineChart data={trendData}>
                    <defs>
                      <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                      tickFormatter={(v: string) => v.slice(5)}
                    />
                    <YAxis
                      yAxisId="duration"
                      tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="distance"
                      orientation="right"
                      tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                    />
                    <Tooltip
                      labelFormatter={(label) => `日期 ${label}`}
                      formatter={(value, name) => {
                        const num = typeof value === 'number' ? value : Number(value ?? 0)
                        const key = String(name)
                        return [
                          key === 'duration' ? `${num} 分钟` : `${num} km`,
                          key === 'duration' ? '时长' : '距离',
                        ]
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="line"
                      formatter={(value) => (value === 'duration' ? '时长' : '距离')}
                      wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="duration"
                      yAxisId="duration"
                      fill="url(#durationGradient)"
                      stroke="none"
                    />
                    <Line
                      type="monotone"
                      dataKey="duration"
                      yAxisId="duration"
                      stroke="var(--color-secondary)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--color-secondary)', r: 3 }}
                      activeDot={{ fill: 'var(--color-primary)', r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="distance"
                      yAxisId="distance"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--color-primary)', r: 3 }}
                      activeDot={{ fill: 'var(--color-primary)', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </section>
          </div>
        </>
      ) : null}
    </div>
  )
}
