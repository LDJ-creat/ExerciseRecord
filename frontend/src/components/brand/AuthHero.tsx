import { Link } from 'react-router-dom'
import { AppLogo, IconCheckin, IconInsights, IconRanking } from '../icons/AppIcons'
import { LaneStripe } from './LaneStripe'
import { getSportClass, SportIcon } from '../../pages/checkin/sportUtils'

const FEATURE_CARDS = [
  { icon: IconCheckin, title: '记录', desc: '3 步完成打卡' },
  { icon: IconInsights, title: '目标', desc: '追踪周/月进度' },
  { icon: IconRanking, title: '排行', desc: '与好友比拼' },
] as const

const PREVIEW_ACTIVITIES = [
  { code: 'running', name: '跑步', duration: 30, date: '今天', distance: '5.2 km' },
  { code: 'cycling', name: '骑行', duration: 45, date: '昨天', distance: '18 km' },
] as const

function TrackPerspective() {
  return (
    <svg
      className="auth-hero__track"
      viewBox="0 0 800 280"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="trackFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0" />
          <stop offset="35%" stopColor="#E2E8F0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="laneOrange" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF5C35" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="laneTeal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0D9488" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="800" height="280" fill="url(#trackFade)" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const x = 80 + i * 90
        return (
          <line
            key={i}
            x1={x}
            y1="40"
            x2={400}
            y2="280"
            stroke="#94A3B8"
            strokeWidth="1"
            strokeOpacity="0.25"
          />
        )
      })}
      <path
        d="M 120 120 Q 400 100 680 120"
        fill="none"
        stroke="url(#laneOrange)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M 100 155 Q 400 135 700 155"
        fill="none"
        stroke="url(#laneTeal)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M 80 190 Q 400 170 720 190"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="4"
        strokeLinecap="round"
        strokeOpacity="0.55"
      />
      <ellipse cx="400" cy="268" rx="360" ry="18" fill="#0D9488" fillOpacity="0.08" />
    </svg>
  )
}

function FeaturePreviewGrid() {
  return (
    <div className="absolute right-0 top-0 z-20 grid w-44 gap-2 xl:w-48">
      {FEATURE_CARDS.map(({ icon: Icon, title, desc }) => (
        <div
          key={title}
          className="auth-hero__preview-card rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-elevated)] text-[var(--color-primary)]">
              <Icon size={16} />
            </span>
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ActivityPreviewCard({
  activity,
  className = '',
}: {
  activity: (typeof PREVIEW_ACTIVITIES)[number]
  className?: string
}) {
  const sportClass = getSportClass(activity.code)
  return (
    <div
      className={[
        sportClass,
        'auth-hero__preview-card rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3',
        className,
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: 'color-mix(in srgb, var(--sport-color) 18%, white)', color: 'var(--sport-color)' }}
        >
          <SportIcon code={activity.code} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--color-text)]">{activity.name}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{activity.date}</p>
        </div>
        <span className="text-data-md text-sm text-[var(--color-text)]">{activity.duration}′</span>
      </div>
      <p className="mt-1.5 pl-11 text-xs text-[var(--color-text-muted)]">{activity.distance}</p>
    </div>
  )
}

interface AuthHeroProps {
  compact?: boolean
}

export function AuthHero({ compact = false }: AuthHeroProps) {
  if (compact) {
    return (
      <div className="auth-hero relative overflow-hidden rounded-[var(--radius-md)] p-6">
        <div className="auth-hero__orb auth-hero__orb--primary !h-40 !w-40" />
        <div className="relative z-10">
          <h1 className="text-display-lg text-[var(--color-text)]">
            把每一天的<span className="text-streak-gradient">运动</span>，算进节奏里
          </h1>
          <LaneStripe className="mt-4 max-w-[120px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="auth-hero relative flex min-h-screen w-full flex-col overflow-hidden">
      <div className="auth-hero__orb auth-hero__orb--primary" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-10 py-10 xl:px-14 xl:py-12">
        <Link to="/" className="flex items-center gap-2.5 text-display-lg text-[var(--color-text)]">
          <span className="text-[var(--color-primary)]">
            <AppLogo size={28} />
          </span>
          运动打卡
        </Link>

        <div className="mt-10 max-w-xl">
          <h1 className="text-display-xl leading-tight text-[var(--color-text)]">
            把每一天的
            <span className="text-streak-gradient">运动</span>
            <br />
            算进自己的节奏里
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-muted)]">
            记录、坚持、复盘。像跑道上的里程标记，清晰、有方向、有温度。
          </p>
          <LaneStripe className="mt-6 max-w-[160px]" />
        </div>

        <div className="relative mt-8 min-h-[240px] flex-1 xl:min-h-[280px]">
          <FeaturePreviewGrid />
          <div className="relative z-10 max-w-xs space-y-3 pt-4 xl:max-w-sm">
            <ActivityPreviewCard activity={PREVIEW_ACTIVITIES[0]} />
            <ActivityPreviewCard
              activity={PREVIEW_ACTIVITIES[1]}
              className="auth-hero__preview-card--delay ml-4 opacity-90"
            />
          </div>
        </div>
      </div>

      <TrackPerspective />
    </div>
  )
}
