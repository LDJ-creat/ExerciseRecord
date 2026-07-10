import type { SportType } from '../../api/checkin'
import { getSportClass, SportIcon } from '../../pages/checkin/sportUtils'

interface SportTypeGridProps {
  sports: SportType[]
  selectedId: string
  onSelect: (id: string) => void
}

export function SportTypeGrid({ sports, selectedId, onSelect }: SportTypeGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-3" role="listbox" aria-label="运动类型">
      {sports.map((sport) => {
        const selected = String(sport.id) === selectedId
        const sportClass = getSportClass(sport.code)
        return (
          <button
            key={sport.id}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onSelect(String(sport.id))}
            className={[
              sportClass,
              'flex flex-col items-center gap-1.5 rounded-[var(--radius-sm)] border-2 px-2 py-3',
              'transition-all duration-[var(--motion-fast)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
              selected
                ? 'border-[var(--sport-color)] bg-[color-mix(in_srgb,var(--sport-color)_15%,white)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[color-mix(in_srgb,var(--sport-color)_40%,var(--color-border))]',
            ].join(' ')}
          >
            <span style={{ color: 'var(--sport-color)' }}>
              <SportIcon code={sport.code} className="h-7 w-7" />
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: selected ? 'var(--sport-color)' : 'var(--color-text)' }}
            >
              {sport.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
