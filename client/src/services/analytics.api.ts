import { api, ApiResponse } from "@/lib/api"
import { GoalProgressItem } from "./dashboard.api"

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

import { StreakData } from "./streak.api"

export interface AnalyticsData {
  overview: AnalyticsOverview
  goalProgress: GoalProgressItem[]
  skillProgress: SkillProgressItem[]
  topicConfidence: TopicConfidenceCount
  taskCompletion: TaskCompletionStats
  workload: WorkloadSummary
  streak?: StreakData
}


export const analyticsApi = {
  getAnalytics: async (): Promise<AnalyticsData> => {
    const res = await api.get<ApiResponse<AnalyticsData>>("/analytics")
    return res.data!
  },
}
