import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Modal, useOverlayState } from '@heroui/react'
import dayjs from 'dayjs'
import { getCalendar, type CalendarDay, type CalendarData } from '../../api/calendar'
import { getSportTypes, listCheckIns, type CheckInRecord, type SportType } from '../../api/checkin'
import CalendarHeatmap, { HEAT_LEGEND, heatColor, MonthSummaryPanel } from '../../components/CalendarHeatmap'
import { PageHeader } from '../../components/brand/PageHeader'
import { SkeletonCalendarGrid } from '../../components/brand/SkeletonCalendarGrid'
import { useDashboardStatus } from '../../hooks/useDashboardStatus'
import { findSportType, SportBadge } from '../checkin/sportUtils'

export default function CalendarView() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [calendar, setCalendar] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [sportTypes, setSportTypes] = useState<SportType[]>([])
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)
  const [dayRecords, setDayRecords] = useState<CheckInRecord[]>([])
  const [dayLoading, setDayLoading] = useState(false)
  const [dayError, setDayError] = useState('')
  const dayModal = useOverlayState()

  const dayRequestRef = useRef(0)

  const loadCalendar = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getCalendar(year, month)
      if (res.code !== 0 || !res.data) {
        setError(res.message || '加载日历失败')
        return
      }
      setCalendar(res.data)
    } catch {
      setError('加载日历失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    loadCalendar()
  }, [loadCalendar])

  useEffect(() => {
    getSportTypes()
      .then((res) => {
        if (res.code === 0 && res.data) setSportTypes(res.data)
      })
      .catch(() => {})
  }, [])

  function goPrevMonth() {
    if (month === 1) {
      setYear((y) => y - 1)
      setMonth(12)
    } else {
      setMonth((m) => m - 1)
    }
  }

  function goNextMonth() {
    if (month === 12) {
      setYear((y) => y + 1)
      setMonth(1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  async function handleDayClick(day: CalendarDay) {
    setSelectedDay(day)
    setDayRecords([])
    setDayError('')
    dayModal.open()

    if (!day.checked) {
      setDayLoading(false)
      return
    }

    setDayLoading(true)
    const requestId = ++dayRequestRef.current

    try {
      const res = await listCheckIns({ start_date: day.date, end_date: day.date, page_size: 50 })
      if (dayRequestRef.current !== requestId) return
      if (res.code !== 0 || !res.data) {
        setDayError(res.message || '加载打卡详情失败')
        return
      }
      setDayRecords(res.data.items)
    } catch {
      if (dayRequestRef.current !== requestId) return
      setDayError('加载打卡详情失败，请稍后重试')
    } finally {
      if (dayRequestRef.current === requestId) {
        setDayLoading(false)
      }
    }
  }

  const dashboard = useDashboardStatus()

  const legend = (
    <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="text-xs font-medium text-[var(--color-text-muted)] sm:text-sm">运动量</span>
      {HEAT_LEGEND.map(({ level, label }) => (
        <div key={level} className="flex items-center gap-1.5">
          <span
            className="h-3.5 w-3.5 rounded-[3px] sm:h-4 sm:w-4"
            style={{ backgroundColor: heatColor(level) }}
            aria-hidden
          />
          <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="运动日历"
        subtitle="查看每月打卡热力与连续记录"
        meta={
          <div className="flex items-baseline gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
            <span className="text-body-sm text-[var(--color-text-muted)]">连续</span>
            <span className={dashboard.loading || loading ? 'text-data-md text-[var(--color-text-muted)]' : 'text-data-md text-streak-number'}>
              {dashboard.loading || loading ? '—' : (calendar?.streak ?? dashboard.streak)}
            </span>
            <span className="text-body-sm text-[var(--color-text-muted)]">天</span>
          </div>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_280px]">
        <section
          className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-5 sm:p-6"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-text)] sm:text-2xl">
              {year} 年 {month} 月
            </h2>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onPress={goPrevMonth}>
                上月
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onPress={() => {
                  const t = new Date()
                  setYear(t.getFullYear())
                  setMonth(t.getMonth() + 1)
                }}
              >
                今天
              </Button>
              <Button variant="secondary" size="sm" onPress={goNextMonth}>
                下月
              </Button>
            </div>
          </div>

          {loading ? (
            <SkeletonCalendarGrid />
          ) : error ? (
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          ) : calendar ? (
            <CalendarHeatmap
              year={year}
              month={month}
              days={calendar.days}
              onDayClick={handleDayClick}
              legend={legend}
            />
          ) : null}
        </section>

        {!loading && calendar && (
          <MonthSummaryPanel calendar={calendar} />
        )}
      </div>

      <Modal state={dayModal}>
        <Modal.Backdrop>
          <Modal.Container size="md">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>
                  {selectedDay
                    ? dayjs(selectedDay.date).format('YYYY年M月D日')
                    : '打卡详情'}
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                {dayLoading ? (
                  <p className="text-sm text-[var(--color-text-muted)]">加载中…</p>
                ) : dayError ? (
                  <p className="text-sm text-[var(--color-danger)]" role="alert">
                    {dayError}
                  </p>
                ) : !selectedDay?.checked || dayRecords.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-text-muted)]">
                      这一天还没有运动记录
                    </p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {dayRecords.map((record) => {
                      const sport = findSportType(sportTypes, record.sport_type_id)
                      return (
                        <li
                          key={record.id}
                          className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <SportBadge sport={sport} />
                            {record.is_makeup === 1 && (
                              <span className="rounded-full bg-[var(--color-accent)]/15 px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                                补录
                              </span>
                            )}
                          </div>
                          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <dt className="text-[var(--color-text-muted)]">时长</dt>
                              <dd className="font-[family-name:var(--font-data)]">
                                {record.duration} 分钟
                              </dd>
                            </div>
                            {record.distance != null && (
                              <div>
                                <dt className="text-[var(--color-text-muted)]">距离</dt>
                                <dd className="font-[family-name:var(--font-data)]">
                                  {record.distance} km
                                </dd>
                              </div>
                            )}
                            {record.calories != null && (
                              <div>
                                <dt className="text-[var(--color-text-muted)]">卡路里</dt>
                                <dd className="font-[family-name:var(--font-data)]">
                                  {record.calories}
                                </dd>
                              </div>
                            )}
                            {record.remark && (
                              <div className="col-span-2">
                                <dt className="text-[var(--color-text-muted)]">备注</dt>
                                <dd>{record.remark}</dd>
                              </div>
                            )}
                          </dl>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="ghost" onPress={dayModal.close}>
                  关闭
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  )
}
