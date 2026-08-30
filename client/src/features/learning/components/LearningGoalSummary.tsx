import * as React from "react"
import { ProgressBar, Badge } from "@/components/ui"
import { Target } from "lucide-react"
import type { WorkspaceGoal } from "../learning.types"

export interface LearningGoalSummaryProps {
  goal: WorkspaceGoal
}

export const LearningGoalSummary: React.FC<LearningGoalSummaryProps> = ({ goal }) => {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-2xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Target className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Learning Journey
            </span>
            <h2 className="text-sm font-bold text-foreground sm:text-base leading-tight">
              {goal.title}
            </h2>
          </div>
        </div>

        <Badge variant="outline" size="sm">
          {goal.level}
        </Badge>
      </div>

      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Journey Progress</span>
          <span className="font-bold text-primary">{goal.progress || 0}%</span>
        </div>
        <ProgressBar value={goal.progress || 0} size="sm" />
      </div>
    </div>
  )
}

export default LearningGoalSummary
