import { useEffect } from 'react'

interface CheckInToastProps {
  message: string | null
  onDismiss: () => void
}

export function CheckInToast({ message, onDismiss }: CheckInToastProps) {
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(onDismiss, 3000)
    return () => window.clearTimeout(timer)
  }, [message, onDismiss])

  if (!message) return null

  return (
    <div
      role="status"
      className={[
        'fixed bottom-6 left-1/2 z-50 -translate-x-1/2',
        'rounded-[var(--radius-full)] px-5 py-2.5',
        'bg-[var(--color-text)] text-sm font-medium text-white',
        'shadow-[var(--shadow-elevated)]',
        'animate-[fadeIn_200ms_ease-out]',
      ].join(' ')}
    >
      {message}
    </div>
  )
}
