import { Link } from 'react-router-dom'
import { LaneStripe } from '../../components/brand/LaneStripe'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <div className="hidden flex-1 flex-col justify-center bg-[var(--gradient-dawn)] px-12 lg:flex">
        <Link
          to="/"
          className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-text)]"
        >
          运动打卡
        </Link>
        <p className="mt-4 max-w-sm font-[family-name:var(--font-body)] text-lg text-[var(--color-text-muted)]">
          把每一天的运动，算进自己的节奏里。
        </p>
        <LaneStripe />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-12">
        <div className="mb-8 w-full max-w-md lg:hidden">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-text)]">
            运动打卡
          </h1>
          <LaneStripe />
        </div>

        <div
          className="w-full max-w-md rounded-[var(--radius-md)] bg-[var(--color-surface)] p-8"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-text)]">
            {title}
          </h2>
          <p className="mt-1 font-[family-name:var(--font-body)] text-sm text-[var(--color-text-muted)]">
            {subtitle}
          </p>
          <div className="mt-6">{children}</div>
          <div className="mt-6 text-center font-[family-name:var(--font-body)] text-sm text-[var(--color-text-muted)]">
            {footer}
          </div>
        </div>
      </div>
    </div>
  )
}
