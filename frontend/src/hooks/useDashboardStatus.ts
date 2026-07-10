import { useCallback, useEffect, useState } from 'react'
import { getCalendar } from '../api/calendar'

export interface DashboardStatus {
  streak: number
  todayChecked: boolean
  todayDuration: number
  loading: boolean
  error: string
  refresh: () => void
}

function todayDateStr() {
  const t = new Date()
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, '0')
  const d = String(t.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

let cachedStatus: Omit<DashboardStatus, 'refresh'> | null = null
let inflight: Promise<void> | null = null

async function fetchStatus(): Promise<Omit<DashboardStatus, 'refresh'>> {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const today = todayDateStr()

  const res = await getCalendar(year, month)
  if (res.code !== 0 || !res.data) {
    return {
      streak: 0,
      todayChecked: false,
      todayDuration: 0,
      loading: false,
      error: res.message || '加载状态失败',
    }
  }

  const todayDay = res.data.days.find((d) => d.date === today)
  return {
    streak: res.data.streak,
    todayChecked: todayDay?.checked ?? false,
    todayDuration: todayDay?.total_duration ?? 0,
    loading: false,
    error: '',
  }
}

export function invalidateDashboardStatus() {
  cachedStatus = null
  inflight = null
}

export function useDashboardStatus(refreshKey = 0): DashboardStatus {
  const [status, setStatus] = useState<Omit<DashboardStatus, 'refresh'>>(() =>
    cachedStatus ?? {
      streak: 0,
      todayChecked: false,
      todayDuration: 0,
      loading: true,
      error: '',
    },
  )

  const load = useCallback(async (force = false) => {
    if (!force && cachedStatus) {
      setStatus(cachedStatus)
      return
    }
    if (!force && inflight) {
      await inflight
      if (cachedStatus) setStatus(cachedStatus)
      return
    }

    setStatus((s) => ({ ...s, loading: true, error: '' }))
    inflight = (async () => {
      try {
        const data = await fetchStatus()
        cachedStatus = data
        setStatus(data)
      } catch {
        const err = {
          streak: 0,
          todayChecked: false,
          todayDuration: 0,
          loading: false,
          error: '加载状态失败',
        }
        cachedStatus = err
        setStatus(err)
      } finally {
        inflight = null
      }
    })()
    await inflight
  }, [])

  const refresh = useCallback(() => {
    invalidateDashboardStatus()
    void load(true)
  }, [load])

  useEffect(() => {
    void load(refreshKey > 0)
  }, [load, refreshKey])

  return { ...status, refresh }
}
