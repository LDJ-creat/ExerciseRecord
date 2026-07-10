import { useCallback, useEffect, useState } from 'react'
import { getGoalProgress } from '../../api/goal'
import { getPersonalStats } from '../../api/stats'
import { PERIOD_WEEK } from '../../pages/goals/goalUtils'
import { STAT_ICONS, StatCard } from '../brand/StatCard'
import { SkeletonStatRow } from '../brand/SkeletonStatCard'

function formatNumber(value: number) {
  return value.toLocaleString('zh-CN')
}

export function WeeklySummaryPanel() {
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [duration, setDuration] = useState(0)
  const [distance, setDistance] = useState(0)
  const [goalPercent, setGoalPercent] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, goalRes] = await Promise.all([
        getPersonalStats('week'),
        getGoalProgress(),
      ])
      if (statsRes.code === 0 && statsRes.data) {
        setCount(statsRes.data.summary.total_count)
        setDuration(statsRes.data.summary.total_duration)
        setDistance(statsRes.data.summary.total_distance)
      }
      if (goalRes.code === 0 && goalRes.data) {
        const weekGoal = goalRes.data.goals.find((g) => g.period_type === PERIOD_WEEK)
        setGoalPercent(weekGoal ? weekGoal.progress_percent : null)
      }
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <section
        className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        style={{ boxShadow: 'var(--shadow-card)' }}
        aria-label="本周摘要"
      >
        <h2 className="text-heading mb-3 text-[var(--color-text)]">本周摘要</h2>
        <SkeletonStatRow count={3} />
      </section>
    )
  }

  return (
    <section
      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
      style={{ boxShadow: 'var(--shadow-card)' }}
      aria-label="本周摘要"
    >
      <h2 className="text-heading mb-3 text-[var(--color-text)]">本周摘要</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="打卡次数" value={formatNumber(count)} unit="次" icon={STAT_ICONS.count} />
        <StatCard label="运动时长" value={formatNumber(duration)} unit="分钟" icon={STAT_ICONS.duration} />
        <StatCard label="运动距离" value={distance.toFixed(1)} unit="km" icon={STAT_ICONS.distance} />
        {goalPercent != null && (
          <StatCard label="周目标" value={String(goalPercent)} unit="%" icon={STAT_ICONS.duration} />
        )}
      </div>
    </section>
  )
}
