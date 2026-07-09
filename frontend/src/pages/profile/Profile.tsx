import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Input,
  Label,
  Tabs,
  TextField,
} from '@heroui/react'
import {
  changePassword,
  getProfile,
  updateProfile,
  type UserProfile,
} from '../../api/auth'
import { clearAuth, getUser, updateStoredUser } from '../../store/auth'

const GENDER_OPTIONS = [
  { id: '0', label: '未知' },
  { id: '1', label: '男' },
  { id: '2', label: '女' },
]

export default function Profile() {
  const navigate = useNavigate()
  const storedUser = getUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  const [nickname, setNickname] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [gender, setGender] = useState('0')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    setLoading(true)
    try {
      const res = await getProfile()
      if (res.code !== 0 || !res.data) return
      const data = res.data
      setProfile(data)
      setNickname(data.nickname)
      setAvatarUrl(data.avatar_url ?? '')
      setGender(String(data.gender))
      setHeight(data.height != null ? String(data.height) : '')
      setWeight(data.weight != null ? String(data.weight) : '')
    } catch {
      setProfileError('加载资料失败')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setSaving(true)
    try {
      const payload: Parameters<typeof updateProfile>[0] = {
        nickname,
        avatar_url: avatarUrl || null,
        gender: Number(gender),
        height: height === '' ? null : Number(height),
        weight: weight === '' ? null : Number(weight),
      }

      const res = await updateProfile(payload)
      if (res.code !== 0 || !res.data) {
        setProfileError(res.message || '保存失败')
        return
      }
      setProfile(res.data)
      if (storedUser) {
        updateStoredUser({ ...storedUser, nickname: res.data.nickname })
      }
      setProfileSuccess('资料已更新')
    } catch {
      setProfileError('保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword.length < 6) {
      setPasswordError('新密码至少需要 6 位')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的新密码不一致')
      return
    }

    setChangingPassword(true)
    try {
      const res = await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      })
      if (res.code !== 0) {
        setPasswordError(
          res.code === 40001 ? '旧密码不正确' : res.message || '修改失败',
        )
        return
      }
      setPasswordSuccess('密码已更新，请使用新密码登录')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setPasswordError('修改失败，请稍后重试')
    } finally {
      setChangingPassword(false)
    }
  }

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <p className="font-[family-name:var(--font-body)] text-[var(--color-text-muted)]">
          加载中…
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-text)]">
            个人资料
          </h1>
          <div className="flex items-center gap-4">
            <span className="font-[family-name:var(--font-body)] text-sm text-[var(--color-text-muted)]">
              {profile?.nickname ?? storedUser?.nickname}
            </span>
            <Button variant="ghost" size="sm" onPress={handleLogout}>
              退出
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div
          className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-6"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <Tabs>
            <Tabs.ListContainer>
              <Tabs.List aria-label="资料设置">
                <Tabs.Tab id="profile">
                  编辑资料
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="password">
                  <Tabs.Separator />
                  修改密码
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>

            <Tabs.Panel id="profile" className="pt-6">
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                <TextField>
                  <Label>用户名</Label>
                  <Input value={profile?.username ?? ''} readOnly />
                </TextField>

                <TextField isRequired>
                  <Label>昵称</Label>
                  <Input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="你的昵称"
                  />
                </TextField>

                <TextField>
                  <Label>头像 URL</Label>
                  <Input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </TextField>

                <div>
                  <Label className="mb-1.5 block">性别</Label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    aria-label="性别"
                    className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-[family-name:var(--font-body)] text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    {GENDER_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <TextField>
                    <Label>身高 (cm)</Label>
                    <Input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="175"
                    />
                  </TextField>
                  <TextField>
                    <Label>体重 (kg)</Label>
                    <Input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="70"
                    />
                  </TextField>
                </div>

                {profileError && (
                  <p className="text-sm text-[var(--color-danger)]">{profileError}</p>
                )}
                {profileSuccess && (
                  <p className="text-sm text-[var(--color-secondary)]">{profileSuccess}</p>
                )}

                <Button type="submit" variant="primary" isPending={saving}>
                  保存修改
                </Button>
              </form>
            </Tabs.Panel>

            <Tabs.Panel id="password" className="pt-6">
              <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                <TextField isRequired>
                  <Label>当前密码</Label>
                  <Input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </TextField>

                <TextField isRequired>
                  <Label>新密码</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="至少 6 位"
                  />
                </TextField>

                <TextField isRequired>
                  <Label>确认新密码</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </TextField>

                {passwordError && (
                  <p className="text-sm text-[var(--color-danger)]">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-sm text-[var(--color-secondary)]">{passwordSuccess}</p>
                )}

                <Button type="submit" variant="primary" isPending={changingPassword}>
                  更新密码
                </Button>
              </form>
            </Tabs.Panel>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
