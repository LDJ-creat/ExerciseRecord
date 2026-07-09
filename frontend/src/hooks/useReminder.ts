import { useEffect, useRef, type RefObject } from 'react'
import dayjs from 'dayjs'
import { listCheckIns } from '../api/checkin'
import { createReminderLog, getReminderSettings } from '../api/reminder'

const CHECK_INTERVAL_MS = 60_000
const NOTIFY_LOCK_KEY = 'exercise-record:reminder-notify-lock'

function todayString() {
  return dayjs().format('YYYY-MM-DD')
}

function currentTimeString() {
  return dayjs().format('HH:mm')
}

function slotKey() {
  return `${todayString()}T${currentTimeString()}`
}

function tryAcquireNotifyLock(key: string) {
  try {
    const existing = localStorage.getItem(NOTIFY_LOCK_KEY)
    if (existing === key) return false
    localStorage.setItem(NOTIFY_LOCK_KEY, key)
    return true
  } catch {
    return true
  }
}

async function hasCheckedInToday() {
  const today = todayString()
  const res = await listCheckIns({
    start_date: today,
    end_date: today,
    page: 1,
    page_size: 1,
  })
  if (res.code !== 0 || !res.data) return false
  return res.data.total > 0
}

async function runReminderCheck(lastHandledRef: RefObject<string | null>) {
  const key = slotKey()
  if (lastHandledRef.current === key) return

  let settingsRes
  try {
    settingsRes = await getReminderSettings()
  } catch {
    return
  }
  if (settingsRes.code !== 0 || !settingsRes.data) return

  const { is_enabled, remind_time } = settingsRes.data
  if (is_enabled !== 1) return
  if (remind_time !== currentTimeString()) return

  const today = todayString()

  try {
    const checkedIn = await hasCheckedInToday()
    if (checkedIn) {
      const res = await createReminderLog({ status: 2, remind_date: today })
      if (res.code === 0) lastHandledRef.current = key
      return
    }

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      if (tryAcquireNotifyLock(key)) {
        new Notification('运动打卡提醒', { body: '今天还没有打卡哦！' })
      }
      const res = await createReminderLog({ status: 1, remind_date: today })
      if (res.code === 0) lastHandledRef.current = key
      return
    }

    const res = await createReminderLog({ status: 0, remind_date: today })
    if (res.code === 0) lastHandledRef.current = key
  } catch {
    // 保留 ref 为空，同分钟或下一分钟可重试
  }
}

export function useReminder() {
  const lastHandledRef = useRef<string | null>(null)

  useEffect(() => {
    void runReminderCheck(lastHandledRef)
    const timer = window.setInterval(() => {
      void runReminderCheck(lastHandledRef)
    }, CHECK_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [])
}
