import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  Target,
  Sparkles,
  CheckCircle2,
  Circle,
  Timer,
  RefreshCw,
  BookOpen,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import { Button, ProgressBar, Card, CardHeader, CardTitle, CardContent } from "@/components/ui"
import { plannerApi, DailyLearningPlan } from "@/services/planner.api"
import { useAppContext } from "@/context/AppContext"

export interface DailyPlannerCardProps {
  onTaskToggled?: () => void
}

export const DailyPlannerCard: React.FC<DailyPlannerCardProps> = ({ onTaskToggled }) => {
  const navigate = useNavigate()
  const { goal, toggleTaskComplete } = useAppContext()
  const [plan, setPlan] = React.useState<DailyLearningPlan | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isTogglingId, setIsTogglingId] = React.useState<string | null>(null)

  const fetchPlan = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await plannerApi.getDailyPlan(60)
      setPlan(data)
    } catch {
      // Handled gracefully
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchPlan()
  }, [fetchPlan, goal])

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    try {
      setIsTogglingId(taskId)
      await toggleTaskComplete(taskId, !currentCompleted)
      await fetchPlan()
      if (onTaskToggled) onTaskToggled()
    } finally {
      setIsTogglingId(null)
    }
  }

  const handleStartFocus = (taskId?: string, topicId?: string) => {
    const params = new URLSearchParams()
    if (taskId) params.set("taskId", taskId)
    if (topicId) params.set("topicId", topicId)
    navigate(`/focus?${params.toString()}`)
  }

  if (isLoading && !plan) {
    return (
      <Card className="animate-pulse p-6 space-y-4">
        <div className="h-5 w-48 bg-muted rounded" />
        <div className="h-20 bg-muted/60 rounded-lg" />
        <div className="h-14 bg-muted/40 rounded-lg" />
      </Card>
    )
  }

  if (!plan || (plan.recommendedTasks.length === 0 && !plan.recommendedRevision)) {
    return null
  }

  const completedCount = plan.recommendedTasks.filter((t) => t.completed).length
  const totalCount = plan.recommendedTasks.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Target className="h-3.5 w-3.5" />
            </div>
            <CardTitle className="text-base font-bold text-foreground">
              What Should I Learn Today?
            </CardTitle>
            <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              Smart Plan
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {plan.greeting}! Personalized daily study plan based on your active goals & focus priorities
          </p>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={fetchPlan}
          leftIcon={<RefreshCw className="h-3 w-3" />}
          className="h-7 text-xs text-muted-foreground hover:text-foreground self-start sm:self-auto"
        >
          Refresh
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Focus Banner */}
        {plan.primaryFocus && (
          <div className="rounded-lg border border-border/80 bg-muted/30 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Primary Focus Topic
                </span>
              </div>
              <span className="text-xs font-semibold text-primary">
                {plan.primaryFocus.completionProgress}% Completed
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {plan.primaryFocus.topicName}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Skill: <strong>{plan.primaryFocus.skillName}</strong> &bull; Goal:{" "}
                  {plan.primaryFocus.goalTitle}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStartFocus(undefined, plan.recommendedTasks[0]?.topicId)}
                leftIcon={<Timer className="h-3.5 w-3.5 text-primary" />}
                className="h-7 text-xs shrink-0"
              >
                Focus Session (25m)
              </Button>
            </div>
          </div>
        )}

        {/* Action Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">
              Recommended Tasks ({completedCount}/{totalCount})
            </span>
            <span className="text-muted-foreground font-medium">
              Est. ~{plan.estimatedTotalMinutes} Minutes
            </span>
          </div>

          <ProgressBar value={progressPercent} size="sm" />

          <div className="space-y-1.5 pt-1">
            {plan.recommendedTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between rounded-lg border p-2.5 transition-all ${
                  task.completed
                    ? "border-border/50 bg-muted/20 text-muted-foreground"
                    : "border-border bg-card hover:border-border/80 shadow-2xs"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    disabled={isTogglingId === task.id}
                    onClick={() => handleToggleTask(task.id, task.completed)}
                    className="shrink-0 text-primary hover:scale-110 transition-transform focus-visible:outline-none"
                    aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-4 w-4 fill-primary text-primary-foreground" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-semibold truncate ${
                        task.completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {task.skillName} &rsaquo; {task.topicName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {task.estimatedMinutes}m
                  </span>

                  {!task.completed && (
                    <button
                      type="button"
                      title="Start Pomodoro Focus Mode on this task"
                      onClick={() => handleStartFocus(task.id, task.topicId)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:bg-primary/10 px-2 py-0.5 rounded transition-colors"
                    >
                      <Timer className="h-3 w-3" />
                      <span className="hidden sm:inline">Focus</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revision Recommendation (if any) */}
        {plan.recommendedRevision && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Recommended Revision: {plan.recommendedRevision.topicName} ({plan.recommendedRevision.skillName})
                </p>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80">
                  {plan.recommendedRevision.reason}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/learning")}
              rightIcon={<ArrowRight className="h-3 w-3" />}
              className="h-6 text-xs border-amber-500/40 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 shrink-0"
            >
              Review Topic
            </Button>
          </div>
        )}

        {/* Motivational Quote Footer */}
        <div className="flex items-center gap-1.5 pt-2 text-[11px] text-muted-foreground italic border-t border-border/60">
          <Sparkles className="h-3 w-3 text-primary shrink-0 not-italic" />
          <span>&ldquo;{plan.motivationalQuote}&rdquo;</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default DailyPlannerCard
