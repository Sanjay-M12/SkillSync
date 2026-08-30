import type { WorkspaceGoal } from "@/features/learning"
import type { AnalyticsData, WeeklyStudyData } from "./analytics.types"
import {
  deriveGoalOverview,
  deriveSkillProgressList,
  deriveConfidenceSummary,
} from "./analytics.selectors"

export const mockWeeklyStudyData: WeeklyStudyData = {
  days: [
    { day: "Monday", shortDay: "Mon", minutes: 45, formattedTime: "45m", isToday: false },
    { day: "Tuesday", shortDay: "Tue", minutes: 60, formattedTime: "1h 00m", isToday: false },
    { day: "Wednesday", shortDay: "Wed", minutes: 30, formattedTime: "30m", isToday: false },
    { day: "Thursday", shortDay: "Thu", minutes: 0, formattedTime: "0m", isToday: false },
    { day: "Friday", shortDay: "Fri", minutes: 75, formattedTime: "1h 15m", isToday: false },
    { day: "Saturday", shortDay: "Sat", minutes: 45, formattedTime: "45m", isToday: false },
    { day: "Sunday", shortDay: "Sun", minutes: 15, formattedTime: "15m", isToday: true },
  ],
  totalWeeklyFormatted: "4h 30m",
  totalMinutes: 270,
}

export const mockStreakDays = 4

/**
 * Builds the complete AnalyticsData view model by combining derived
 * learning metrics with mock study time & streak logs.
 */
export function buildAnalyticsData(goal: WorkspaceGoal): AnalyticsData {
  const overview = deriveGoalOverview(goal)
  const skillProgressList = deriveSkillProgressList(goal)
  const confidenceSummary = deriveConfidenceSummary(goal)

  return {
    overview,
    keyMetrics: {
      studyTimeFormatted: mockWeeklyStudyData.totalWeeklyFormatted,
      streakDays: mockStreakDays,
      revisionTopicsCount: confidenceSummary.needsAttentionCount,
    },
    weeklyActivity: mockWeeklyStudyData,
    skillProgressList,
    confidenceSummary,
  }
}
