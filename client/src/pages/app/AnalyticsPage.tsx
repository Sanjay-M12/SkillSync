import * as React from "react"
import { PageContainer, PageHeader } from "@/components/layout"
import { useAppContext } from "@/context/AppContext"
import { analyticsApi, AnalyticsData as BackendAnalyticsData } from "@/services/analytics.api"
import {
  buildAnalyticsData,
  LearningOverview,
  AnalyticsMetricCard,
  WeeklyStudyActivity,
  SkillProgressList,
  ConfidenceInsights,
  LearningHeatmap,
  AnalyticsEmptyState,
  formatMinutes,
} from "@/features/analytics"

import { Clock, Flame, AlertCircle, RefreshCw, Trophy } from "lucide-react"

import { Button } from "@/components/ui"

export const AnalyticsPage: React.FC = () => {
  const { goal } = useAppContext()
  const [backendData, setBackendData] = React.useState<BackendAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchAnalytics = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await analyticsApi.getAnalytics()
      setBackendData(data)
    } catch {
      setError("Unable to load analytics data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics, goal])

  // Derive rich analytics view model from goal, backend workload, and streak data
  const data = React.useMemo(() => {
    if (!goal) return null
    const analytics = buildAnalyticsData(goal)

    // Enhance key metrics with backend workload if available
    if (backendData?.workload) {
      analytics.keyMetrics.studyTimeFormatted = formatMinutes(
        backendData.workload.completedEstimatedMinutes || 0
      )
    }

    // Enhance key metrics and weekly study activity with real streak tracking data
    if (backendData?.streak) {
      const s = backendData.streak
      analytics.keyMetrics.streakDays = s.currentStreak
      analytics.keyMetrics.longestStreak = s.longestStreak
      analytics.keyMetrics.activeDaysThisWeek = s.weekly.activeDays
      analytics.keyMetrics.monthlyConsistency = s.monthly.consistencyPercentage

      analytics.weeklyActivity = {
        days: s.weekly.days.map((d) => ({
          day: d.day,
          shortDay: d.shortDay,
          minutes: d.minutesStudied,
          formattedTime: formatMinutes(d.minutesStudied),
          isToday: d.isToday,
        })),
        totalWeeklyFormatted: `${s.weekly.totalHoursThisWeek}h`,
        totalMinutes: Math.round(s.weekly.totalHoursThisWeek * 60),
      }
    }

    return analytics
  }, [goal, backendData])


  const hasData = !!goal && goal.skills.length > 0

  return (
    <PageContainer maxWidth="lg" className="space-y-6">
      {/* Section 1 — Page Header */}
      <PageHeader
        title="Analytics"
        description="Understand your progress, consistency, and learning patterns."
      />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="h-44 rounded-xl bg-card border border-border" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-28 rounded-xl bg-card border border-border" />
            <div className="h-28 rounded-xl bg-card border border-border" />
            <div className="h-28 rounded-xl bg-card border border-border" />
          </div>
          <div className="h-52 rounded-xl bg-card border border-border" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchAnalytics}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && !hasData && <AnalyticsEmptyState />}

      {/* Active Analytics Dashboard */}
      {!isLoading && !error && hasData && data && (
        <div className="space-y-6 animate-in fade-in-0 duration-200">
          {/* Section 2 — Learning Overview */}
          <LearningOverview overview={data.overview} />

          {/* Section 3 — Key Performance & Streak Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AnalyticsMetricCard
              label="Completed Workload"
              value={data.keyMetrics.studyTimeFormatted}
              subtitle="Derived from finished task estimates"
              icon={Clock}
              iconColor="text-primary bg-primary/10"
            />
            <AnalyticsMetricCard
              label="Current Learning Streak"
              value={`${data.keyMetrics.streakDays} Days`}
              subtitle={
                data.keyMetrics.activeDaysThisWeek !== undefined
                  ? `${data.keyMetrics.activeDaysThisWeek}/7 active days this week`
                  : "Consecutive study days 🔥"
              }
              icon={Flame}
              iconColor="text-amber-600 bg-amber-500/10"
            />
            <AnalyticsMetricCard
              label="All-Time Longest Streak"
              value={`${data.keyMetrics.longestStreak || data.keyMetrics.streakDays} Days`}
              subtitle={
                data.keyMetrics.monthlyConsistency !== undefined
                  ? `${data.keyMetrics.monthlyConsistency}% monthly consistency`
                  : "Personal streak milestone 🏆"
              }
              icon={Trophy}
              iconColor="text-purple-600 bg-purple-500/10"
            />
            <AnalyticsMetricCard
              label="Topics Needing Revision"
              value={`${data.keyMetrics.revisionTopicsCount} Topics`}
              subtitle="Rated Weak or Needs Revision"
              icon={AlertCircle}
              iconColor="text-rose-600 bg-rose-500/10"
            />
          </div>


          {/* Section 4 — Weekly Study Activity */}
          <WeeklyStudyActivity activity={data.weeklyActivity} />

          {/* Section 5 — GitHub-Style Learning Heatmap */}
          {backendData?.streak?.heatmap && (
            <LearningHeatmap
              heatmap={backendData.streak.heatmap}
              currentStreak={backendData.streak.currentStreak}
              longestStreak={backendData.streak.longestStreak}
            />
          )}

          {/* Section 6 — Skill Progress Breakdown */}
          <SkillProgressList skills={data.skillProgressList} />

          {/* Section 7 — Confidence & Revision Insights */}
          <ConfidenceInsights confidenceSummary={data.confidenceSummary} />
        </div>
      )}

    </PageContainer>
  )
}

export default AnalyticsPage
