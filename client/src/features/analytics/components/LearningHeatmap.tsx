import * as React from "react"
import { Calendar, Flame, Clock, CheckCircle2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui"
import type { ActivityHeatmap } from "@/services/streak.api"

export interface LearningHeatmapProps {
  heatmap?: ActivityHeatmap
  currentStreak?: number
  longestStreak?: number
}

export const LearningHeatmap: React.FC<LearningHeatmapProps> = ({
  heatmap,
  currentStreak = 0,
  longestStreak = 0,
}) => {
  if (!heatmap || !heatmap.weeks || heatmap.weeks.length === 0) {
    return null
  }

  const getLevelClasses = (level: 0 | 1 | 2 | 3) => {
    switch (level) {
      case 3:
        return "bg-emerald-600 dark:bg-emerald-400 text-white dark:text-black shadow-2xs"
      case 2:
        return "bg-emerald-500/80 dark:bg-emerald-500/80 text-white dark:text-black"
      case 1:
        return "bg-emerald-500/35 dark:bg-emerald-500/35 text-foreground"
      case 0:
      default:
        return "bg-muted/40 hover:bg-muted/70 text-muted-foreground"
    }
  }

  return (
    <Card className="h-full flex flex-col justify-between space-y-4">
      {/* Header with Title & Stats */}
      <CardHeader className="pb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold text-foreground">
              Learning Activity Heatmap
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            GitHub-style study frequency over the past {heatmap.weeks.length} weeks
          </p>
        </div>

        {/* Quick summary pill counters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-md border border-border/80 bg-muted/30 px-2 py-0.5 text-xs font-semibold text-foreground">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            <span>{heatmap.totalActiveDays} Active Days</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-md border border-border/80 bg-muted/30 px-2 py-0.5 text-xs font-semibold text-foreground">
            <Clock className="h-3 w-3 text-primary" />
            <span>{heatmap.totalHours}h Studied</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <Flame className="h-3 w-3 fill-amber-500" />
            <span>{currentStreak}d Streak</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Grid Container with Horizontal Scroll support */}
        <div className="overflow-x-auto pb-1">
          <div className="inline-block min-w-full space-y-1">
            {/* Month labels row */}
            <div className="flex text-[10px] font-semibold text-muted-foreground mb-1 pl-7">
              {heatmap.weeks.map((week, idx) => (
                <div key={idx} className="w-3.5 sm:w-4 text-center shrink-0">
                  {week.monthLabel || ""}
                </div>
              ))}
            </div>

            {/* Days Grid: 7 Rows (Sun to Sat) */}
            {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => (
              <div key={dayOfWeek} className="flex items-center gap-1">
                {/* Day of week label (Show for Mon, Wed, Fri) */}
                <span className="w-6 text-[9px] font-medium text-muted-foreground text-right pr-1 select-none">
                  {dayOfWeek === 1 ? "Mon" : dayOfWeek === 3 ? "Wed" : dayOfWeek === 5 ? "Fri" : ""}
                </span>

                {/* Week columns */}
                <div className="flex items-center gap-1">
                  {heatmap.weeks.map((week, wIdx) => {
                    const day = week.days.find((d) => d.dayOfWeek === dayOfWeek)
                    if (!day) {
                      return (
                        <div
                          key={wIdx}
                          className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-[2.5px] bg-transparent"
                        />
                      )
                    }

                    const formattedDate = new Date(day.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })

                    return (
                      <div
                        key={wIdx}
                        title={`${formattedDate}: ${day.minutesStudied}m studied, ${day.tasksCompleted} tasks`}
                        className={`h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-[2.5px] transition-all cursor-pointer hover:scale-125 relative group ${
                          day.isToday ? "ring-1.5 ring-primary" : ""
                        } ${getLevelClasses(day.level)}`}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend & Summary Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground gap-2 pt-2 border-t border-border/70">
          <div className="flex items-center gap-2">
            <span>{heatmap.startDate} &ndash; {heatmap.endDate}</span>
            {longestStreak > 0 && (
              <span className="text-[11px] font-medium">
                &bull; Best Streak: <strong>{longestStreak} days</strong>
              </span>
            )}
          </div>

          {/* Level Scale */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span>Less</span>
            <div className="h-2.5 w-2.5 rounded-xs bg-muted/40" />
            <div className="h-2.5 w-2.5 rounded-xs bg-emerald-500/35" />
            <div className="h-2.5 w-2.5 rounded-xs bg-emerald-500/80" />
            <div className="h-2.5 w-2.5 rounded-xs bg-emerald-600" />
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LearningHeatmap
