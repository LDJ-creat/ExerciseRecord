interface LaneStripeProps {
  variant?: 'default' | 'hero'
  className?: string
}

export function LaneStripe({ variant = 'default', className = '' }: LaneStripeProps) {
  const isHero = variant === 'hero'
  return (
    <div
      className={[
        'lane-stripe flex flex-col gap-1.5',
        isHero ? 'lane-stripe--hero mt-8' : 'mt-6',
        className,
      ].join(' ')}
      aria-hidden="true"
    >
      <span className="lane-stripe__line lane-stripe__line--1" />
      <span className="lane-stripe__line lane-stripe__line--2" />
      <span className="lane-stripe__line lane-stripe__line--3" />
    </div>
  )
}
