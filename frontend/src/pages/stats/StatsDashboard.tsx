import { useCallback, useEffect, useState } from 'react'
import { Label, ListBox, ListBoxItem, Select } from '@heroui/react'
import {
  getPersonalStats,
  type PersonalStatsData,
  type StatsPeriod,
} from '../../api/stats'
import { PageHeader } from '../../components/brand/PageHeader'
import { SummaryStatRow } from '../../components/brand/SummaryStatRow'
import { SkeletonStatRow } from '../../components/brand/SkeletonStatCard'
import { StatsDistributionChart, StatsTrendChart } from '../../components/stats/StatsCharts'

const PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: 'day', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'all', label: '全部' },
]

type StatsMode = 'full' | 'charts-only' | 'summary-only'

interface StatsDashboardProps {
  embedded?: boolean
  mode?: StatsMode
  externalData?: PersonalStatsData | null
  externalLoading?: boolean
  externalError?: string
  period?: StatsPeriod
  onPeriodChange?: (period: StatsPeriod) => void
}

export default function StatsDashboard({
  embedded = false,
  mode = 'full',
  externalData,
  externalLoading,
  externalError,
  period: controlledPeriod,
  onPeriodChange,
}: StatsDashboardProps) {
  const [internalPeriod, setInternalPeriod] = useState<StatsPeriod>('month')
  const [internalData, setInternalData] = useState<PersonalStatsData | null>(null)
  const [internalLoading, setInternalLoading] = useState(true)
  const [internalError, setInternalError] = useState('')

  const period = controlledPeriod ?? internalPeriod
  const isControlled = externalData !== undefined

  const loadStats = useCallback(async (signal?: AbortSignal) => {
    if (isControlled) return
    setInternalLoading(true)
    setInternalError('')
    try {
      const res = await getPersonalStats(period)
      if (signal?.aborted) return
      if (res.code !== 0 || !res.data) {
        setInternalError(res.message || '加载统计数据失败')
        setInternalData(null)
        return
      }
      setInternalData(res.data)
    } catch {
      if (signal?.aborted) return
      setInternalError('加载统计数据失败')
      setInternalData(null)
    } finally {
      if (!signal?.aborted) setInternalLoading(false)
    }
  }, [period, isControlled])

  useEffect(() => {
    if (isControlled) return
    const controller = new AbortController()
    void loadStats(controller.signal)
    return () => controller.abort()
  }, [loadStats, isControlled])

  const data = isControlled ? externalData : internalData
  const loading = isControlled ? (externalLoading ?? false) : internalLoading
  const error = isControlled ? (externalError ?? '') : internalError

  function handlePeriodChange(key: StatsPeriod) {
    onPeriodChange?.(key)
    if (!controlledPeriod) setInternalPeriod(key)
  }

  const periodSelect = (
    <Select
      aria-label="统计周期"
      selectedKey={period}
      onSelectionChange={(key) => {
        if (key) handlePeriodChange(String(key) as StatsPeriod)
      }}
      className="w-36"
    >
      <Label>统计周期</Label>
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
  )

  return (
    <div className={embedded ? 'flex flex-col gap-6' : 'flex flex-col gap-6 animate-[fadeIn_200ms_ease-out]'}>
      {!embedded && (
        <PageHeader
          title="数据统计"
          subtitle="个人运动概览与趋势分析"
          actions={periodSelect}
        />
      )}

      {embedded && mode !== 'summary-only' && (
        <div className="flex justify-end">{periodSelect}</div>
      )}

      {error && (
        <div className="rounded-[var(--radius-sm)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonStatRow count={4} />
      ) : data?.summary ? (
        <>
          {(mode === 'full' || mode === 'summary-only') && (
            <SummaryStatRow summary={data.summary} />
          )}

          {(mode === 'full' || mode === 'charts-only') && (
            <div className="grid gap-6 lg:grid-cols-2">
              <StatsDistributionChart data={data} />
              <StatsTrendChart data={data} period={period} />
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
