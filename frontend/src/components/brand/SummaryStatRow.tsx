import type { PersonalStatsSummary } from '../../api/stats'
import { STAT_ICONS, StatCard } from './StatCard'

function formatNumber(value: number) {
  return value.toLocaleString('zh-CN')
}

export function SummaryStatRow({ summary }: { summary: PersonalStatsSummary }) {
  const showDistance = summary.total_distance > 0
  const showCalories = summary.total_calories > 0

  return (
    <div
      className="grid gap-4 sm:grid-cols-2"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
    >
      <StatCard
        label="打卡次数"
        value={formatNumber(summary.total_count)}
        unit="次"
        icon={STAT_ICONS.count}
      />
      <StatCard
        label="运动时长"
        value={formatNumber(summary.total_duration)}
        unit="分钟"
        icon={STAT_ICONS.duration}
      />
      {showDistance && (
        <StatCard
          label="运动距离"
          value={summary.total_distance.toFixed(1)}
          unit="km"
          icon={STAT_ICONS.distance}
        />
      )}
      {showCalories && (
        <StatCard
          label="消耗卡路里"
          value={formatNumber(summary.total_calories)}
          unit="kcal"
          icon={STAT_ICONS.calories}
        />
      )}
    </div>
  )
}
