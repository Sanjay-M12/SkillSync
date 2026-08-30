import * as React from "react"
import { Link } from "react-router-dom"
import { Button, ProgressBar, Badge, Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui"
import { Target, ArrowRight, BookOpen, Layers, Sparkles, CheckCircle2 } from "lucide-react"
import type { DashboardGoal } from "../dashboard.types"

export interface CurrentGoalCardProps {
  goal: DashboardGoal
}

export const CurrentGoalCard: React.FC<CurrentGoalCardProps> = ({ goal }) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      {/* Header with Badge and Level */}
      <CardHeader className="pb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Active Learning Goal
            </span>
            <CardTitle className="text-base sm:text-lg font-bold text-foreground">
              {goal.title}
            </CardTitle>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 sm:pt-0">
          <Badge variant="outline" size="sm">
            {goal.level}
          </Badge>
          <Badge variant="secondary" size="sm">
            {goal.targetWeeklyHours}h / week
          </Badge>
        </div>
      </CardHeader>

      {/* Progress Bar & Numerical Metrics */}
      <CardContent className="space-y-4 flex-1 flex flex-col justify-center py-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
            <span className="text-foreground">Overall Goal Progress</span>
            <span className="text-primary font-bold">{goal.progressPercent}% Complete</span>
          </div>

          <ProgressBar value={goal.progressPercent} size="md" />

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-0.5">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <strong className="text-foreground">{goal.completedSkills}</strong> of{" "}
              {goal.totalSkills} skills completed
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
              <strong className="text-foreground">{goal.completedTopics}</strong> of{" "}
              {goal.totalTopics} topics mastered
            </span>
          </div>
        </div>

        {/* Quick Motivation / Next Step Banner */}
        <div className="rounded-lg border border-border/70 bg-muted/25 p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-foreground">
                {goal.progressPercent === 100
                  ? "Goal Completed! 🎉"
                  : goal.progressPercent > 0
                  ? "Great momentum!"
                  : "Ready to start your journey?"}
              </span>
              <p className="text-[11px] text-muted-foreground truncate">
                {goal.progressPercent === 100
                  ? "You've mastered all skills in this curriculum."
                  : "Open your workspace to explore skills, topics, and tasks."}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 font-medium">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span>Tracked live</span>
          </div>
        </div>
      </CardContent>

      {/* Action footer */}
      <CardFooter className="flex items-center justify-between pt-2 border-t border-border/60">
        <p className="text-xs text-muted-foreground hidden sm:block">
          Progress is automatically updated as you complete tasks.
        </p>

        <Link to="/learning" className="w-full sm:w-auto">
          <Button size="sm" className="w-full sm:w-auto shadow-2xs" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
            Continue Learning
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default CurrentGoalCard
