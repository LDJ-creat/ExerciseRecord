import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/brand/PageHeader'
import {
  IconBell,
  IconChevronRight,
  IconHistory,
  IconProfile,
} from '../../components/icons/AppIcons'
import { getPersonalStats } from '../../api/stats'
import { useDashboardStatus } from '../../hooks/useDashboardStatus'
import { getUser } from '../../store/auth'

const SETTINGS_ITEMS = [
  {
    path: '/settings/profile',
    label: '个人资料',
    desc: '昵称、头像、身高体重',
    icon: IconProfile,
    color: 'var(--color-primary)',
  },
  {
    path: '/settings/reminder',
    label: '打卡提醒',
    desc: '提醒时间与浏览器通知',
    icon: IconBell,
    color: 'var(--color-secondary)',
  },
  {
    path: '/settings/reminder-history',
    label: '提醒历史',
    desc: '查看提醒发送记录',
    icon: IconHistory,
    color: 'var(--color-accent)',
  },
] as const

export default function SettingsPage() {
  const user = getUser()
  const { streak } = useDashboardStatus()
  const initial = (user?.nickname ?? user?.username ?? '用').charAt(0).toUpperCase()

  const [weekSummary, setWeekSummary] = useState<{ count: number; duration: number } | null>(null)

  const loadWeek = useCallback(async () => {
    try {
      const res = await getPersonalStats('week')
      if (res.code === 0 && res.data) {
        setWeekSummary({
          count: res.data.summary.total_count,
          duration: res.data.summary.total_duration,
        })
      }
    } catch {
      setWeekSummary(null)
    }
  }, [])

  useEffect(() => {
    void loadWeek()
  }, [loadWeek])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="设置" subtitle="管理账号、提醒与偏好" />

      <section className="flex flex-wrap items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] border-l-4 border-l-[var(--color-primary)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-white"
          aria-hidden
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-heading text-[var(--color-text)]">
            {user?.nickname ?? user?.username ?? '用户'}
          </p>
          <p className="text-body-sm text-[var(--color-text-muted)]">
            连续打卡 {streak} 天 · 账号与偏好设置
          </p>
          {weekSummary && (
            <p className="mt-1 text-body-sm text-[var(--color-text-muted)]">
              本周已打卡{' '}
              <span className="text-data-md text-[var(--color-text)]">{weekSummary.count}</span> 次 · 运动{' '}
              <span className="text-data-md text-[var(--color-text)]">{weekSummary.duration}</span> 分钟
            </p>
          )}
        </div>
        <Link
          to="/settings/profile"
          className="pressable rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          编辑资料
        </Link>
      </section>

      <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
        {SETTINGS_ITEMS.map(({ path, label, desc, icon: Icon, color }, index) => (
          <Link
            key={path}
            to={path}
            className={[
              'flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--color-surface-elevated)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]',
              index > 0 ? 'border-t border-[var(--color-border)]' : '',
            ].join(' ')}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-elevated)]" style={{ color }}>
              <Icon size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[var(--color-text)]">{label}</p>
              <p className="text-body-sm text-[var(--color-text-muted)]">{desc}</p>
            </div>
            <IconChevronRight className="shrink-0 text-[var(--color-text-muted)]" size={18} />
          </Link>
        ))}
      </div>
    </div>
  )
}
