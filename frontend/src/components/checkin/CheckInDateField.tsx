import {
  Calendar,
  DateField,
  DatePicker,
  Label,
} from '@heroui/react'
import type { CalendarDate } from '@internationalized/date'

function CheckInCalendar() {
  return (
    <Calendar aria-label="选择打卡日期">
      <Calendar.Header>
        <Calendar.NavButton slot="previous" />
        <Calendar.Heading />
        <Calendar.NavButton slot="next" />
      </Calendar.Header>
      <Calendar.Grid>
        <Calendar.GridHeader>
          {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
        </Calendar.GridHeader>
        <Calendar.GridBody>
          {(date) => <Calendar.Cell date={date} />}
        </Calendar.GridBody>
      </Calendar.Grid>
    </Calendar>
  )
}

interface CheckInDateFieldProps {
  label?: React.ReactNode
  value: CalendarDate
  onChange: (value: CalendarDate) => void
  maxValue: CalendarDate
}

export function CheckInDateField({ label, value, onChange, maxValue }: CheckInDateFieldProps) {
  return (
    <DatePicker
      className="w-full"
      value={value}
      onChange={(next) => next && onChange(next)}
      maxValue={maxValue}
    >
      {label}
      <DateField.Group
        fullWidth
        className="flex w-full items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
      >
        <DateField.Input className="flex min-w-0 flex-1 font-[family-name:var(--font-data)] text-sm">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix className="shrink-0">
          <DatePicker.Trigger aria-label="打开日历">
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover placement="bottom start">
        <CheckInCalendar />
      </DatePicker.Popover>
    </DatePicker>
  )
}

export function CheckInDateLabel({
  isMakeup,
}: {
  isMakeup: boolean
}) {
  return (
    <div className="mb-1 flex items-center gap-2">
      <Label>打卡日期</Label>
      {isMakeup && (
        <span className="rounded-full bg-[var(--color-accent)]/15 px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
          补录
        </span>
      )}
    </div>
  )
}
