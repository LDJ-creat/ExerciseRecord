import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input, Label, Switch, TextField } from '@heroui/react'
import { getReminderSettings, updateReminderSettings } from '../../api/reminder'

type NotificationPermissionState = NotificationPermission | 'unsupported'

function toInputTime(value: string) {
  return value.length >= 5 ? value.slice(0, 5) : value
}

export default function ReminderSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [isEnabled, setIsEnabled] = useState(false)
  const [remindTime, setRemindTime] = useState('20:00')
  const [permission, setPermission] = useState<NotificationPermissionState>('default')

  useEffect(() => {
    if (typeof Notification === 'undefined') {
      setPermission('unsupported')
    } else {
      setPermission(Notification.permission)
    }
    void loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)
    setError('')
    try {
      const res = await getReminderSettings()
      if (res.code !== 0 || !res.data) {
        setError(res.message || '加载提醒设置失败')
        return
      }
      setIsEnabled(res.data.is_enabled === 1)
      setRemindTime(toInputTime(res.data.remind_time))
    } catch {
      setError('加载提醒设置失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const res = await updateReminderSettings({
        is_enabled: isEnabled ? 1 : 0,
        remind_time: remindTime,
      })
      if (res.code !== 0 || !res.data) {
        setError(res.message || '保存失败')
        return
      }
      setIsEnabled(res.data.is_enabled === 1)
      setRemindTime(toInputTime(res.data.remind_time))
      setSuccess('提醒设置已保存')
    } catch {
      setError('保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  async function handleRequestPermission() {
    if (typeof Notification === 'undefined') return
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
    } catch {
      setPermission(Notification.permission)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="font-[family-name:var(--font-body)] text-[var(--color-text-muted)]">加载中…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">
            打卡提醒
          </h1>
          <p className="mt-1 font-[family-name:var(--font-body)] text-sm text-[var(--color-text-muted)]">
            在设定时间检查今日是否打卡，未打卡时发送浏览器通知
          </p>
        </div>
        <Link
          to="/settings/reminder-history"
          className="font-[family-name:var(--font-body)] text-sm font-medium text-[var(--color-secondary)] hover:underline"
        >
          查看提醒历史 →
        </Link>
      </div>

      <div
        className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-6"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-[family-name:var(--font-body)] text-sm font-medium text-[var(--color-text)]">
                开启提醒
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                关闭后不会在设定时间检查或发送通知
              </p>
            </div>
            <Switch isSelected={isEnabled} onChange={setIsEnabled} aria-label="开启打卡提醒">
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch>
          </div>

          <TextField isRequired>
            <Label>提醒时间</Label>
            <Input
              type="time"
              value={remindTime}
              onChange={(e) => setRemindTime(e.target.value)}
              className="font-[family-name:var(--font-data)]"
            />
          </TextField>

          <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
            <p className="font-[family-name:var(--font-body)] text-sm font-medium text-[var(--color-text)]">
              浏览器通知权限
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {permission === 'unsupported' && '当前浏览器不支持通知 API'}
              {permission === 'granted' && '已授权，到点可收到桌面提醒'}
              {permission === 'denied' &&
                '权限已被拒绝。请在浏览器地址栏左侧站点设置中允许通知，然后刷新页面。'}
              {permission === 'default' && '尚未授权，开启提醒前请先允许通知权限'}
            </p>
            {permission !== 'unsupported' && permission !== 'granted' && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-3"
                onPress={handleRequestPermission}
                isDisabled={permission === 'denied'}
              >
                请求通知权限
              </Button>
            )}
          </div>

          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
          {success && <p className="text-sm text-[var(--color-secondary)]">{success}</p>}

          <Button type="submit" variant="primary" isPending={saving}>
            保存设置
          </Button>
        </form>
      </div>
    </div>
  )
}
