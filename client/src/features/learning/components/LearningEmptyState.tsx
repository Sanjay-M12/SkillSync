import * as React from "react"
import { Link } from "react-router-dom"
import { EmptyState, Button } from "@/components/ui"
import { Sparkles, Plus } from "lucide-react"

export interface LearningEmptyStateProps {
  onAddSkill?: () => void
  isGoalPresent?: boolean
}

export const LearningEmptyState: React.FC<LearningEmptyStateProps> = ({
  onAddSkill,
  isGoalPresent = false,
}) => {
  if (isGoalPresent) {
    return (
      <div className="py-12">
        <EmptyState
          icon={Sparkles}
          title="No skills added yet"
          description="Your learning goal is ready. Add your first skill to start structuring topics and actionable tasks."
          action={
            onAddSkill ? (
              <Button size="md" onClick={onAddSkill} leftIcon={<Plus className="h-4 w-4" />}>
                Add First Skill
              </Button>
            ) : undefined
          }
        />
      </div>
    )
  }

  return (
    <div className="py-12">
      <EmptyState
        icon={Sparkles}
        title="No learning path available"
        description="You haven't set up your learning goals yet. Get started by creating your personalized learning path to track skills, topics, and daily focus."
        action={
          <Link to="/onboarding">
            <Button size="md" leftIcon={<Sparkles className="h-4 w-4" />}>
              Get Started
            </Button>
          </Link>
        }
      />
    </div>
  )
}

export default LearningEmptyState
