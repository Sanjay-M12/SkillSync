import * as React from "react"
import { Clock, Calendar } from "lucide-react"
import type { WeeklyStudyData } from "../analytics.types"

export interface WeeklyStudyActivityProps {
  activity: WeeklyStudyData
}

export const WeeklyStudyActivity: React.FC<WeeklyStudyActivityProps> = ({ activity }) => {
  const maxMinutes = Math.max(...activity.days.map((d) => d.minutes), 60)

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">Weekly Study Activity</h3>
          </div>
          <p className="text-xs text-muted-foreground">Daily learning time across the past 7 days</p>
        </div>

        <div className="flex items-center gap-1.5 rounded-md bg-muted/60 px-3 py-1.5 text-xs font-semibold text-foreground">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span>{activity.totalWeeklyFormatted} studied this week</span>
        </div>
      </div>

      {/* 7-Day Visual Activity Bars */}
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-32 pt-6 pb-2 border-b border-border/80">
          {activity.days.map((day) => {
            const heightPercent = Math.max(10, Math.round((day.minutes / maxMinutes) * 100))
            const hasActivity = day.minutes > 0

            return (
              <div key={day.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                {/* Time tooltip / label */}
                <span className="text-[11px] font-semibold text-foreground">
                  {day.formattedTime}
                </span>

                {/* Vertical Bar Container */}
                <div className="w-full max-w-[32px] h-full flex items-end bg-muted/30 rounded-t-md overflow-hidden">
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ease-out ${
                      hasActivity
                        ? day.isToday
                          ? "bg-primary shadow-xs"
                          : "bg-primary/80 group-hover:bg-primary"
                        : "bg-transparent"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                    aria-label={`${day.day}: ${day.formattedTime}`}
                  />
                </div>

                {/* Day of Week */}
                <span
                  className={`text-xs ${
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
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
          <span>Monday &ndash; Sunday</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" /> Today
          </span>
        </div>
      </div>
    </div>
  )
}

export default WeeklyStudyActivity
