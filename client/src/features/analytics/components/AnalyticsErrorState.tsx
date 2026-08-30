import * as React from "react"
import { ErrorState } from "@/components/ui"

export interface AnalyticsErrorStateProps {
  onRetry: () => void
}

export const AnalyticsErrorState: React.FC<AnalyticsErrorStateProps> = ({ onRetry }) => {
  return (
    <div className="py-12">
      <ErrorState
        title="We couldn't load your learning insights"
        description="There was an issue compiling your progress and study analytics. Please try again."
        onRetry={onRetry}
        retryLabel="Try Again"
      />
    </div>
  )
}

export default AnalyticsErrorState
