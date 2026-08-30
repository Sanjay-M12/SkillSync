import { GoalProgressItem } from "./dashboard.types"

export interface AnalyticsOverview {
  totalGoals: number
  totalSkills: number
  totalTopics: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overallProgress: number
}

export interface SkillProgressItem {
  id: string
  name: string
  learningGoalId: string
  learningGoalTitle: string
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  progress: number
}

export interface TopicConfidenceCount {
  NOT_RATED: number
  STRONG: number
  NEEDS_REVISION: number
  WEAK: number
}

export interface TaskCompletionStats {
  total: number
  completed: number
  pending: number
  completionRate: number
}

export interface WorkloadSummary {
  totalEstimatedMinutes: number
  completedEstimatedMinutes: number
  pendingEstimatedMinutes: number
  totalEstimatedHours: number
  completedEstimatedHours: number
  pendingEstimatedHours: number
}

import { StreakResponseData } from "./streak.types"

export interface AnalyticsResponseData {
  overview: AnalyticsOverview
  goalProgress: GoalProgressItem[]
  skillProgress: SkillProgressItem[]
  topicConfidence: TopicConfidenceCount
  taskCompletion: TaskCompletionStats
  workload: WorkloadSummary
  streak?: StreakResponseData
}


export interface SingleGoalProgressResponse {
  id: string
  title: string
  currentLevel: string
  weeklyHours: string
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  progress: number
}
