import { LaneStripe } from '../../components/brand/LaneStripe'
import { AuthHero } from '../../components/brand/AuthHero'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <div className="hidden lg:block lg:w-[52%] xl:w-[55%]">
        <AuthHero />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-[var(--color-bg)] p-6 md:p-10 lg:p-12">
        <div className="mb-6 w-full max-w-md lg:hidden">
          <AuthHero compact />
        </div>

        <div
          className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] border-l-[3px] border-l-[var(--color-primary)] bg-[var(--color-surface)] p-8 md:p-10"
          style={{ boxShadow: 'var(--shadow-elevated)' }}
        >
          <LaneStripe className="mb-5 max-w-[80px]" />
          <h2 className="text-heading text-[var(--color-text)]">{title}</h2>
          <p className="mt-1 text-body-sm text-[var(--color-text-muted)]">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-6 text-center text-body-sm text-[var(--color-text-muted)]">
            {footer}
          </div>
        </div>
      </div>
    </div>
  )
}
