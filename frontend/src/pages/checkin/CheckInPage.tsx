import { useRef, useState } from 'react'
import { DashboardHero } from '../../components/DashboardHero'
import { CheckInToast } from '../../components/checkin/CheckInToast'
import { WeeklySummaryPanel } from '../../components/checkin/WeeklySummaryPanel'
import { useDashboardStatus } from '../../hooks/useDashboardStatus'
import CheckInForm from './CheckInForm'
import CheckInList from './CheckInList'

export default function CheckInPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const dashboard = useDashboardStatus(refreshKey)

  function handleMutate() {
    setRefreshKey((k) => k + 1)
    dashboard.refresh()
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        streak={dashboard.streak}
        todayChecked={dashboard.todayChecked}
        todayDuration={dashboard.todayDuration}
        loading={dashboard.loading}
        onQuickCheckIn={scrollToForm}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(400px,480px)_1fr]">
        <div ref={formRef}>
          <CheckInForm
            onSuccess={(msg) => {
              setToastMessage(msg)
              handleMutate()
            }}
          />
        </div>
        <div className="flex flex-col gap-6">
          <WeeklySummaryPanel key={refreshKey} />
          <CheckInList refreshKey={refreshKey} onMutate={handleMutate} onScrollToForm={scrollToForm} />
        </div>
      </div>
      <CheckInToast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </div>
  )
}
