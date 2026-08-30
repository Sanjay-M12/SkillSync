import * as React from "react"
import { Target, Award, Clock, Sparkles } from "lucide-react"

export interface StepReviewProps {
  goalTitle: string
  level: string
  weeklyHours: number
}

export const StepReview: React.FC<StepReviewProps> = ({
  goalTitle,
  level,
  weeklyHours,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-foreground sm:text-lg">
          Ready to build your learning journey!
        </h3>
        <p className="text-xs text-muted-foreground">
          Review your personalized settings. We will configure your interactive workspace.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-4">
        {/* Goal */}
        <div className="flex items-center gap-3 border-b border-border/80 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Primary Goal
            </span>
            <p className="text-sm font-bold text-foreground">{goalTitle}</p>
          </div>
        </div>

        {/* Level */}
        <div className="flex items-center gap-3 border-b border-border/80 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 flex-shrink-0">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Experience Level
            </span>
            <p className="text-sm font-bold text-foreground">{level}</p>
          </div>
        </div>

        {/* Commitment */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 flex-shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Target Commitment
            </span>
            <p className="text-sm font-bold text-foreground">{weeklyHours} Hours / Week</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 flex items-center gap-2.5 text-xs text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
        <span>Your structured skills, topics, and tasks will be automatically initialized.</span>
      </div>
    </div>
  )
}

export default StepReview
