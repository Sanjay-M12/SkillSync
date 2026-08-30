import * as React from "react"
import { Flame, Clock, Calendar, Trophy, Zap, CheckCircle2, BarChart2, CalendarDays } from "lucide-react"
import { ProgressBar, Card, CardHeader, CardTitle, CardContent } from "@/components/ui"
import type { WeeklyActivityData } from "../dashboard.types"

export interface WeeklyActivityProps {
  activity: WeeklyActivityData
}

export const WeeklyActivity: React.FC<WeeklyActivityProps> = ({ activity }) => {
  const [activeTab, setActiveTab] = React.useState<"week" | "month">("week")

  const maxMinutes = Math.max(...activity.days.map((d) => d.minutesStudied), 60)
  const targetPercent = Math.min(
    100,
    Math.round((activity.totalHoursThisWeek / (activity.targetWeeklyHours || 10)) * 100)
  )

  const activeDaysCount =
    activity.activeDays !== undefined
      ? activity.activeDays
      : activity.days.filter((d) => d.minutesStudied > 0 || (d.tasksCompleted && d.tasksCompleted > 0)).length

  const isTodayComplete =
    activity.isCompletedToday !== undefined
      ? activity.isCompletedToday
      : activity.days.some((d) => d.isToday && (d.minutesStudied > 0 || (d.tasksCompleted && d.tasksCompleted > 0)))

  return (
    <Card className="h-full flex flex-col justify-between">
      {/* Header: Title & Badges */}
      <CardHeader className="pb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold text-foreground">
              Consistency &amp; Learning Streaks
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Track daily study habits, weekly consistency, and active milestones
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
            <span>{activity.streakDays}d Streak</span>
          </div>

          <div className="flex items-center gap-1 rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
            <Trophy className="h-3 w-3" />
            <span>Best: {activity.longestStreak || activity.streakDays}d</span>
          </div>

          <div className="flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <CalendarDays className="h-3 w-3" />
            <span>{activeDaysCount}/7d</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 flex flex-col justify-between py-2">
        {/* Today's Learning Status Callout Banner */}
        <div
          className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors ${
            isTodayComplete
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {isTodayComplete ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <Zap className="h-4 w-4 text-amber-500 shrink-0" />
            )}
            <span className="font-semibold">
              {isTodayComplete
                ? "Today's Status: Complete! 🔥 Streak secured."
                : "Today's Status: Let's get started! ⚡"}
            </span>
          </div>

          {activity.tasksCompletedToday !== undefined && activity.tasksCompletedToday > 0 && (
            <span className="hidden sm:inline font-bold text-[11px]">
              {activity.tasksCompletedToday} tasks done
            </span>
          )}
        </div>

        {/* View Switcher: 7-Day Bars vs Monthly Consistency */}
        <div className="flex items-center justify-between border-b border-border/70 pb-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Activity View
          </span>
          <div className="flex items-center rounded-lg bg-muted/60 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("week")}
              className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition-all ${
                activeTab === "week"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart2 className="h-3 w-3" />
              <span>Past 7 Days</span>
            </button>
            {activity.monthly && (
              <button
                type="button"
                onClick={() => setActiveTab("month")}
                className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition-all ${
                  activeTab === "month"
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="h-3 w-3" />
                <span>
                  {activity.monthly.monthName} ({activity.monthly.consistencyPercentage}%)
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: 7-Day Visual Bars */}
        {activeTab === "week" && (
          <div className="space-y-1 animate-in fade-in-50 duration-150">
            <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-20 pt-1 pb-1">
              {activity.days.map((day) => {
                const heightPercent = Math.max(8, Math.round((day.minutesStudied / maxMinutes) * 100))
                const hasActivity = day.minutesStudied > 0 || (day.tasksCompleted && day.tasksCompleted > 0)

                return (
                  <div
                    key={day.date || day.day}
                    className="flex flex-col items-center gap-1 h-full justify-end group cursor-pointer relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-foreground text-background text-[10px] px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-medium shadow-md">
                      {day.minutesStudied}m {day.tasksCompleted ? `• ${day.tasksCompleted} tasks` : ""}
                    </div>

                    {/* Vertical Bar */}
                    <div className="w-full max-w-[24px] h-full flex items-end bg-muted/30 rounded-t-md overflow-hidden">
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 ease-out ${
                          hasActivity
                            ? day.isToday
                              ? "bg-primary shadow-2xs"
                              : "bg-primary/75 group-hover:bg-primary"
                            : "bg-transparent"
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Day label */}
                    <span
                      className={`text-[10px] ${
                        day.isToday ? "font-bold text-primary" : "font-medium text-muted-foreground"
                      }`}
                    >
                      {day.shortDay}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>7-Day Breakdown</span>
              <span className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Today
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40" /> Past
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Monthly Consistency Calendar Heatmap */}
        {activeTab === "month" && activity.monthly && (
          <div className="space-y-1.5 animate-in fade-in-50 duration-150">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                {activity.monthly.monthName} {activity.monthly.year}
              </span>
              <span className="font-bold text-primary">
                {activity.monthly.activeDays}/{activity.monthly.totalDays} Days ({activity.monthly.consistencyPercentage}%)
              </span>
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-7 sm:grid-cols-10 gap-1 p-2 rounded-lg border border-border bg-muted/20">
              {activity.monthly.days.map((day, idx) => {
                const hasActivity =
                  day.minutesStudied > 0 || (day.tasksCompleted && day.tasksCompleted > 0)
                const dayNumber = idx + 1

                return (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.minutesStudied}m studied, ${day.tasksCompleted || 0} tasks`}
                    className={`flex flex-col items-center justify-center p-1 rounded-md border text-[9px] font-medium transition-all ${
                      day.isToday
                        ? "border-primary ring-1 ring-primary/40"
                        : "border-border/60"
                    } ${
                      hasActivity
                        ? "bg-primary text-primary-foreground font-bold"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    <span>{dayNumber}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Weekly Target Progress Summary */}
        <div className="rounded-lg border border-border/80 bg-muted/25 p-2.5 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Weekly Target: <strong>{activity.totalHoursThisWeek}</strong> /{" "}
              {activity.targetWeeklyHours} Hours
            </span>
            <span className="font-bold text-primary">{targetPercent}%</span>
          </div>
          <ProgressBar value={targetPercent} size="sm" />
        </div>
      </CardContent>
    </Card>
  )
}

export default WeeklyActivity
