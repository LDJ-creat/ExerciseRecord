import { useCallback, useEffect, useState } from 'react'
import { Label, ListBox, ListBoxItem, Select, Tabs } from '@heroui/react'
import { getPersonalStats, type PersonalStatsData, type StatsPeriod } from '../../api/stats'
import { GoalsPanel } from '../../pages/goals/GoalsPanel'
import { SummaryStatRow } from '../brand/SummaryStatRow'
import { SkeletonStatRow } from '../brand/SkeletonStatCard'
import { StatsDistributionChart, StatsTrendChart } from '../stats/StatsCharts'

const PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: 'day', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'all', label: '全部' },
]

export function InsightsTabs() {
  const [tab, setTab] = useState('goals')
  const [period, setPeriod] = useState<StatsPeriod>('month')
  const [data, setData] = useState<PersonalStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStats = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError('')
    try {
      const res = await getPersonalStats(period)
      if (signal?.aborted) return
      if (res.code !== 0 || !res.data) {
        setError(res.message || '加载统计数据失败')
        setData(null)
        return
      }
      setData(res.data)
    } catch {
      if (signal?.aborted) return
      setError('加载统计数据失败')
      setData(null)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [period])

  useEffect(() => {
    const controller = new AbortController()
    void loadStats(controller.signal)
    return () => controller.abort()
  }, [loadStats])

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-[var(--radius-sm)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonStatRow count={4} />
      ) : data?.summary ? (
        <SummaryStatRow summary={data.summary} />
      ) : null}

      <Tabs selectedKey={tab} onSelectionChange={(key) => setTab(String(key))}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs.ListContainer>
            <Tabs.List aria-label="数据视图">
              <Tabs.Tab id="goals">
                目标
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="trend">
                趋势
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="distribution">
                分布
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          {tab !== 'goals' && (
            <Select
              aria-label="统计周期"
              selectedKey={period}
              onSelectionChange={(key) => {
                if (key) setPeriod(String(key) as StatsPeriod)
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
          )}
        </div>

        <Tabs.Panel id="goals" className="mt-4">
          <GoalsPanel />
        </Tabs.Panel>

        <Tabs.Panel id="trend" className="mt-4">
          {loading ? (
            <div className="h-72 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-surface-elevated)]" />
          ) : data ? (
            <StatsTrendChart data={data} />
          ) : null}
        </Tabs.Panel>

        <Tabs.Panel id="distribution" className="mt-4">
          {loading ? (
            <div className="h-72 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-surface-elevated)]" />
          ) : data ? (
            <StatsDistributionChart data={data} />
          ) : null}
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}
