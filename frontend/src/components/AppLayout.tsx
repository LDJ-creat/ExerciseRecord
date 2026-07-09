import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@heroui/react'
import { clearAuth, getUser } from '../store/auth'
import { useReminder } from '../hooks/useReminder'

const NAV_ITEMS = [
  { path: '/checkin', label: '打卡', icon: NavIconCheckin },
  { path: '/goals', label: '目标', icon: NavIconGoals },
  { path: '/stats', label: '统计', icon: NavIconStats },
  { path: '/ranking', label: '排行', icon: NavIconRanking },
  { path: '/calendar', label: '日历', icon: NavIconCalendar },
  { path: '/settings', label: '设置', icon: NavIconSettings },
] as const

function NavIconCheckin() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function NavIconGoals() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

function NavIconStats() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19V5M4 19h16M8 17V11M12 17V7M16 17v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function NavIconRanking() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 21V10M12 21V3M16 21v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function NavIconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function NavIconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function isNavActive(pathname: string, navPath: string) {
  if (navPath === '/settings') {
    return pathname === '/settings' || pathname.startsWith('/settings/')
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
              'flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5',
              'font-[family-name:var(--font-body)] text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
              active
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
            ].join(' ')}
            aria-current={active ? 'page' : undefined}
          >
            <Icon />
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
        <div className="flex items-center gap-3">
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
            className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--color-text)]"
          >
            运动打卡
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden font-[family-name:var(--font-body)] text-sm text-[var(--color-text-muted)] sm:inline">
            {user?.nickname ?? user?.username ?? '用户'}
          </span>
          <Button variant="ghost" size="sm" onPress={handleLogout}>
            退出
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-52 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)] lg:block">
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
            <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)] pt-14 shadow-[var(--shadow-elevated)] lg:hidden">
              <SidebarNav onNavigate={closeSidebar} />
            </aside>
          </>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl animate-[fadeIn_200ms_ease-out]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
