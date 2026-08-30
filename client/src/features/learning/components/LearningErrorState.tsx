import * as React from "react"
import { ErrorState } from "@/components/ui"

export interface LearningErrorStateProps {
  onRetry: () => void
}

export const LearningErrorState: React.FC<LearningErrorStateProps> = ({ onRetry }) => {
  return (
    <div className="py-12">
      <ErrorState
        title="We couldn't load your learning journey"
        description="There was a problem retrieving your skills and topics. Please try again."
        onRetry={onRetry}
        retryLabel="Try Again"
      />
    </div>
  )
}

export default LearningErrorState
