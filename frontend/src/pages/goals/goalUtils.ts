import dayjs from 'dayjs'

export const PERIOD_WEEK = 1
export const PERIOD_MONTH = 2

export const TARGET_COUNT = 1
export const TARGET_DURATION = 2
export const TARGET_DISTANCE = 3

export const PERIOD_LABELS: Record<number, string> = {
  [PERIOD_WEEK]: '周目标',
  [PERIOD_MONTH]: '月目标',
}

export const TARGET_LABELS: Record<number, string> = {
  [TARGET_COUNT]: '打卡次数',
  [TARGET_DURATION]: '运动时长（分钟）',
  [TARGET_DISTANCE]: '运动距离（公里）',
}

export const TARGET_UNITS: Record<number, string> = {
  [TARGET_COUNT]: '次',
  [TARGET_DURATION]: '分钟',
  [TARGET_DISTANCE]: '公里',
}

export const STATUS_LABELS: Record<number, string> = {
  0: '进行中',
  1: '已达成',
  2: '未达成',
}

export function getWeekPeriod() {
  const now = dayjs()
  const day = now.day()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const start = now.add(mondayOffset, 'day')
  const end = start.add(6, 'day')
  return {
    start: start.format('YYYY-MM-DD'),
    end: end.format('YYYY-MM-DD'),
  }
}

export function getMonthPeriod() {
  const now = dayjs()
  return {
    start: now.startOf('month').format('YYYY-MM-DD'),
    end: now.endOf('month').format('YYYY-MM-DD'),
  }
}

export function getPeriodRange(periodType: number) {
  return periodType === PERIOD_MONTH ? getMonthPeriod() : getWeekPeriod()
}

export function formatPeriodRange(start: string, end: string) {
  return `${dayjs(start).format('MM/DD')} – ${dayjs(end).format('MM/DD')}`
}
