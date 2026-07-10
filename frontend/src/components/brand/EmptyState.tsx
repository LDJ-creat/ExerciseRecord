import { Button } from '@heroui/react'
import { LaneStripe } from './LaneStripe'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[var(--radius-md)] px-6 py-12 text-center"
      style={{ background: 'var(--gradient-dawn)' }}
    >
      <p className="text-heading text-[var(--color-text)]">{title}</p>
      {description && (
        <p className="mt-2 max-w-sm text-body-sm text-[var(--color-text-muted)]">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" className="mt-5 pressable" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
      <LaneStripe className="mt-6 max-w-[120px]" />
    </div>
  )
}
