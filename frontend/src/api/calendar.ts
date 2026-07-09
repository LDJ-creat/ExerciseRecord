import client from './client'
import type { ApiResponse } from './auth'

export interface CalendarDay {
  date: string
  checked: boolean
  count: number
  total_duration: number
  total_distance: number
  heat_level: number
}

export interface CalendarData {
  year: number
  month: number
  days: CalendarDay[]
  streak: number
  max_duration: number
}

export async function getCalendar(year: number, month: number) {
  const res = await client.get<ApiResponse<CalendarData>>('/calendar', {
    params: { year, month },
  })
  return res.data
}
