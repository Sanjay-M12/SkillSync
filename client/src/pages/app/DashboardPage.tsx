import * as React from "react"
import { PageContainer } from "@/components/layout"
import { useAppContext } from "@/context/AppContext"
import { dashboardApi, DashboardData } from "@/services/dashboard.api"
import {
  DashboardWelcome,
  CurrentGoalCard,
  WeeklyActivity,
  ProductivityInsightsCard,
  DashboardEmptyState,
  defaultMockDashboardData,
  type DashboardGoal,
  type RevisionTopicItem,
  type WeeklyActivityData,
} from "@/features/dashboard"
import { LearningHeatmap, AnalyticsMetricCard } from "@/features/analytics"
import { AlertCircle, RefreshCw, Target, Flame, Clock, Trophy } from "lucide-react"
import { Button } from "@/components/ui"

export const DashboardPage: React.FC = () => {
  const { user, goal } = useAppContext()
  const [dashboardData, setDashboardData] = React.useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchDashboard = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await dashboardApi.getDashboard()
      setDashboardData(data)
    } catch {
      setError("Unable to load dashboard data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard, goal])

  // Derive active goal for CurrentGoalCard
  const dashboardGoal = React.useMemo<DashboardGoal | null>(() => {
    if (goal) {
      const allTopics = goal.skills.flatMap((s) => s.topics)
      const completedTopics = allTopics.filter(
        (t) => (t.progress || 0) === 100
      ).length
      const completedSkills = goal.skills.filter(
        (s) => (s.progress || 0) === 100
      ).length

      return {
        id: goal.id,
        title: goal.title,
        level: goal.level,
        progressPercent: goal.progress || 0,
        targetWeeklyHours: goal.weeklyHours,
        totalSkills: goal.skills.length,
        completedSkills,
        totalTopics: allTopics.length,
        completedTopics,
      }
    }

    if (dashboardData && dashboardData.recentGoals.length > 0) {
      const top = dashboardData.recentGoals[0]
      return {
        id: top.id,
        title: top.title,
        level: top.currentLevel.charAt(0) + top.currentLevel.slice(1).toLowerCase(),
        progressPercent: top.progress,
        targetWeeklyHours: 10,
        totalSkills: 0,
        completedSkills: 0,
        totalTopics: 0,
        completedTopics: 0,
      }
    }

    return null
  }, [goal, dashboardData])

  // Derive revision topics
  const revisionQueue = React.useMemo<RevisionTopicItem[]>(() => {
    if (!goal) return []

    const items: RevisionTopicItem[] = []
    for (const skill of goal.skills) {
      for (const topic of skill.topics) {
        if (topic.confidence === "WEAK" || topic.confidence === "NEEDS_REVISION") {
          items.push({
            id: topic.id,
            topicTitle: topic.name,
            skillTitle: skill.name,
            confidence: topic.confidence,
          })
        }
      }
    }
    return items
  }, [goal])

  // Derive live streak & weekly activity data
  const weeklyActivity = React.useMemo<WeeklyActivityData>(() => {
    if (dashboardData?.streak) {
      const s = dashboardData.streak
      return {
        days: s.weekly.days.map((d) => ({
          day: d.day,
          shortDay: d.shortDay,
          date: d.date,
          minutesStudied: d.minutesStudied,
          tasksCompleted: d.tasksCompleted,
          isActive: d.isActive,
          isToday: d.isToday,
        })),
        activeDays: s.weekly.activeDays,
        totalDays: s.weekly.totalDays,
        totalHoursThisWeek: s.weekly.totalHoursThisWeek,
        targetWeeklyHours: goal?.weeklyHours || s.weekly.targetWeeklyHours || 10,
        streakDays: s.currentStreak,
        longestStreak: s.longestStreak,
        isCompletedToday: s.todayStatus.isCompletedToday,
        tasksCompletedToday: s.todayStatus.tasksCompletedToday,
        minutesStudiedToday: s.todayStatus.minutesStudiedToday,
        statusMessage: s.todayStatus.message,
        monthly: s.monthly
          ? {
              activeDays: s.monthly.activeDays,
              totalDays: s.monthly.totalDays,
              consistencyPercentage: s.monthly.consistencyPercentage,
              monthName: s.monthly.monthName,
              year: s.monthly.year,
              days: s.monthly.days.map((d) => ({
                day: d.day,
                shortDay: d.shortDay,
                date: d.date,
                minutesStudied: d.minutesStudied,
                tasksCompleted: d.tasksCompleted,
                isActive: d.isActive,
                isToday: d.isToday,
              })),
            }
          : undefined,
      }
    }
    return defaultMockDashboardData.weeklyActivity
  }, [dashboardData, goal])

  const hasGoals = (dashboardData && dashboardData.summary.totalGoals > 0) || !!goal

  return (
    <PageContainer className="space-y-5">
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-14 rounded-xl bg-card border border-border" />
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="h-24 rounded-xl bg-card border border-border" />
            <div className="h-24 rounded-xl bg-card border border-border" />
            <div className="h-24 rounded-xl bg-card border border-border" />
            <div className="h-24 rounded-xl bg-card border border-border" />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="h-56 rounded-xl bg-card border border-border" />
            <div className="h-56 rounded-xl bg-card border border-border" />
          </div>
        </div>
      )}

      {/* Error Banner */}
      {!isLoading && error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchDashboard}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Empty State (No Active Goal) */}
      {!isLoading && !error && !hasGoals && (
        <div className="space-y-5">
          <DashboardWelcome userName={user.name} />
          <DashboardEmptyState />
        </div>
      )}

      {/* Active Dashboard Viewport - Clean 2-Column Compact Layout */}
      {!isLoading && !error && hasGoals && dashboardGoal && (
        <div className="space-y-5 animate-in fade-in-0 duration-150">
          {/* Welcome Header */}
          <DashboardWelcome userName={user.name} />

          {/* Row 1 — Key Performance Metrics Grid */}
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            <AnalyticsMetricCard
              label="Goal Progress"
              value={`${dashboardGoal.progressPercent}%`}
              subtitle={`${dashboardGoal.completedSkills} / ${dashboardGoal.totalSkills} skills completed`}
              icon={Target}
              iconColor="text-primary bg-primary/10"
            />
            <AnalyticsMetricCard
              label="Current Streak"
              value={`${weeklyActivity.streakDays} Days`}
              subtitle={`${weeklyActivity.activeDays ?? 0} / 7 active days this week`}
              icon={Flame}
              iconColor="text-amber-500 bg-amber-500/10"
            />
            <AnalyticsMetricCard
              label="Study Time This Week"
              value={`${weeklyActivity.totalHoursThisWeek}h`}
              subtitle={`Target: ${weeklyActivity.targetWeeklyHours}h / week`}
              icon={Clock}
              iconColor="text-emerald-500 bg-emerald-500/10"
            />
            <AnalyticsMetricCard
              label="Best Streak Record"
              value={`${weeklyActivity.longestStreak || weeklyActivity.streakDays} Days`}
              subtitle={
                weeklyActivity.monthly
                  ? `${weeklyActivity.monthly.consistencyPercentage}% monthly consistency`
                  : "All-time consistency record"
              }
              icon={Trophy}
              iconColor="text-purple-500 bg-purple-500/10"
            />
          </div>

          {/* Row 2 — 2-Column Layout: Active Learning Goal (Left) & Consistency / 7-Day Activity (Right) */}
          <div className="grid gap-5 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col">
              <CurrentGoalCard goal={dashboardGoal} />
            </div>

            <div className="lg:col-span-6 flex flex-col">
              <WeeklyActivity activity={weeklyActivity} />
            </div>
          </div>

          {/* Row 3 — 2-Column Layout: Learning Heatmap (Left - 8 cols) & Productivity Insights (Right - 4 cols) */}
          <div className="grid gap-5 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-8 flex flex-col">
              {dashboardData?.streak?.heatmap && (
                <LearningHeatmap
                  heatmap={dashboardData.streak.heatmap}
                  currentStreak={dashboardData.streak.currentStreak}
                  longestStreak={dashboardData.streak.longestStreak}
                />
              )}
            </div>

            <div className="lg:col-span-4 flex flex-col">
              <ProductivityInsightsCard
                revisionQueue={revisionQueue}
                streakDays={weeklyActivity.streakDays}
              />
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default DashboardPage
