import { prisma } from "../config/prisma"
import { ACHIEVEMENTS_CATALOG } from "../constants/achievement.constants"
import { UserAchievementItem, UserAchievementsSummary } from "../types/achievement.types"
import { streakService } from "./streak.service"

export class AchievementService {
  /**
   * Evaluate user progress and automatically unlock any newly qualified achievements.
   */
  async evaluateAndGetAchievements(userId: string): Promise<UserAchievementsSummary> {
    // 1. Gather all underlying metrics in parallel
    const [
      existingUnlocked,
      completedTasksCount,
      strongTopicsCount,
      focusSessions,
      streakData,
      goals,
    ] = await Promise.all([
      prisma.userAchievement.findMany({ where: { userId } }),
      prisma.task.count({
        where: {
          completed: true,
          topic: { skill: { learningGoal: { userId } } },
        },
      }),
      prisma.topic.count({
        where: {
          confidence: "STRONG",
          skill: { learningGoal: { userId } },
        },
      }),
      prisma.focusSession.findMany({ where: { userId } }),
      streakService.getStreakData(userId),
      prisma.learningGoal.findMany({
        where: { userId },
        include: {
          skills: {
            include: {
              topics: {
                include: {
                  tasks: true,
                },
              },
            },
          },
        },
      }),
    ])

    const unlockedMap = new Map<string, string>()
    for (const ua of existingUnlocked) {
      unlockedMap.set(ua.achievementKey, ua.unlockedAt.toISOString())
    }

    // Calculate completed goals (at least 1 task, all tasks completed)
    let completedGoalsCount = 0
    for (const goal of goals) {
      const allTasks = goal.skills.flatMap((s) => s.topics.flatMap((t) => t.tasks))
      if (allTasks.length > 0 && allTasks.every((t) => t.completed)) {
        completedGoalsCount += 1
      }
    }

    const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0)
    const totalFocusSessionsCount = focusSessions.length
    const maxStreak = Math.max(streakData.currentStreak, streakData.longestStreak)

    // 2. Evaluate each achievement in the catalog
    const achievementsToUnlock: string[] = []
    const achievementItems: UserAchievementItem[] = []

    for (const ach of ACHIEVEMENTS_CATALOG) {
      let currentValue = 0

      switch (ach.key) {
        case "FIRST_STEP":
        case "TASK_CRUSHER_10":
        case "TASK_CRUSHER_50":
        case "TASK_CRUSHER_100":
          currentValue = completedTasksCount
          break

        case "STREAK_3_DAY":
        case "STREAK_7_DAY":
        case "STREAK_30_DAY":
          currentValue = maxStreak
          break

        case "CONFIDENCE_STRONG_5":
          currentValue = strongTopicsCount
          break

        case "GOAL_COMPLETED":
          currentValue = completedGoalsCount
          break

        case "POMODORO_FIRST":
          currentValue = totalFocusSessionsCount
          break

        case "FOCUS_MASTER_5H":
          currentValue = totalFocusMinutes
          break

        default:
          currentValue = 0
      }

      const isQualified = currentValue >= ach.targetValue
      const alreadyUnlocked = unlockedMap.has(ach.key)

      if (isQualified && !alreadyUnlocked) {
        achievementsToUnlock.push(ach.key)
      }

      const isUnlocked = alreadyUnlocked || isQualified
      const unlockedAt = unlockedMap.get(ach.key) || (isQualified ? new Date().toISOString() : null)
      const progressPercentage = Math.min(100, Math.round((currentValue / ach.targetValue) * 100))

      achievementItems.push({
        ...ach,
        isUnlocked,
        unlockedAt,
        currentValue,
        progressPercentage,
      })
    }

    // 3. Batch insert any newly unlocked achievements
    if (achievementsToUnlock.length > 0) {
      await prisma.userAchievement.createMany({
        data: achievementsToUnlock.map((achievementKey) => ({
          userId,
          achievementKey,
        })),
        skipDuplicates: true,
      })
    }

    // 4. Summarize
    const totalPoints = achievementItems
      .filter((a) => a.isUnlocked)
      .reduce((acc, a) => acc + a.points, 0)
    const unlockedCount = achievementItems.filter((a) => a.isUnlocked).length
    const totalCount = achievementItems.length
    const unlockedPercentage = Math.round((unlockedCount / totalCount) * 100)

    const recentlyUnlocked = achievementItems
      .filter((a) => a.isUnlocked && a.unlockedAt)
      .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
      .slice(0, 3)

    return {
      totalPoints,
      unlockedCount,
      totalCount,
      unlockedPercentage,
      achievements: achievementItems,
      recentlyUnlocked,
    }
  }
}

export const achievementService = new AchievementService()
