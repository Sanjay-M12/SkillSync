import { api, ApiResponse } from "@/lib/api"
import { ApiLearningLevel, ApiWeeklyHours } from "./goals.api"

export interface DashboardSummary {
  overallProgress: number
  totalGoals: number
  totalSkills: number
  totalTopics: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
}

export interface RecentGoalItem {
  id: string
  title: string
  currentLevel: ApiLearningLevel
  weeklyHours: ApiWeeklyHours
  createdAt: string
  updatedAt: string
  progress: number
  totalTasks: number
  completedTasks: number
}

export interface RecentTaskItem {
  id: string
  title: string
  completed: boolean
  estimatedMinutes: number | null
  createdAt: string
  topic: {
    id: string
    name: string
  }
  skill: {
    id: string
    name: string
  }
  learningGoal: {
    id: string
    title: string
  }
}

export interface GoalProgressItem {
  id: string
  title: string
  currentLevel: ApiLearningLevel
  weeklyHours: ApiWeeklyHours
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  progress: number
}

import { StreakData } from "./streak.api"

export interface DashboardData {
  summary: DashboardSummary
  recentGoals: RecentGoalItem[]
  recentTasks: RecentTaskItem[]
  goalProgress: GoalProgressItem[]
  streak?: StreakData
}


export const dashboardApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const res = await api.get<ApiResponse<DashboardData>>("/dashboard")
    return res.data!
  },
}
