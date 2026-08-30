import { api, ApiResponse } from "@/lib/api"

export interface DayActivityItem {
  date: string
  day: string
  shortDay: string
  tasksCompleted: number
  minutesStudied: number
  isActive: boolean
  isToday: boolean
}

export interface WeeklyActivitySummary {
  days: DayActivityItem[]
  activeDays: number
  totalDays: number
  totalHoursThisWeek: number
  targetWeeklyHours: number
  targetPercent: number
}

export interface MonthlyConsistencySummary {
  activeDays: number
  totalDays: number
  consistencyPercentage: number
  monthName: string
  year: number
  days: DayActivityItem[]
}

export interface TodayLearningStatus {
  isCompletedToday: boolean
  tasksCompletedToday: number
  minutesStudiedToday: number
  message: string
  callToAction: string
}

export interface HeatmapDay {
  date: string
  dayOfWeek: number
  tasksCompleted: number
  minutesStudied: number
  level: 0 | 1 | 2 | 3
  isToday: boolean
}

export interface HeatmapWeek {
  weekIndex: number
  monthLabel?: string
  days: HeatmapDay[]
}

export interface ActivityHeatmap {
  totalActiveDays: number
  totalHours: number
  totalTasks: number
  weeks: HeatmapWeek[]
  startDate: string
  endDate: string
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  todayStatus: TodayLearningStatus
  weekly: WeeklyActivitySummary
  monthly: MonthlyConsistencySummary
  heatmap?: ActivityHeatmap
}


export const streakApi = {
  getStreak: async (targetWeeklyHours?: number): Promise<StreakData> => {
    const res = await api.get<ApiResponse<StreakData>>(
      `/streak${targetWeeklyHours ? `?targetWeeklyHours=${targetWeeklyHours}` : ""}`
    )
    return res.data!
  },

  recordActivity: async (data: {
    tasksDelta?: number
    minutesDelta?: number
    date?: string
  }): Promise<void> => {
    await api.post<ApiResponse<unknown>>("/streak/activity", data)
  },
}
