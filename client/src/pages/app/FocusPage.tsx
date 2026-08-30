import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { PageContainer, PageHeader } from "@/components/layout"
import { PomodoroTimer } from "@/features/focus/components/PomodoroTimer"
import { Flame, Brain, ShieldCheck } from "lucide-react"

export const FocusPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const taskId = searchParams.get("taskId") || undefined
  const topicId = searchParams.get("topicId") || undefined

  return (
    <PageContainer maxWidth="md" className="space-y-4">
      {/* Compact Page Header */}
      <PageHeader
        title="Focus Mode & Pomodoro"
        description="Eliminate distractions and enter deep work. Focus minutes count toward your daily streak."
      />

      {/* Scaled-down Pomodoro Timer */}
      <PomodoroTimer initialTaskId={taskId} initialTopicId={topicId} />

      {/* Focus Productivity Guidelines - Compact Strip */}
      <div className="grid gap-2.5 sm:grid-cols-3">
        <div className="rounded-xl border border-border/80 bg-card p-2.5 space-y-0.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
            <Brain className="h-3.5 w-3.5" />
            <span>Single-Task Focus</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Work on only one specific concept during each sprint.
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-2.5 space-y-0.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold">
            <Flame className="h-3.5 w-3.5" />
            <span>Streak Fuel</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Every completed session counts toward your daily study goal.
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-2.5 space-y-0.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>True Rest Breaks</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Step away from screens during 5m breaks to refresh focus.
          </p>
        </div>
      </div>
    </PageContainer>
  )
}

export default FocusPage
