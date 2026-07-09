export function LaneStripe() {
  return (
    <div
      className="lane-stripe mt-6 flex flex-col gap-1.5"
      aria-hidden="true"
    >
      <span className="lane-stripe__line lane-stripe__line--1" />
      <span className="lane-stripe__line lane-stripe__line--2" />
      <span className="lane-stripe__line lane-stripe__line--3" />
    </div>
  )
}
