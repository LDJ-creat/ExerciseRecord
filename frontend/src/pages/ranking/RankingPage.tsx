import { useCallback, useEffect, useMemo, useState } from 'react'
import { Label, ListBox, ListBoxItem, Select, Table } from '@heroui/react'
import {
  getRanking,
  type RankingData,
  type RankingDimension,
  type RankingPeriod,
} from '../../api/stats'
import { getUser } from '../../store/auth'

const DIMENSION_OPTIONS: { value: RankingDimension; label: string; unit: string }[] = [
  { value: 'count', label: '打卡次数', unit: '次' },
  { value: 'duration', label: '运动时长', unit: '分钟' },
  { value: 'distance', label: '运动距离', unit: 'km' },
]

const PERIOD_OPTIONS: { value: RankingPeriod; label: string }[] = [
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'all', label: '全部' },
]

function formatRankValue(dimension: RankingDimension, value: number) {
  if (dimension === 'distance') return value.toFixed(1)
  return String(Math.round(value))
}

export default function RankingPage() {
  const currentUser = getUser()
  const [dimension, setDimension] = useState<RankingDimension>('count')
  const [period, setPeriod] = useState<RankingPeriod>('month')
  const [data, setData] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const unit = useMemo(
    () => DIMENSION_OPTIONS.find((d) => d.value === dimension)?.unit ?? '',
    [dimension],
  )

  const loadRanking = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError('')
    try {
      const res = await getRanking(dimension, period)
      if (signal?.aborted) return
      if (res.code !== 0 || !res.data) {
        setError(res.message || '加载排行榜失败')
        setData(null)
        return
      }
      setData(res.data)
    } catch {
      if (signal?.aborted) return
      setError('加载排行榜失败')
      setData(null)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [dimension, period])

  useEffect(() => {
    const controller = new AbortController()
    void loadRanking(controller.signal)
    return () => controller.abort()
  }, [loadRanking])

  const myRankInList = useMemo(
    () => data?.rankings.some((row) => row.user_id === currentUser?.id) ?? false,
    [data, currentUser],
  )

  const myRankLabel =
    !data || data.my_rank.rank === 0
      ? '暂未上榜'
      : `第 ${data.my_rank.rank} 名`

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_200ms_ease-out]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">排行榜</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Top 50 与用户排名</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            aria-label="排行维度"
            selectedKey={dimension}
            onSelectionChange={(key) => {
              if (key) setDimension(String(key) as RankingDimension)
            }}
            className="w-36"
          >
            <Label>排行维度</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {DIMENSION_OPTIONS.map((opt) => (
                  <ListBoxItem key={opt.value} id={opt.value} textValue={opt.label}>
                    {opt.label}
                  </ListBoxItem>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
          <Select
            aria-label="统计周期"
            selectedKey={period}
            onSelectionChange={(key) => {
              if (key) setPeriod(String(key) as RankingPeriod)
            }}
            className="w-28"
          >
            <Label>周期</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {PERIOD_OPTIONS.map((opt) => (
                  <ListBoxItem key={opt.value} id={opt.value} textValue={opt.label}>
                    {opt.label}
                  </ListBoxItem>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      {error && (
        <div className="rounded-[var(--radius-sm)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <div
        className="overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-surface)]"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {loading ? (
          <p className="p-6 text-sm text-[var(--color-text-muted)]">加载中…</p>
        ) : !data || data.rankings.length === 0 ? (
          <p className="p-6 text-center text-sm text-[var(--color-text-muted)]">
            当前周期暂无排行数据
          </p>
        ) : (
          <Table aria-label="运动排行榜">
            <Table.Header>
              <Table.Column isRowHeader>排名</Table.Column>
              <Table.Column>用户</Table.Column>
              <Table.Column className="text-right">
                {DIMENSION_OPTIONS.find((d) => d.value === dimension)?.label}
              </Table.Column>
            </Table.Header>
            <Table.Body items={data.rankings}>
              {(row) => {
                const isMe = row.user_id === currentUser?.id
                const isTop3 = row.rank <= 3
                return (
                  <Table.Row
                    key={row.user_id}
                    className={[
                      isTop3 ? 'bg-[color-mix(in_srgb,var(--color-accent)_12%,white)]' : '',
                      isMe ? 'border-l-[3px] border-l-[var(--color-primary)]' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <Table.Cell>
                      <span className="font-[family-name:var(--font-data)] text-base font-semibold">
                        {row.rank}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className={isMe ? 'font-medium text-[var(--color-secondary)]' : ''}>
                        {row.nickname}
                        {isMe ? '（我）' : ''}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <span className="font-[family-name:var(--font-data)] font-medium">
                        {formatRankValue(dimension, row.value)}
                      </span>
                      <span className="ml-1 text-xs text-[var(--color-text-muted)]">{unit}</span>
                    </Table.Cell>
                  </Table.Row>
                )
              }}
            </Table.Body>
          </Table>
        )}
      </div>

      {data && !loading && (
        <div
          className={[
            'sticky bottom-0 rounded-[var(--radius-md)] border px-5 py-4',
            'border-[var(--color-secondary)] bg-[color-mix(in_srgb,var(--color-secondary)_8%,white)]',
          ].join(' ')}
          style={{ boxShadow: 'var(--shadow-elevated)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">我的排名</p>
              <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-text)]">
                {myRankLabel}
              </p>
            </div>
            {data.my_rank.rank > 0 && (
              <div className="text-right">
                <p className="text-sm text-[var(--color-text-muted)]">我的成绩</p>
                <p className="font-[family-name:var(--font-data)] text-xl font-semibold text-[var(--color-secondary)]">
                  {formatRankValue(dimension, data.my_rank.value)}
                  <span className="ml-1 text-sm font-normal text-[var(--color-text-muted)]">
                    {unit}
                  </span>
                </p>
              </div>
            )}
          </div>
          {!myRankInList && data.my_rank.rank > 0 && (
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              未进入 Top 50，继续加油
            </p>
          )}
        </div>
      )}
    </div>
  )
}
