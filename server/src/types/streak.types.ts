export interface DayActivityItem {
  date: string // YYYY-MM-DD
  day: string // "Monday", "Tuesday", etc.
  shortDay: string // "Mon", "Tue", etc.
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
  date: string // YYYY-MM-DD
  dayOfWeek: number // 0 (Sun) to 6 (Sat)
  tasksCompleted: number
  minutesStudied: number
  level: 0 | 1 | 2 | 3 // 0: none, 1: light, 2: medium, 3: heavy
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

export interface StreakResponseData {
  currentStreak: number
  longestStreak: number
  todayStatus: TodayLearningStatus
  weekly: WeeklyActivitySummary
  monthly: MonthlyConsistencySummary
  heatmap?: ActivityHeatmap
}

