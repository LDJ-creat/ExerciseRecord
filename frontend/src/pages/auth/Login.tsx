import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Label, TextField } from '@heroui/react'
import { login } from '../../api/auth'
import { setAuth } from '../../store/auth'
import { AuthLayout } from './AuthLayout'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login({ username, password })
      if (res.code !== 0 || !res.data) {
        setError(res.message || '登录失败')
        return
      }
      setAuth(res.data.token, res.data.user)
      navigate('/checkin')
    } catch {
      setError('用户名或密码错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="欢迎回来"
      subtitle="登录后继续你的运动节奏"
      footer={
        <>
          还没有账号？{' '}
          <Link to="/register" className="text-[var(--color-primary)] hover:underline">
            立即注册
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
            placeholder="输入用户名"
            autoComplete="username"
          />
        </TextField>

        <TextField isRequired>
          <Label>密码</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="输入密码"
            autoComplete="current-password"
          />
        </TextField>

        {error && (
          <p className="text-sm text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" fullWidth isPending={loading}>
          登录
        </Button>
      </form>
    </AuthLayout>
  )
}
