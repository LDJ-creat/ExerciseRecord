import { useEffect, useState } from 'react'
import {
  Button,
  Calendar,
  DatePicker,
  Input,
  Label,
  TextField,
} from '@heroui/react'
import {
  getLocalTimeZone,
  today,
  type CalendarDate,
} from '@internationalized/date'
import {
  createCheckIn,
  getSportTypes,
  type SportType,
} from '../../api/checkin'
import { SportTypeGrid } from '../../components/checkin/SportTypeGrid'

interface CheckInFormProps {
  onSuccess?: (message: string) => void
}

function formatCalendarDate(date: CalendarDate) {
  const month = String(date.month).padStart(2, '0')
  const day = String(date.day).padStart(2, '0')
  return `${date.year}-${month}-${day}`
}

export default function CheckInForm({ onSuccess }: CheckInFormProps) {
  const maxDate = today(getLocalTimeZone())
  const [sportTypes, setSportTypes] = useState<SportType[]>([])
  const [sportTypeId, setSportTypeId] = useState<string>('')
  const [checkDate, setCheckDate] = useState<CalendarDate>(maxDate)
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [calories, setCalories] = useState('')
  const [remark, setRemark] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectedSport = sportTypes.find((t) => String(t.id) === sportTypeId) ?? null
  const isMakeup = checkDate.compare(maxDate) < 0

  useEffect(() => {
    getSportTypes()
      .then((res) => {
        if (res.code === 0 && res.data?.length) {
          setSportTypes(res.data)
          setSportTypeId(String(res.data[0].id))
        }
      })
      .catch(() => setError('加载运动类型失败'))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!sportTypeId) {
      setError('请选择运动类型')
      return
    }
    const durationNum = Number(duration)
    if (!duration || Number.isNaN(durationNum) || durationNum < 0) {
      setError('请填写有效的运动时长')
      return
    }

    const payload = {
      sport_type_id: Number(sportTypeId),
      check_date: formatCalendarDate(checkDate),
      duration: durationNum,
      remark: remark.trim() || undefined,
    } as Parameters<typeof createCheckIn>[0]

    if (selectedSport?.need_distance && distance !== '') {
      const dist = Number(distance)
      if (Number.isNaN(dist) || dist < 0) {
        setError('距离不能为负数')
        return
      }
      payload.distance = dist
    }
    if (selectedSport?.need_calories && calories !== '') {
      const cal = Number(calories)
      if (Number.isNaN(cal) || cal < 0) {
        setError('卡路里不能为负数')
        return
      }
      payload.calories = cal
    }

    setSubmitting(true)
    try {
      const res = await createCheckIn(payload)
      if (res.code !== 0) {
        if (res.code === 40901) {
          setError('该日期已有相同运动类型的打卡记录')
        } else {
          setError(res.message || '打卡失败')
        }
        return
      }
      const sportName = selectedSport?.name ?? '运动'
      onSuccess?.(`已记录 · ${sportName} ${durationNum} 分钟`)
      setDuration('')
      setDistance('')
      setCalories('')
      setRemark('')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { code?: number; message?: string } } }
      if (axiosErr.response?.data?.code === 40901) {
        setError('该日期已有相同运动类型的打卡记录')
      } else {
        setError('打卡失败，请稍后重试')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      id="checkin-form"
      className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-6"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <h2 className="text-heading mb-4 text-[var(--color-text)]">新建打卡</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label className="mb-2 block">运动类型</Label>
          {sportTypes.length > 0 && (
            <SportTypeGrid
              sports={sportTypes}
              selectedId={sportTypeId}
              onSelect={setSportTypeId}
            />
          )}
        </div>

        <DatePicker
          value={checkDate}
          onChange={(value) => value && setCheckDate(value)}
          maxValue={maxDate}
        >
          <div className="flex items-center gap-2">
            <Label>打卡日期</Label>
            {isMakeup && (
              <span className="rounded-full bg-[var(--color-accent)]/15 px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                补录
              </span>
            )}
          </div>
          <DatePicker.Trigger className="flex w-full items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 font-[family-name:var(--font-data)] text-sm">
            {formatCalendarDate(checkDate)}
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
          <DatePicker.Popover>
            <Calendar>
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
          </DatePicker.Popover>
        </DatePicker>

        <TextField isRequired>
          <Label>时长 (分钟)</Label>
          <Input
            type="number"
            min={0}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="30"
          />
        </TextField>

        {selectedSport?.need_distance ? (
          <TextField>
            <Label>距离 (公里)</Label>
            <Input
              type="number"
              min={0}
              step="0.1"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="5.0"
            />
          </TextField>
        ) : null}

        {selectedSport?.need_calories ? (
          <TextField>
            <Label>卡路里</Label>
            <Input
              type="number"
              min={0}
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="300"
            />
          </TextField>
        ) : null}

        <TextField>
          <Label>备注</Label>
          <Input
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="今天的感受…"
          />
        </TextField>

        {error && (
          <p className="text-sm text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" isPending={submitting}>
          提交打卡
        </Button>
      </form>
    </section>
  )
}
