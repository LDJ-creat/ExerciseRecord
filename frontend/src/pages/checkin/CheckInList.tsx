import { useCallback, useEffect, useState } from 'react'
import {
  Button,
  Calendar,
  DatePicker,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Modal,
  Select,
  Table,
  TextField,
  useOverlayState,
} from '@heroui/react'
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
import { findSportType, SportBadge } from './sportUtils'

interface CheckInListProps {
  refreshKey?: number
  onMutate?: () => void
}

function formatCalendarDate(date: CalendarDate) {
  const month = String(date.month).padStart(2, '0')
  const day = String(date.day).padStart(2, '0')
  return `${date.year}-${month}-${day}`
}

export default function CheckInList({ refreshKey = 0, onMutate }: CheckInListProps) {
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
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-text)]">
          打卡记录
          <span className="ml-2 font-[family-name:var(--font-data)] text-sm font-normal text-[var(--color-text-muted)]">
            共 {total} 条
          </span>
        </h2>

        <div className="flex flex-wrap items-end gap-3">
          <TextField>
            <Label className="text-xs">开始日期</Label>
            <Input
              type="date"
              value={filterStart}
              onChange={(e) => setFilterStart(e.target.value)}
            />
          </TextField>
          <TextField>
            <Label className="text-xs">结束日期</Label>
            <Input
              type="date"
              value={filterEnd}
              onChange={(e) => setFilterEnd(e.target.value)}
            />
          </TextField>
          <div>
            <Label className="mb-1.5 block text-xs">运动类型</Label>
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
        <p className="text-sm text-[var(--color-text-muted)]">加载中…</p>
      ) : error ? (
        <p className="text-sm text-[var(--color-danger)]">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">暂无打卡记录，完成第一次打卡吧</p>
      ) : (
        <Table aria-label="打卡记录">
          <Table.Content>
            <Table.Header>
              <Table.Column>日期</Table.Column>
              <Table.Column>运动类型</Table.Column>
              <Table.Column>时长</Table.Column>
              <Table.Column>距离</Table.Column>
              <Table.Column>卡路里</Table.Column>
              <Table.Column>备注</Table.Column>
              <Table.Column>操作</Table.Column>
            </Table.Header>
            <Table.Body items={items}>
              {(item) => {
                const sport = findSportType(sportTypes, item.sport_type_id)
                return (
                  <Table.Row key={item.id} id={String(item.id)}>
                    <Table.Cell>
                      <span className="font-[family-name:var(--font-data)] text-sm">
                        {item.check_date}
                      </span>
                      {item.is_makeup === 1 && (
                        <span className="ml-2 rounded-full bg-[var(--color-accent)]/15 px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                          补录
                        </span>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <SportBadge sport={sport} size="sm" />
                    </Table.Cell>
                    <Table.Cell>
                      <span className="font-[family-name:var(--font-data)]">{item.duration} 分</span>
                    </Table.Cell>
                    <Table.Cell>
                      {item.distance != null ? `${item.distance} km` : '—'}
                    </Table.Cell>
                    <Table.Cell>
                      {item.calories != null ? item.calories : '—'}
                    </Table.Cell>
                    <Table.Cell className="max-w-[120px] truncate">
                      {item.remark || '—'}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onPress={() => openEdit(item)}>
                          编辑
                        </Button>
                        <Button variant="ghost" size="sm" onPress={() => openDelete(item)}>
                          删除
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )
              }}
            </Table.Body>
          </Table.Content>
        </Table>
      )}

      <Modal state={editModal}>
        <Modal.Backdrop>
          <Modal.Container size="md">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>编辑打卡</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-4">
                <Select
                  selectedKey={editSportTypeId}
                  onSelectionChange={(key) => setEditSportTypeId(String(key))}
                  fullWidth
                >
                  <Label>运动类型</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {sportTypes.map((sport) => (
                        <ListBoxItem key={String(sport.id)} id={String(sport.id)} textValue={sport.name}>
                          <SportBadge sport={sport} size="sm" />
                        </ListBoxItem>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>

                <DatePicker
                  value={editDate}
                  onChange={(value) => value && setEditDate(value)}
                  maxValue={maxDate}
                >
                  <div className="flex items-center gap-2">
                    <Label>打卡日期</Label>
                    {editIsMakeup && (
                      <span className="rounded-full bg-[var(--color-accent)]/15 px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                        补录
                      </span>
                    )}
                  </div>
                  <DatePicker.Trigger className="flex w-full items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 font-[family-name:var(--font-data)] text-sm">
                    {formatCalendarDate(editDate)}
                    <DatePicker.TriggerIndicator />
                  </DatePicker.Trigger>
                  <DatePicker.Popover>
                    <Calendar>
                      <Calendar.Header>
                        <Calendar.NavButton slot="previous" />
                        <Calendar.Heading />
                        <Calendar.NavButton slot="next" />
                      </Calendar.Header>
                      <Calendar.Grid>
                        <Calendar.GridHeader>
                          {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                        </Calendar.GridHeader>
                        <Calendar.GridBody>
                          {(date) => <Calendar.Cell date={date} />}
                        </Calendar.GridBody>
                      </Calendar.Grid>
                    </Calendar>
                  </DatePicker.Popover>
                </DatePicker>

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
                <p className="text-sm text-[var(--color-text-muted)]">
                  确定删除{' '}
                  <span className="font-[family-name:var(--font-data)] text-[var(--color-text)]">
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
    </section>
  )
}
