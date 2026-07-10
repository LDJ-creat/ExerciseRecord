import { useCallback, useEffect, useMemo, useState } from 'react'
import { Label, ListBox, ListBoxItem, Select, Table } from '@heroui/react'
import {
  getRanking,
  type RankingData,
  type RankingDimension,
  type RankingPeriod,
} from '../../api/stats'
import { getUser } from '../../store/auth'
import { PageHeader } from '../../components/brand/PageHeader'
import { SkeletonTable } from '../../components/brand/SkeletonTable'
import { RankingPodium } from '../../components/ranking/RankingPodium'

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

function RankDisplay({ rank }: { rank: number }) {
  return <span className="text-data-md font-semibold">{rank}</span>
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

  const topThree = useMemo(
    () => (data?.rankings.filter((r) => r.rank <= 3) ?? []),
    [data],
  )

  const tableRows = useMemo(
    () => (data?.rankings.filter((r) => r.rank > 3) ?? []),
    [data],
  )

  const myRank = data?.my_rank.rank ?? 0
  const myRankLabel =
    !data || myRank === 0 ? '暂未上榜' : `第 ${myRank} 名`

  return (
    <div
      className="flex flex-col gap-6 animate-[fadeIn_200ms_ease-out]"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--color-primary) 3%, transparent) 0%, transparent 50%)',
      }}
    >
      <PageHeader
        title="排行榜"
        subtitle="Top 50 与用户排名"
        actions={
          <>
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
          </>
        }
      />

      {error && (
        <div className="rounded-[var(--radius-sm)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={5} />
      ) : !data || data.rankings.length === 0 ? (
        <p className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-6 text-center text-sm text-[var(--color-text-muted)] shadow-[var(--shadow-card)]">
          当前周期暂无排行数据
        </p>
      ) : (
        <>
          <div
            className="overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-surface)]"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <RankingPodium
              topThree={topThree}
              dimension={dimension}
              unit={unit}
              currentUserId={currentUser?.id}
              formatValue={formatRankValue}
            />
          </div>

          {tableRows.length > 0 && (
            <div
              className="overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-surface)]"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <Table aria-label="运动排行榜">
                <Table.Content>
                  <Table.Header>
                    <Table.Column isRowHeader>排名</Table.Column>
                    <Table.Column>用户</Table.Column>
                    <Table.Column className="text-right">
                      {DIMENSION_OPTIONS.find((d) => d.value === dimension)?.label}
                    </Table.Column>
                  </Table.Header>
                  <Table.Body items={tableRows}>
                    {(row) => {
                      const isMe = row.user_id === currentUser?.id
                      return (
                        <Table.Row
                          key={row.user_id}
                          id={String(row.user_id)}
                          className={isMe ? 'border-l-[3px] border-l-[var(--color-primary)]' : ''}
                        >
                          <Table.Cell>
                            <RankDisplay rank={row.rank} />
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
                </Table.Content>
              </Table>
            </div>
          )}

          {myRank > 3 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-secondary)] bg-[color-mix(in_srgb,var(--color-secondary)_8%,white)] px-5 py-3">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-[var(--color-text-muted)]">我的排名</span>
                <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-text)]">
                  {myRankLabel}
                </span>
              </div>
              {myRank > 0 && (
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-[var(--color-text-muted)]">我的成绩</span>
                  <span className="font-[family-name:var(--font-data)] text-lg font-semibold text-[var(--color-secondary)]">
                    {formatRankValue(dimension, data.my_rank.value)}
                    <span className="ml-1 text-sm font-normal text-[var(--color-text-muted)]">{unit}</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
