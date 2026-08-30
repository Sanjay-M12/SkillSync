import * as React from "react"
import { Link } from "react-router-dom"
import { EmptyState, Button } from "@/components/ui"
import { Compass, Plus } from "lucide-react"

export const DashboardEmptyState: React.FC = () => {
  return (
    <div className="py-8">
      <EmptyState
        icon={Compass}
        title="No learning journey yet."
        description="Create your first learning goal to start organizing skills, tracking progress, and building consistency."
        action={
          <Link to="/onboarding">
            <Button size="md" leftIcon={<Plus className="h-4 w-4" />}>
              Create Learning Goal
            </Button>
          </Link>
        }
      />
    </div>
  )
}

export default DashboardEmptyState
