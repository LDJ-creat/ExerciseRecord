interface IconProps {
  className?: string
  size?: number
}

function base({ className = '', size = 20 }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    className,
    'aria-hidden': true as const,
  }
}

export function AppLogo({ className = '', size = 24 }: IconProps) {
  const s = base({ className, size })
  return (
    <svg {...s}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M7 17 L11 11 L14 14 L17 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="7" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function IconCheckin({ className, size }: IconProps) {
  const s = base({ className, size })
  return (
    <svg {...s}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 8v4l2.5 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function IconInsights({ className, size }: IconProps) {
  const s = base({ className, size })
  return (
    <svg {...s}>
      <path d="M4 19V5M4 19h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M8 17V11M12 17V7M16 17v-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function IconRanking({ className, size }: IconProps) {
  const s = base({ className, size })
  return (
    <svg {...s}>
      <path d="M7 20V11M12 20V4M17 20v-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function IconCalendar({ className, size }: IconProps) {
  const s = base({ className, size })
  return (
    <svg {...s}>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function IconSettings({ className, size }: IconProps) {
  const s = base({ className, size })
  return (
    <svg {...s}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconProfile({ className, size }: IconProps) {
  const s = base({ className, size })
  return (
    <svg {...s}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M5 20c0-3.5 3.13-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function IconBell({ className, size }: IconProps) {
  const s = base({ className, size })
  return (
    <svg {...s}>
      <path
        d="M12 3a5 5 0 0 1 5 5v3l2 3H5l2-3V8a5 5 0 0 1 5-5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function IconHistory({ className, size }: IconProps) {
  const s = base({ className, size })
  return (
    <svg {...s}>
      <path d="M4 6h16M4 12h10M4 18h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function IconFlame({ className, size }: IconProps) {
  const s = base({ className, size })
  return (
    <svg {...s}>
      <path
        d="M12 3c-1.5 2.5-4 4-4 8a4 4 0 0 0 8 0c0-2-1-3.5-2.5-5.5-.5 1.5-1.5 2.5-1.5 2.5S13 5.5 12 3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconChevronRight({ className, size }: IconProps) {
  const s = base({ className, size })
  return (
    <svg {...s}>
      <path d="M10 8l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SportIcon({ code, className = 'h-6 w-6', size }: IconProps & { code: string }) {
  const s = base({ className, size: size ?? 24 })
  const stroke = { stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  switch (code) {
    case 'running':
      return (
        <svg {...s}>
          <circle cx="14" cy="5" r="2" {...stroke} fill="none" />
          <path d="M6 20l3-7 4 2 3-6 4 11H6Z" {...stroke} />
        </svg>
      )
    case 'walking':
      return (
        <svg {...s}>
          <circle cx="12" cy="4.5" r="2" {...stroke} fill="none" />
          <path d="M9 20l2-6 2 2 2-8 3 12" {...stroke} />
        </svg>
      )
    case 'cycling':
      return (
        <svg {...s}>
          <circle cx="7" cy="17" r="3" {...stroke} />
          <circle cx="17" cy="17" r="3" {...stroke} />
          <path d="M10 17h2l2-6h3l2 6" {...stroke} />
          <path d="M14 11l2-4h2" {...stroke} />
        </svg>
      )
    case 'swimming':
      return (
        <svg {...s}>
          <path d="M3 14c2-1 3-1 5 0s3 1 5 0 3-1 5 0" {...stroke} />
          <path d="M3 18c2-1 3-1 5 0s3 1 5 0 3-1 5 0" {...stroke} />
          <path d="M8 9l2-2 2 1 2-1" {...stroke} />
        </svg>
      )
    case 'fitness':
      return (
        <svg {...s}>
          <path d="M6 10h2v4H6v-4ZM16 10h2v4h-2v-4Z" {...stroke} />
          <path d="M8 12h8" {...stroke} />
        </svg>
      )
    default:
      return (
        <svg {...s}>
          <circle cx="12" cy="12" r="7" {...stroke} />
          <path d="M12 9v3.5l2.5 1.5" {...stroke} />
        </svg>
      )
  }
}
