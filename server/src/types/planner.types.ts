export interface RecommendedTaskItem {
  id: string
  title: string
  estimatedMinutes: number
  completed: boolean
  topicId: string
  topicName: string
  skillId: string
  skillName: string
  goalId: string
  goalTitle: string
}

export interface RecommendedRevisionItem {
  topicId: string
  topicName: string
  skillName: string
  confidence: "WEAK" | "NEEDS_REVISION"
  reason: string
}

export interface DailyLearningPlan {
  date: string
  greeting: string
  dailyTargetMinutes: number
  estimatedTotalMinutes: number
  completedMinutesToday: number
  primaryFocus: {
    skillName: string
    topicName: string
    goalTitle: string
    completionProgress: number
  } | null
  recommendedTasks: RecommendedTaskItem[]
  recommendedRevision: RecommendedRevisionItem | null
  dailyChecklistProgress: {
    totalTasks: number
    completedTasks: number
    percentage: number
  }
  motivationalQuote: string
}
