import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Label, TextField } from '@heroui/react'
import { register } from '../../api/auth'
import { AuthLayout } from './AuthLayout'

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('密码至少需要 6 位')
      return
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)
    try {
      const res = await register({ username, password, nickname: nickname || username })
      if (res.code !== 0) {
        if (res.code === 40901) {
          setError('用户名已被占用')
        } else if (res.code === 40001) {
          setError('密码至少需要 6 位')
        } else {
          setError(res.message || '注册失败')
        }
        return
      }
      navigate('/login', { state: { registered: true } })
    } catch {
      setError('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="创建账号"
      subtitle="开始记录你的运动节奏"
      footer={
        <>
          已有账号？{' '}
          <Link to="/login" className="text-[var(--color-primary)] hover:underline">
            去登录
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField isRequired>
          <Label>用户名</Label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="设置用户名"
            autoComplete="username"
          />
        </TextField>

        <TextField>
          <Label>昵称</Label>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="显示名称（可选）"
          />
        </TextField>

        <TextField isRequired>
          <Label>密码</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 6 位"
            autoComplete="new-password"
          />
        </TextField>

        <TextField isRequired>
          <Label>确认密码</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="再次输入密码"
            autoComplete="new-password"
          />
        </TextField>

        {error && (
          <p className="text-sm text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" fullWidth isPending={loading}>
          注册
        </Button>
      </form>
    </AuthLayout>
  )
}
