import type { ConfidenceLevel } from "@/types"

export interface GoalOverviewMetrics {
  goalTitle: string
  level: string
  progressPercent: number
  completedTasks: number
  totalTasks: number
}

export interface KeyMetrics {
  studyTimeFormatted: string
  streakDays: number
  longestStreak?: number
  activeDaysThisWeek?: number
  monthlyConsistency?: number
  revisionTopicsCount: number
}


export interface DailyStudyPoint {
  day: string
  shortDay: string
  minutes: number
  formattedTime: string
  isToday: boolean
}

export interface WeeklyStudyData {
  days: DailyStudyPoint[]
  totalWeeklyFormatted: string
  totalMinutes: number
}

export interface SkillProgressSummary {
  id: string
  name: string
  progressPercent: number
  completedTasks: number
  totalTasks: number
}

export interface ConfidenceTopicItem {
  id: string
  name: string
  skillName: string
  confidence: ConfidenceLevel
}

export interface ConfidenceGroupSummary {
  strong: ConfidenceTopicItem[]
  needsRevision: ConfidenceTopicItem[]
  weak: ConfidenceTopicItem[]
  notRated: ConfidenceTopicItem[]
  needsAttentionCount: number
}

export interface AnalyticsData {
  overview: GoalOverviewMetrics
  keyMetrics: KeyMetrics
  weeklyActivity: WeeklyStudyData
  skillProgressList: SkillProgressSummary[]
  confidenceSummary: ConfidenceGroupSummary
}
