import { useCallback, useEffect, useState } from 'react'
import {
  Button,
  Input,
  Label,
  Modal,
  TextField,
  useOverlayState,
} from '@heroui/react'
import { CheckInDateField, CheckInDateLabel } from '../../components/checkin/CheckInDateField'
import {
  getLocalTimeZone,
  parseDate,
  today,
  type CalendarDate,
} from '@internationalized/date'
import dayjs from 'dayjs'
import {
  deleteCheckIn,
  getSportTypes,
  listCheckIns,
  updateCheckIn,
  type CheckInRecord,
  type SportType,
} from '../../api/checkin'
import { ActivityCard } from '../../components/checkin/ActivityCard'
import { CustomSportTypeDialog } from '../../components/checkin/CustomSportTypeDialog'
import { SportTypeGrid } from '../../components/checkin/SportTypeGrid'
import { EmptyState } from '../../components/brand/EmptyState'
import { SkeletonTimeline } from '../../components/brand/SkeletonCalendarGrid'
import { findSportType } from './sportUtils'

interface CheckInListProps {
  refreshKey?: number
  onMutate?: () => void
  onScrollToForm?: () => void
}

function formatCalendarDate(date: CalendarDate) {
  const month = String(date.month).padStart(2, '0')
  const day = String(date.day).padStart(2, '0')
  return `${date.year}-${month}-${day}`
}

