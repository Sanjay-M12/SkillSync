import * as React from "react"
import { Trophy, Award, Sparkles, Filter, RefreshCw, AlertCircle } from "lucide-react"
import { PageContainer, PageHeader } from "@/components/layout"
import { Button, ProgressBar } from "@/components/ui"
import { achievementsApi, UserAchievementsSummary } from "@/services/achievements.api"
import { AchievementCard } from "@/features/achievements/components/AchievementCard"


export const AchievementsPage: React.FC = () => {
  const [data, setData] = React.useState<UserAchievementsSummary | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeFilter, setActiveFilter] = React.useState<string>("ALL")

  const fetchAchievements = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const summary = await achievementsApi.getAchievements()
      setData(summary)
    } catch {
      setError("Unable to load achievements. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  const filteredAchievements = React.useMemo(() => {
    if (!data) return []
    switch (activeFilter) {
      case "UNLOCKED":
        return data.achievements.filter((a) => a.isUnlocked)
      case "LOCKED":
        return data.achievements.filter((a) => !a.isUnlocked)
      case "STREAK":
      case "TASKS":
      case "GOALS":
      case "MASTERY":
      case "FOCUS":
        return data.achievements.filter((a) => a.category === activeFilter)
      case "ALL":
      default:
        return data.achievements
    }
  }, [data, activeFilter])

  return (
    <PageContainer maxWidth="lg" className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Milestones & Achievements"
        description="Celebrate your learning consistency, streak records, and mastery breakthroughs."
      />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="h-32 rounded-xl bg-card border border-border" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-36 rounded-xl bg-card border border-border" />
            ))}
          </div>
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
            onClick={fetchAchievements}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Active Achievements Content */}
      {!isLoading && !error && data && (
        <div className="space-y-6 animate-in fade-in-0 duration-200">
          {/* Summary Banner */}
          <div className="rounded-xl border border-primary/20 bg-linear-to-br from-card via-card to-primary/10 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 ring-4 ring-amber-500/10 shrink-0">
                <Trophy className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">
                    Level & Achievement Score
                  </h3>
                  <span className="flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
                    <Sparkles className="h-3 w-3" /> {data.totalPoints} Points
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Unlocked <strong>{data.unlockedCount}</strong> of{" "}
                  <strong>{data.totalCount}</strong> achievements ({data.unlockedPercentage}%)
                </p>
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 self-center">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Overall Completion</span>
                <span className="text-primary">{data.unlockedPercentage}%</span>
              </div>
              <ProgressBar value={data.unlockedPercentage} size="md" />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground mr-1 font-semibold">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter:</span>
            </div>
            {[
              { label: "All Badges", value: "ALL" },
              { label: "Unlocked", value: "UNLOCKED" },
              { label: "In Progress", value: "LOCKED" },
              { label: "🔥 Streaks", value: "STREAK" },
              { label: "🎯 Tasks", value: "TASKS" },
              { label: "⏱️ Focus", value: "FOCUS" },
              { label: "🧠 Mastery", value: "MASTERY" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveFilter(tab.value)}
                className={`rounded-full px-3.5 py-1 font-medium transition-all shrink-0 ${
                  activeFilter === tab.value
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Badges Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAchievements.map((achievement) => (
              <AchievementCard key={achievement.key} achievement={achievement} />
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-8 text-center space-y-2">
              <Award className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">No badges in this category yet</p>
              <p className="text-xs text-muted-foreground">Keep learning and completing focus tasks to unlock them!</p>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  )
}

export default AchievementsPage
