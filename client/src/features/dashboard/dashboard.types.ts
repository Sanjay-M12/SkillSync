import type { ConfidenceLevel, UserLevel } from "@/types"

export interface DashboardUser {
  name: string
  email: string
}

export interface DashboardGoal {
  id: string
  title: string
  level: UserLevel | string
  progressPercent: number
  targetWeeklyHours: number
  totalSkills: number
  completedSkills: number
  totalTopics: number
  completedTopics: number
}

export interface TodaysFocusItem {
  goalId: string
  topicId: string
  skillTitle: string
  topicTitle: string
  taskTitle: string
  estimatedMinutes: number
}

export interface RevisionTopicItem {
  id: string
  topicTitle: string
  skillTitle: string
  confidence: ConfidenceLevel
}

export interface DayActivity {
  day: string
  shortDay: string
  date: string
  minutesStudied: number
  tasksCompleted?: number
  isActive?: boolean
  isToday: boolean
}

export interface MonthlyActivityData {
  activeDays: number
  totalDays: number
  consistencyPercentage: number
  monthName: string
  year: number
  days: DayActivity[]
}

export interface WeeklyActivityData {
  days: DayActivity[]
  activeDays?: number
  totalDays?: number
  totalHoursThisWeek: number
  targetWeeklyHours: number
  streakDays: number
  longestStreak: number
  isCompletedToday?: boolean
  tasksCompletedToday?: number
  minutesStudiedToday?: number
  statusMessage?: string
  monthly?: MonthlyActivityData
}

export interface DashboardData {
  user: DashboardUser
  activeGoal: DashboardGoal | null
  todaysFocus: TodaysFocusItem | null
  revisionQueue: RevisionTopicItem[]
  weeklyActivity: WeeklyActivityData
}