export default function CheckInList({
  refreshKey = 0,
  onMutate,
  onScrollToForm,
}: CheckInListProps) {
  const [sportTypes, setSportTypes] = useState<SportType[]>([])
  const [items, setItems] = useState<CheckInRecord[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [filterSportType, setFilterSportType] = useState<string>('all')

  const editModal = useOverlayState()
  const deleteModal = useOverlayState()
  const customSportModal = useOverlayState()
  const [editing, setEditing] = useState<CheckInRecord | null>(null)
  const [deleting, setDeleting] = useState<CheckInRecord | null>(null)

  const [editSportTypeId, setEditSportTypeId] = useState('')
  const [editDate, setEditDate] = useState<CalendarDate>(today(getLocalTimeZone()))
  const [editDuration, setEditDuration] = useState('')
  const [editDistance, setEditDistance] = useState('')
  const [editCalories, setEditCalories] = useState('')
  const [editRemark, setEditRemark] = useState('')
  const [modalError, setModalError] = useState('')
  const [saving, setSaving] = useState(false)

  const maxDate = today(getLocalTimeZone())
  const editSport = findSportType(sportTypes, Number(editSportTypeId))
  const editIsMakeup = editDate.compare(maxDate) < 0

  function handleCustomSportCreated(sport: SportType) {
    setSportTypes((prev) => [...prev, sport])
    setEditSportTypeId(String(sport.id))
  }

  const loadList = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: Parameters<typeof listCheckIns>[0] = {}
      if (filterStart) params.start_date = filterStart
      if (filterEnd) params.end_date = filterEnd
      if (filterSportType !== 'all') params.sport_type_id = Number(filterSportType)

      const res = await listCheckIns(params)
      if (res.code !== 0 || !res.data) {
        setError(res.message || '加载失败')
        return
      }
      setItems(res.data.items)
      setTotal(res.data.total)
    } catch {
      setError('加载打卡记录失败')
    } finally {
      setLoading(false)
    }
  }, [filterStart, filterEnd, filterSportType])

  useEffect(() => {
    getSportTypes()
      .then((res) => {
        if (res.code === 0 && res.data) setSportTypes(res.data)
      })
      .catch(() => setError('加载运动类型失败'))
  }, [])

  useEffect(() => {
    loadList()
  }, [loadList, refreshKey])

  function openEdit(record: CheckInRecord) {
    setEditing(record)
    setEditSportTypeId(String(record.sport_type_id))
    setEditDate(parseDate(record.check_date))
    setEditDuration(String(record.duration))
    setEditDistance(record.distance != null ? String(record.distance) : '')
    setEditCalories(record.calories != null ? String(record.calories) : '')
    setEditRemark(record.remark ?? '')
    setModalError('')
    editModal.open()
  }

  function openDelete(record: CheckInRecord) {
    setDeleting(record)
    setModalError('')
    deleteModal.open()
  }

  async function handleSaveEdit() {
    if (!editing) return
    setModalError('')
    const durationNum = Number(editDuration)
    if (!editDuration || Number.isNaN(durationNum) || durationNum < 0) {
      setModalError('请填写有效的运动时长')
      return
    }

    const payload: Parameters<typeof updateCheckIn>[1] = {
      sport_type_id: Number(editSportTypeId),
      check_date: formatCalendarDate(editDate),
      duration: durationNum,
      remark: editRemark.trim() || null,
    }

    if (editSport?.need_distance) {
      payload.distance = editDistance === '' ? null : Number(editDistance)
    }
    if (editSport?.need_calories) {
      payload.calories = editCalories === '' ? null : Number(editCalories)
    }

    setSaving(true)
    try {
      const res = await updateCheckIn(editing.id, payload)
      if (res.code !== 0) {
        setModalError(
          res.code === 40901
            ? '该日期已有相同运动类型的打卡记录'
            : res.message || '保存失败',
        )
        return
      }
      editModal.close()
      onMutate?.()
      loadList()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { code?: number; message?: string } } }
      setModalError(
        axiosErr.response?.data?.code === 40901
          ? '该日期已有相同运动类型的打卡记录'
          : '保存失败，请稍后重试',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleting) return
    setSaving(true)
    setModalError('')
    try {
      const res = await deleteCheckIn(deleting.id)
      if (res.code !== 0) {
        setModalError(res.message || '删除失败')
        return
      }
      deleteModal.close()
      onMutate?.()
      loadList()
    } catch {
      setModalError('删除失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section
      className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-6"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-heading text-[var(--color-text)]">
          打卡记录
          <span className="ml-2 text-data-md font-normal text-[var(--color-text-muted)]">
            共 {total} 条
          </span>
        </h2>

        <div className="flex flex-wrap items-end gap-2">
          <TextField>
            <Label className="text-xs">开始</Label>
            <Input
              type="date"
              value={filterStart}
              onChange={(e) => setFilterStart(e.target.value)}
            />
          </TextField>
          <TextField>
            <Label className="text-xs">结束</Label>
            <Input
              type="date"
              value={filterEnd}
              onChange={(e) => setFilterEnd(e.target.value)}
            />
          </TextField>
          <div>
            <Label className="mb-1.5 block text-xs">类型</Label>
            <select
              value={filterSportType}
              onChange={(e) => setFilterSportType(e.target.value)}
              aria-label="筛选运动类型"
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="all">全部</option>
              {sportTypes.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </select>
          </div>
          <Button variant="secondary" size="sm" onPress={loadList}>
            筛选
          </Button>
        </div>
      </div>

      {loading ? (
        <SkeletonTimeline items={3} />
      ) : error ? (
        <p className="text-sm text-[var(--color-danger)]">{error}</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="今天还没有记录"
          description="完成第一次打卡，把今天算进节奏里"
          actionLabel="去打卡"
          onAction={onScrollToForm}
        />
      ) : (
        <ul className="relative flex flex-col gap-4 pl-4">
          {items.map((item, index) => (
            <li key={item.id} className="relative pl-6">
              {index < items.length - 1 && (
                <span
                  className="absolute left-[7px] top-8 bottom-0 w-px bg-[var(--color-border)]"
                  aria-hidden
                />
              )}
              <span
                className="absolute left-0 top-3 h-3.5 w-3.5 rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-surface)]"
                aria-hidden
              />
              <ActivityCard
                record={item}
                sportTypes={sportTypes}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            </li>
          ))}
        </ul>
      )}

      <Modal state={editModal}>
        <Modal.Backdrop>
          <Modal.Container size="md">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>编辑打卡</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-4">
                <div>
                  <Label className="mb-2 block">运动类型</Label>
                  <SportTypeGrid
                    sports={sportTypes}
                    selectedId={editSportTypeId}
                    onSelect={setEditSportTypeId}
                    onAddCustom={customSportModal.open}
                  />
                </div>

                <CheckInDateField
                  label={<CheckInDateLabel isMakeup={editIsMakeup} />}
                  value={editDate}
                  onChange={setEditDate}
                  maxValue={maxDate}
                />

                <TextField isRequired>
                  <Label>时长 (分钟)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                  />
                </TextField>

                {editSport?.need_distance ? (
                  <TextField>
                    <Label>距离 (公里)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.1"
                      value={editDistance}
                      onChange={(e) => setEditDistance(e.target.value)}
                    />
                  </TextField>
                ) : null}

                {editSport?.need_calories ? (
                  <TextField>
                    <Label>卡路里</Label>
                    <Input
                      type="number"
                      min={0}
                      value={editCalories}
                      onChange={(e) => setEditCalories(e.target.value)}
                    />
                  </TextField>
                ) : null}

                <TextField>
                  <Label>备注</Label>
                  <Input value={editRemark} onChange={(e) => setEditRemark(e.target.value)} />
                </TextField>

                {modalError && (
                  <p className="text-sm text-[var(--color-danger)]" role="alert">
                    {modalError}
                  </p>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="ghost" onPress={editModal.close}>
                  取消
                </Button>
                <Button variant="primary" isPending={saving} onPress={handleSaveEdit}>
                  保存
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal state={deleteModal}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>确认删除</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-body-sm text-[var(--color-text-muted)]">
                  确定删除{' '}
                  <span className="text-data-md text-[var(--color-text)]">
                    {deleting ? dayjs(deleting.check_date).format('YYYY-MM-DD') : ''}
                  </span>{' '}
                  的打卡记录吗？此操作不可撤销。
                </p>
                {modalError && (
                  <p className="mt-2 text-sm text-[var(--color-danger)]">{modalError}</p>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="ghost" onPress={deleteModal.close}>
                  取消
                </Button>
                <Button variant="primary" isPending={saving} onPress={handleConfirmDelete}>
                  删除
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <CustomSportTypeDialog state={customSportModal} onCreated={handleCustomSportCreated} />
    </section>
  )
}
