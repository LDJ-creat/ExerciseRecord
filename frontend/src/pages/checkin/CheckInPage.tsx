import { DashboardHero } from '../../components/DashboardHero'
import { PlaceholderPage } from '../../components/PlaceholderPage'

export default function CheckInPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHero />
      <PlaceholderPage
        title="运动打卡"
        description="打卡表单与记录列表将在 T02-04 实现。"
        taskId="T02-04"
      />
    </div>
  )
}
