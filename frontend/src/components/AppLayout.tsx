import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@heroui/react'
import { StreakBadge } from './brand/StreakBadge'
import { AppLogo, IconCalendar, IconCheckin, IconInsights, IconRanking, IconSettings } from './icons/AppIcons'
import { clearAuth, getUser } from '../store/auth'
import { useReminder } from '../hooks/useReminder'

const NAV_ITEMS = [
  { path: '/checkin', label: '打卡', icon: IconCheckin },
  { path: '/insights', label: '数据', icon: IconInsights },
  { path: '/ranking', label: '排行', icon: IconRanking },
  { path: '/calendar', label: '日历', icon: IconCalendar },
  { path: '/settings', label: '设置', icon: IconSettings },
] as const

function isNavActive(pathname: string, navPath: string) {
  if (navPath === '/settings') {
    return pathname === '/settings' || pathname.startsWith('/settings/')
  }
  if (navPath === '/insights') {
    return pathname === '/insights' || pathname === '/goals' || pathname === '/stats'
  }
  return pathname === navPath || pathname.startsWith(`${navPath}/`)
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()

  return (
    <nav className="flex flex-col gap-1 p-3" aria-label="主导航">
      {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
        const active = isNavActive(location.pathname, path)
        return (
          <Link
            key={path}
            to={path}
            onClick={onNavigate}
            className={[
              'relative flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5',
              'text-sm font-medium transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
              'pressable',
              active
                ? 'border-l-[3px] border-l-[var(--color-primary)] bg-[var(--nav-active-bg)] pl-[calc(0.75rem-3px)] text-[var(--color-primary)]'
                : 'border-l-[3px] border-l-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
            ].join(' ')}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={20} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AppLayout() {
  const navigate = useNavigate()
  const user = getUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useReminder()

  function handleLogout() {
    clearAuth()
    navigate('/login', { replace: true })
  }

  function closeSidebar() {
    setSidebarOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 md:px-6">
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            aria-label="打开导航菜单"
            onPress={() => setSidebarOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Button>
          <Link
            to="/checkin"
            className="flex items-center gap-2 text-lg font-bold text-[var(--color-text)] lg:hidden"
          >
            <span className="text-[var(--color-primary)]">
              <AppLogo size={22} />
            </span>
            <span className="font-[family-name:var(--font-display)]">运动打卡</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <StreakBadge />
          <span className="hidden text-sm text-[var(--color-text-muted)] sm:inline">
            {user?.nickname ?? user?.username ?? '用户'}
          </span>
          <Button variant="ghost" size="sm" onPress={handleLogout}>
            退出
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-52 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)] lg:flex">
          <Link
            to="/checkin"
            className="flex items-center gap-2.5 border-b border-[var(--color-border)] px-4 py-4 text-lg font-bold text-[var(--color-text)]"
          >
            <span className="text-[var(--color-primary)]">
              <AppLogo size={22} />
            </span>
            <span className="font-[family-name:var(--font-display)]">运动打卡</span>
          </Link>
          <SidebarNav />
        </aside>

        {sidebarOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
              aria-label="关闭导航菜单"
              onClick={closeSidebar}
            />
            <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)] pt-14 shadow-[var(--shadow-elevated)] lg:hidden">
              <SidebarNav onNavigate={closeSidebar} />
            </aside>
          </>
        )}

        <main className="track-pattern flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl animate-[fadeIn_200ms_ease-out]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
