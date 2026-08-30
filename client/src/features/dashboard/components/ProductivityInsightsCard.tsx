import * as React from "react"
import { Link } from "react-router-dom"
import { Lightbulb, ArrowRight, Timer, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button } from "@/components/ui"
import type { RevisionTopicItem } from "../dashboard.types"

export interface ProductivityInsightsCardProps {
  revisionQueue?: RevisionTopicItem[]
  streakDays?: number
}

export const ProductivityInsightsCard: React.FC<ProductivityInsightsCardProps> = ({
  revisionQueue = [],
  streakDays = 0,
}) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Productivity Insights
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-center space-y-3 py-2">
        {revisionQueue.length > 0 ? (
          <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{revisionQueue.length} {revisionQueue.length === 1 ? "topic needs" : "topics need"} revision</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Spaced revision now will reinforce memory retention before proceeding to new skills.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Consistency Rhythm</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Build daily learning momentum. 25-minute Pomodoro focus sprints log directly to your consistency streak.
            </p>
          </div>
        )}

        <div className="rounded-lg border border-border/70 bg-muted/25 p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Timer className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-medium text-foreground">Deep Work Habit</span>
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            {streakDays > 0 ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>{streakDays}d Streak Active 🔥</span>
              </>
            ) : (
              "Start today"
            )}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-border/60">
        {revisionQueue.length > 0 ? (
          <Link to="/learning" className="w-full">
            <Button variant="outline" size="sm" className="w-full justify-between text-xs" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
              Review Weak Topics
            </Button>
          </Link>
        ) : (
          <Link to="/focus" className="w-full">
            <Button size="sm" className="w-full justify-between text-xs shadow-2xs" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
              Start Focus Session
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}

export default ProductivityInsightsCard
