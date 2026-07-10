interface CircularProgressProps {
  percent: number
  achieved?: boolean
  size?: number
}

export function CircularProgress({ percent, achieved = false, size = 88 }: CircularProgressProps) {
  const stroke = 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, percent) / 100) * circumference
  const color = achieved ? 'var(--color-accent)' : 'var(--color-secondary)'

  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-[var(--motion-normal)] ease-out"
      />
    </svg>
  )
}
