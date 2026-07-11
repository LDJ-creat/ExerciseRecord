import { Button } from '@heroui/react'
import type { CheckInRecord, SportType } from '../../api/checkin'
import { findSportType, getSportClass, SportBadge } from '../../pages/checkin/sportUtils'

interface ActivityCardProps {
  record: CheckInRecord
  sportTypes: SportType[]
  onEdit: (record: CheckInRecord) => void
  onDelete: (record: CheckInRecord) => void
  compact?: boolean
}

export function ActivityCard({ record, sportTypes, onEdit, onDelete, compact = true }: ActivityCardProps) {
  const sport = findSportType(sportTypes, record.sport_type_id)
  const sportClass = sport ? getSportClass(sport.code, sport.is_custom) : 'sport-other'

  return (
    <article
      className={[
        sportClass,
        'relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]',
        compact ? 'bg-[var(--color-surface)] p-3' : 'bg-[var(--color-surface)] p-4',
        'transition-transform duration-[var(--motion-fast)]',
        'hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 pressable',
      ].join(' ')}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: 'var(--sport-color, var(--color-border))' }}
        aria-hidden
      />
      <div className="flex flex-wrap items-start justify-between gap-2 pl-2">
        <div className="flex flex-col gap-1">
          <time className="text-data-md text-sm text-[var(--color-text)]">{record.check_date}</time>
          <div className="flex flex-wrap items-center gap-2">
            <SportBadge sport={sport} size="sm" />
            {record.is_makeup === 1 && (
              <span className="rounded-full bg-[var(--color-accent)]/15 px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                补录
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onPress={() => onEdit(record)}>
            编辑
          </Button>
          <Button variant="ghost" size="sm" onPress={() => onDelete(record)}>
            删除
          </Button>
        </div>
      </div>
      <dl className="mt-2 grid grid-cols-3 gap-2 pl-2 text-xs">
        <div>
          <dt className="text-[var(--color-text-muted)]">时长</dt>
          <dd className="text-data-md text-[var(--color-text)]">{record.duration} 分</dd>
        </div>
        <div>
          <dt className="text-[var(--color-text-muted)]">距离</dt>
          <dd className="text-data-md text-[var(--color-text)]">
            {record.distance != null ? `${record.distance} km` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-text-muted)]">卡路里</dt>
          <dd className="text-data-md text-[var(--color-text)]">
            {record.calories != null ? record.calories : '—'}
          </dd>
        </div>
      </dl>
      {record.remark && (
        <p className="mt-1.5 pl-2 text-body-sm text-[var(--color-text-muted)]">{record.remark}</p>
      )}
    </article>
  )
}

