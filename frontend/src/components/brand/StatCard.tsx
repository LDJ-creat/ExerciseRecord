import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  unit: string
  icon?: ReactNode
}

export function StatCard({ label, value, unit, icon }: StatCardProps) {
  return (
    <div
      className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-5 transition-transform duration-[var(--motion-fast)] hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-body-sm text-[var(--color-text-muted)]">{label}</p>
        {icon && (
          <span className="text-[var(--color-secondary)] opacity-80" aria-hidden>
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-data-lg text-[var(--color-text)]">{value}</span>
        <span className="text-body-sm text-[var(--color-text-muted)]">{unit}</span>
      </div>
    </div>
  )
}

function IconCount() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 19V5M4 19h16M8 17V11M12 17V7M16 17v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconDuration() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconDistance() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 12h18M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <path d="M5 17l4-8 3 5 3-3 4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCalories() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3c-2 3-6 4-6 9a6 6 0 1 0 12 0c0-5-4-6-6-9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const STAT_ICONS = {
  count: <IconCount />,
  duration: <IconDuration />,
  distance: <IconDistance />,
  calories: <IconCalories />,
} as const
