import { AchievementDefinition } from "../constants/achievement.constants"

export interface UserAchievementItem extends AchievementDefinition {
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
  achievements: UserAchievementItem[]
  recentlyUnlocked: UserAchievementItem[]
}
