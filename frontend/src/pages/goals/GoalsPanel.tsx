import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Button,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Select,
  Tabs,
  TextField,
} from '@heroui/react'
import {
  createGoal,
  getGoalProgress,
  listGoals,
  updateGoal,
  type Goal,
  type GoalProgress,
} from '../../api/goal'
import { CircularProgress } from '../../components/brand/CircularProgress'
import { EmptyState } from '../../components/brand/EmptyState'
import { SkeletonStatRow } from '../../components/brand/SkeletonStatCard'
import {
  formatPeriodRange,
  getPeriodRange,
  PERIOD_LABELS,
  PERIOD_MONTH,
  PERIOD_WEEK,
  STATUS_LABELS,
  TARGET_DISTANCE,
  TARGET_DURATION,
  TARGET_LABELS,
  TARGET_UNITS,
} from './goalUtils'

function GoalProgressCard({
  goal,
  featured = false,
  onSelect,
  selected,
}: {
  goal: GoalProgress
  featured?: boolean
  onSelect?: () => void
  selected?: boolean
}) {
  const achieved = goal.status === 1 || goal.progress_percent >= 100
  const barValue = Math.min(100, goal.progress_percent)
  const flashRef = useRef(false)
  const [flash, setFlash] = useState(false)
  const ringSize = featured ? 112 : 88

  useEffect(() => {
    if (achieved && !flashRef.current) {
      flashRef.current = true
      setFlash(true)
      const timer = window.setTimeout(() => setFlash(false), 300)
      return () => window.clearTimeout(timer)
    }
  }, [achieved])

  const Wrapper = onSelect ? 'button' : 'article'

  return (
    <Wrapper
      type={onSelect ? 'button' : undefined}
      onClick={onSelect}
      className={[
        'w-full rounded-[var(--radius-md)] border bg-[var(--color-surface)] p-5 text-left shadow-[var(--shadow-card)] transition-[border-color,box-shadow]',
        flash ? 'border-[var(--color-accent)] shadow-[0_0_0_2px_rgba(245,158,11,0.25)]' : 'border-[var(--color-border)]',
        onSelect && !selected ? 'hover:border-[var(--color-primary)]/40' : '',
        onSelect && selected ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/20' : '',
        onSelect ? 'pressable cursor-pointer' : '',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="relative flex items-center gap-4">
          <div className="relative shrink-0">
            <CircularProgress percent={barValue} achieved={achieved} size={ringSize} />
            <span
              className={[
                'absolute inset-0 flex items-center justify-center font-semibold text-[var(--color-text)]',
                featured ? 'text-data-lg' : 'text-data-md',
              ].join(' ')}
            >
              {goal.progress_percent}%
            </span>
          </div>
          <div>
            <h3 className={featured ? 'text-display-lg text-[var(--color-text)]' : 'text-heading text-[var(--color-text)]'}>
              {PERIOD_LABELS[goal.period_type] ?? '目标'}
            </h3>
            <p className="text-body-sm text-[var(--color-text-muted)]">
              {TARGET_LABELS[goal.target_type]} · {formatPeriodRange(goal.period_start, goal.period_end)}
            </p>
            <p className="mt-3 text-body-sm text-[var(--color-text-muted)]">
              <span className={featured ? 'text-data-lg text-[var(--color-text)]' : 'text-data-md text-[var(--color-text)]'}>
                {goal.actual_value}
              </span>
              {' / '}
              <span className={featured ? 'text-data-lg' : 'text-data-md'}>{goal.target_value}</span>
              {' '}
              {TARGET_UNITS[goal.target_type]}
            </p>
          </div>
        </div>
        <span
          className={[
            'rounded-full px-2.5 py-0.5 text-xs font-medium',
            goal.status === 1
              ? 'bg-[rgba(245,158,11,0.15)] text-[var(--color-accent)]'
              : goal.status === 2
                ? 'bg-[rgba(100,116,139,0.12)] text-[var(--color-text-muted)]'
                : 'bg-[rgba(13,148,136,0.12)] text-[var(--color-secondary)]',
          ].join(' ')}
        >
          {STATUS_LABELS[goal.status] ?? '进行中'}
        </span>
      </div>
    </Wrapper>
  )
}

function GoalForm({
  periodType,
  existing,
  onSaved,
}: {
  periodType: number
  existing?: GoalProgress
  onSaved: () => void
}) {
  const [targetType, setTargetType] = useState(String(existing?.target_type ?? TARGET_DURATION))
  const [targetValue, setTargetValue] = useState(existing ? String(existing.target_value) : '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setTargetType(String(existing?.target_type ?? TARGET_DURATION))
    setTargetValue(existing ? String(existing.target_value) : '')
    setError('')
  }, [existing, periodType])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const value = Number(targetValue)
    if (!targetValue || Number.isNaN(value) || value <= 0) {
      setError('请填写有效的目标值')
      return
    }

    setSubmitting(true)
    try {
      if (existing) {
        const res = await updateGoal(existing.id, { target_value: value })
        if (res.code !== 0) {
          setError(res.message || '更新目标失败')
          return
        }
      } else {
        const range = getPeriodRange(periodType)
        const res = await createGoal({
          period_type: periodType,
          target_type: Number(targetType),
          target_value: value,
          period_start: range.start,
          period_end: range.end,
        })
        if (res.code !== 0) {
          setError(res.message || '设定目标失败')
          return
        }
      }
      onSaved()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        '操作失败，请稍后重试'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {!existing && (
        <Select
          selectedKey={targetType}
          onSelectionChange={(key) => setTargetType(String(key))}
        >
          <Label>指标类型</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {Object.entries(TARGET_LABELS).map(([key, label]) => (
                <ListBoxItem key={key} id={key} textValue={label}>
                  {label}
                </ListBoxItem>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      )}

      <TextField isRequired className="max-w-xs">
        <Label>目标值{existing ? '（可修改）' : ''}</Label>
        <Input
          type="number"
          min={1}
          step={targetType === String(TARGET_DISTANCE) ? 0.1 : 1}
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          placeholder={`输入目标${TARGET_UNITS[Number(targetType)] ?? ''}`}
        />
      </TextField>

      {error && (
        <p className="text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" className="w-fit pressable" isPending={submitting}>
        {existing ? '保存修改' : '设定目标'}
      </Button>
    </form>
  )
}

function HistoryGoalCard({ goal }: { goal: Goal }) {
  return (
    <article className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-[var(--color-text)]">
            {PERIOD_LABELS[goal.period_type]} · {TARGET_LABELS[goal.target_type]}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            {formatPeriodRange(goal.period_start, goal.period_end)}
          </p>
        </div>
        <span
          className={[
            'rounded-full px-2.5 py-0.5 text-xs font-medium',
            goal.status === 1
              ? 'bg-[rgba(245,158,11,0.15)] text-[var(--color-accent)]'
              : 'bg-[rgba(100,116,139,0.12)] text-[var(--color-text-muted)]',
          ].join(' ')}
        >
          {STATUS_LABELS[goal.status] ?? '—'}
        </span>
      </div>
      <p className="mt-3 text-data-md text-[var(--color-text)]">
        目标 {goal.target_value} {TARGET_UNITS[goal.target_type]}
      </p>
    </article>
  )
}

export function GoalsPanel() {
  const [mainTab, setMainTab] = useState<string>('current')
  const [periodTab, setPeriodTab] = useState<string>(String(PERIOD_WEEK))
  const [progressGoals, setProgressGoals] = useState<GoalProgress[]>([])
  const [historyGoals, setHistoryGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState('')

  const periodType = Number(periodTab)

  const loadProgress = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const res = await getGoalProgress()
      if (res.code !== 0) {
        setError(res.message || '加载目标进度失败')
        return
      }
      setProgressGoals(res.data?.goals ?? [])
    } catch {
      setError('加载目标进度失败')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const res = await listGoals(true)
      if (res.code === 0) setHistoryGoals(res.data?.goals ?? [])
    } catch {
      setHistoryGoals([])
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  useEffect(() => {
    if (mainTab === 'history') loadHistory()
  }, [mainTab, loadHistory])

  const weekGoal = progressGoals.find((g) => g.period_type === PERIOD_WEEK)
  const monthGoal = progressGoals.find((g) => g.period_type === PERIOD_MONTH)
  const activeGoal = periodType === PERIOD_MONTH ? monthGoal : weekGoal
  const inactiveGoal = periodType === PERIOD_MONTH ? weekGoal : monthGoal

  return (
    <Tabs selectedKey={mainTab} onSelectionChange={(key) => setMainTab(String(key))}>
      <Tabs.ListContainer>
        <Tabs.List aria-label="目标视图">
          <Tabs.Tab id="current">
            当前进度
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="history">
            历史记录
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>

      <Tabs.Panel id="current" className="mt-4">
        {error && (
          <p className="mb-4 text-sm text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <SkeletonStatRow count={1} />
            <SkeletonStatRow count={1} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2" role="group" aria-label="周期类型">
                <Button
                  type="button"
                  variant={periodType === PERIOD_WEEK ? 'primary' : 'ghost'}
                  size="sm"
                  onPress={() => setPeriodTab(String(PERIOD_WEEK))}
                >
                  周目标
                </Button>
                <Button
                  type="button"
                  variant={periodType === PERIOD_MONTH ? 'primary' : 'ghost'}
                  size="sm"
                  onPress={() => setPeriodTab(String(PERIOD_MONTH))}
                >
                  月目标
                </Button>
              </div>
              <p className="text-body-sm text-[var(--color-text-muted)]">
                周期 {formatPeriodRange(getPeriodRange(periodType).start, getPeriodRange(periodType).end)}
              </p>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-4">
                {activeGoal ? (
                  <GoalProgressCard goal={activeGoal} featured />
                ) : progressGoals.length === 0 ? (
                  <EmptyState
                    title="还没有设定目标"
                    description="在右侧填写目标值，开始追踪运动节奏"
                  />
                ) : (
                  <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-6 py-10 text-center">
                    <p className="text-heading text-[var(--color-text)]">
                      尚未设定{PERIOD_LABELS[periodType]}
                    </p>
                    <p className="mt-2 text-body-sm text-[var(--color-text-muted)]">
                      在右侧创建{PERIOD_LABELS[periodType]}，追踪这一周期的进度
                    </p>
                  </div>
                )}

                {inactiveGoal && (
                  <GoalProgressCard
                    goal={inactiveGoal}
                    onSelect={() =>
                      setPeriodTab(String(inactiveGoal.period_type === PERIOD_MONTH ? PERIOD_MONTH : PERIOD_WEEK))
                    }
                    selected={false}
                  />
                )}
              </div>

              <aside className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
                <h3 className="text-heading text-[var(--color-text)]">
                  {activeGoal ? '调整目标' : '设定目标'}
                </h3>
                <p className="mt-1 text-body-sm text-[var(--color-text-muted)]">
                  {TARGET_LABELS[activeGoal?.target_type ?? TARGET_DURATION]} · {PERIOD_LABELS[periodType]}
                </p>
                <div className="mt-5">
                  <GoalForm
                    periodType={periodType}
                    existing={activeGoal}
                    onSaved={() => loadProgress(true)}
                  />
                </div>
              </aside>
            </div>
          </div>
        )}
      </Tabs.Panel>

      <Tabs.Panel id="history" className="mt-4">
        {historyLoading ? (
          <SkeletonStatRow count={2} />
        ) : historyGoals.length === 0 ? (
          <EmptyState title="暂无历史目标" description="完成或过期后的目标会显示在这里" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {historyGoals.map((goal) => (
              <HistoryGoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </Tabs.Panel>
    </Tabs>
  )
}
