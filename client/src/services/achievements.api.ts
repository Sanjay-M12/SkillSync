import { api, ApiResponse } from "@/lib/api"

export interface AchievementItem {
  key: string
  title: string
  description: string
  category: "STREAK" | "TASKS" | "GOALS" | "MASTERY" | "FOCUS"
  icon: string
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
  points: number
  targetValue: number
  isUnlocked: boolean
  unlockedAt: string | null
  currentValue: number
  progressPercentage: number
}

export interface UserAchievementsSummary {
  totalPoints: number
  unlockedCount: number
  totalCount: number
  unlockedPercentage: number
  achievements: AchievementItem[]
  recentlyUnlocked: AchievementItem[]
}

export const achievementsApi = {
  getAchievements: async (): Promise<UserAchievementsSummary> => {
    const res = await api.get<ApiResponse<UserAchievementsSummary>>("/achievements")
    return res.data!
  },
}
