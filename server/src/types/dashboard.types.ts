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
  currentLevel: string
  weeklyHours: string
  createdAt: Date
  updatedAt: Date
  progress: number
  totalTasks: number
  completedTasks: number
}

export interface RecentTaskItem {
  id: string
  title: string
  completed: boolean
  estimatedMinutes: number | null
  createdAt: Date
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
  currentLevel: string
  weeklyHours: string
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  progress: number
}

import { StreakResponseData } from "./streak.types"

export interface DashboardResponseData {
  summary: DashboardSummary
  recentGoals: RecentGoalItem[]
  recentTasks: RecentTaskItem[]
  goalProgress: GoalProgressItem[]
  streak?: StreakResponseData
}

