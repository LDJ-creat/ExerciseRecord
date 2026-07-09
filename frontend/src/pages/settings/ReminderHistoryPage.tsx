import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Table } from '@heroui/react'
import dayjs from 'dayjs'
import { listReminderLogs, type ReminderLog } from '../../api/reminder'

const PAGE_SIZE = 10

const STATUS_META: Record<
  number,
  { label: string; className: string }
> = {
  0: {
    label: '失败',
    className: 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]',
  },
  1: {
    label: '成功',
    className: 'bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]',
  },
  2: {
    label: '已跳过',
    className: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]',
  },
}

function StatusBadge({ status }: { status: number }) {
  const meta = STATUS_META[status] ?? {
    label: '未知',
    className: 'bg-[var(--color-border)] text-[var(--color-text-muted)]',
  }
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.className}`}
    >
      {meta.label}
    </span>
  )
}

function formatSentAt(value: string | null) {
  if (!value) return '—'
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : value
}

export default function ReminderHistoryPage() {
  const [items, setItems] = useState<ReminderLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const loadLogs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await listReminderLogs({ page, page_size: PAGE_SIZE })
      if (res.code !== 0 || !res.data) {
        setError(res.message || '加载提醒历史失败')
        return
      }
      setItems(res.data.items)
      setTotal(res.data.total)
    } catch {
      setError('加载提醒历史失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    void loadLogs()
  }, [loadLogs])

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">
            提醒历史
          </h1>
          <p className="mt-1 font-[family-name:var(--font-body)] text-sm text-[var(--color-text-muted)]">
            查看每日提醒发送与跳过记录
          </p>
        </div>
        <Link
          to="/settings/reminder"
          className="font-[family-name:var(--font-body)] text-sm font-medium text-[var(--color-secondary)] hover:underline"
        >
          ← 返回提醒设置
        </Link>
      </div>

      <div
        className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-6"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {loading ? (
          <p className="text-sm text-[var(--color-text-muted)]">加载中…</p>
        ) : error ? (
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        ) : items.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-text-muted)]">
              还没有提醒记录
            </p>
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              开启
              <Link to="/settings/reminder" className="mx-1 text-[var(--color-secondary)] hover:underline">
                打卡提醒
              </Link>
              后，系统会在设定时间自动记录
            </p>
          </div>
        ) : (
          <>
            <Table aria-label="提醒历史">
              <Table.Content>
                <Table.Header>
                  <Table.Column>提醒日期</Table.Column>
                  <Table.Column>发送时间</Table.Column>
                  <Table.Column>状态</Table.Column>
                </Table.Header>
                <Table.Body items={items}>
                  {(item) => (
                    <Table.Row key={item.id} id={String(item.id)}>
                      <Table.Cell>
                        <span className="font-[family-name:var(--font-data)] text-sm">
                          {item.remind_date}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="font-[family-name:var(--font-data)] text-sm">
                          {formatSentAt(item.sent_at)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <StatusBadge status={item.status} />
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Content>
            </Table>

            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-text-muted)]">
                共 {total} 条 · 第 {page} / {totalPages} 页
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  isDisabled={page <= 1}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                >
                  上一页
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  isDisabled={page >= totalPages}
                  onPress={() => setPage((p) => p + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
