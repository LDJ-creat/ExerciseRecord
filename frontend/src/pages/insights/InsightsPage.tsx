import { PageHeader } from '../../components/brand/PageHeader'
import { InsightsTabs } from '../../components/insights/InsightsTabs'

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_200ms_ease-out]">
      <PageHeader
        title="数据与目标"
        subtitle="追踪周/月目标，查看运动统计与趋势"
      />
      <InsightsTabs />
    </div>
  )
}
