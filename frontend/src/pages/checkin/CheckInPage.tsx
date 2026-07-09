import { useState } from 'react'
import { DashboardHero } from '../../components/DashboardHero'
import CheckInForm from './CheckInForm'
import CheckInList from './CheckInList'

export default function CheckInPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <CheckInForm onSuccess={() => setRefreshKey((k) => k + 1)} />
        <CheckInList
          refreshKey={refreshKey}
          onMutate={() => setRefreshKey((k) => k + 1)}
        />
      </div>
    </div>
  )
}
