import * as React from "react"
import { Link } from "react-router-dom"
import { EmptyState, Button } from "@/components/ui"
import { BarChart3, Plus } from "lucide-react"

export const AnalyticsEmptyState: React.FC = () => {
  return (
    <div className="py-12">
      <EmptyState
        icon={BarChart3}
        title="No learning data yet"
        description="Create and organize a learning journey to start seeing your progress, study consistency, and learning insights."
        action={
          <Link to="/onboarding">
            <Button size="md" leftIcon={<Plus className="h-4 w-4" />}>
              Create Learning Journey
            </Button>
          </Link>
        }
      />
    </div>
  )
}

export default AnalyticsEmptyState
