import { useMemo } from 'react'
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
import type { PersonalStatsData } from '../../api/stats'

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

export function StatsTrendChart({ data }: { data: PersonalStatsData }) {
  const trendData = data.trend ?? []

  return (
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
            <YAxis yAxisId="duration" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
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
  )
}
