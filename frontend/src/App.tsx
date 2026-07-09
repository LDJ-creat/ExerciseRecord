import { Button } from '@heroui/react'

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-bg)] p-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-text)]">
        运动打卡系统
      </h1>
      <p className="font-[family-name:var(--font-body)] text-[var(--color-text-muted)]">
        Dawn Track · 晨曦跑道
      </p>
      <Button variant="primary">开始打卡</Button>
    </div>
  )
}

export default App
