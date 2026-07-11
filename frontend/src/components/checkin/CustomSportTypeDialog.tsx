import { useState } from 'react'
import { Button, Input, Label, Modal, TextField, useOverlayState } from '@heroui/react'
import { createSportType, type SportType } from '../../api/checkin'

interface CustomSportTypeDialogProps {
  state: ReturnType<typeof useOverlayState>
  onCreated: (sport: SportType) => void
}

export function CustomSportTypeDialog({ state, onCreated }: CustomSportTypeDialogProps) {
  const [name, setName] = useState('')
  const [needDistance, setNeedDistance] = useState(false)
  const [needCalories, setNeedCalories] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function resetForm() {
    setName('')
    setNeedDistance(false)
    setNeedCalories(true)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmed = name.trim()
    if (!trimmed) {
      setError('请输入运动类型名称')
      return
    }

    setSubmitting(true)
    try {
      const res = await createSportType({
        name: trimmed,
        need_distance: needDistance,
        need_calories: needCalories,
      })
      if (res.code !== 0 || !res.data) {
        setError(res.message || '创建失败')
        return
      }
      onCreated(res.data)
      resetForm()
      state.close()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        '创建失败，请稍后重试'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal state={state}>
      <Modal.Backdrop>
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>自定义运动类型</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <form id="custom-sport-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                <TextField isRequired>
                  <Label>类型名称</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例如：瑜伽、拳击、普拉提"
                    maxLength={20}
                  />
                </TextField>

                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-1 text-sm font-medium text-[var(--color-text)]">打卡字段</legend>
                  <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                    <input
                      type="checkbox"
                      checked={needDistance}
                      onChange={(e) => setNeedDistance(e.target.checked)}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                    记录距离
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                    <input
                      type="checkbox"
                      checked={needCalories}
                      onChange={(e) => setNeedCalories(e.target.checked)}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                    记录卡路里
                  </label>
                </fieldset>

                {error && (
                  <p className="text-sm text-[var(--color-danger)]" role="alert">
                    {error}
                  </p>
                )}
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="ghost"
                onPress={() => {
                  resetForm()
                  state.close()
                }}
              >
                取消
              </Button>
              <Button type="submit" form="custom-sport-form" variant="primary" isPending={submitting}>
                创建并使用
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
