import { Link } from 'react-router-dom'

const SETTINGS_LINKS = [
  { path: '/settings/profile', label: '个人资料', desc: '昵称、头像、身高体重' },
  { path: '/settings/reminder', label: '打卡提醒', desc: '提醒时间与浏览器通知' },
  { path: '/settings/reminder-history', label: '提醒历史', desc: '查看提醒发送记录' },
] as const

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">
          设置
        </h1>
        <p className="mt-1 font-[family-name:var(--font-body)] text-sm text-[var(--color-text-muted)]">
          管理账号、提醒与偏好
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_LINKS.map(({ path, label, desc }) => (
          <Link
            key={path}
            to={path}
            className={[
              'rounded-[var(--radius-md)] bg-[var(--color-surface)] p-5 transition-transform duration-150',
              'hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
            ].join(' ')}
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-text)]">
              {label}
            </h2>
            <p className="mt-1 font-[family-name:var(--font-body)] text-sm text-[var(--color-text-muted)]">
              {desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
