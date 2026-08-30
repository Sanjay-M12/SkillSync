import * as React from "react"
import { ProgressBar, Badge } from "@/components/ui"
import { Target, CheckCircle2 } from "lucide-react"
import type { GoalOverviewMetrics } from "../analytics.types"

export interface LearningOverviewProps {
  overview: GoalOverviewMetrics
}

export const LearningOverview: React.FC<LearningOverviewProps> = ({ overview }) => {
  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Goal Overview
            </span>
            <h2 className="text-lg font-bold text-foreground sm:text-xl leading-tight">
              {overview.goalTitle}
            </h2>
          </div>
        </div>

        <Badge variant="outline" size="sm">
          {overview.level}
        </Badge>
      </div>

      {/* Progress Bar & Details */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span className="text-foreground">Overall Goal Progress</span>
          <span className="text-primary font-bold">{overview.progressPercent}% Complete</span>
        </div>

        <ProgressBar value={overview.progressPercent} size="lg" />

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <strong className="text-foreground">{overview.completedTasks}</strong> of{" "}
            {overview.totalTasks} tasks completed
          </span>
          <span className="text-[11px] font-medium">
            {overview.totalTasks - overview.completedTasks} remaining
          </span>
        </div>
      </div>
    </div>
  )
}

export default LearningOverview
