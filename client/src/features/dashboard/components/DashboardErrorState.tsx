import * as React from "react"
import { ErrorState } from "@/components/ui"

export interface DashboardErrorStateProps {
  onRetry: () => void
}

export const DashboardErrorState: React.FC<DashboardErrorStateProps> = ({ onRetry }) => {
  return (
    <div className="py-8">
      <ErrorState
        title="We couldn't load your learning data"
        description="There was a temporary issue loading your active learning goal and progress. Please try again."
        onRetry={onRetry}
        retryLabel="Try Again"
      />
    </div>
  )
}

export default DashboardErrorState
