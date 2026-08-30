import { prisma } from "../config/prisma"
import { FocusSessionInput, FocusStats } from "../types/focus.types"
import { streakService } from "./streak.service"
import { achievementService } from "./achievement.service"

export class FocusService {
  /**
   * Log a completed Pomodoro/focus session and update user daily activity & achievements.
   */
  async logSession(userId: string, input: FocusSessionInput) {
    const duration = Math.max(1, Math.min(180, input.durationMinutes || 25))

    // 1. Create focus session
    const session = await prisma.focusSession.create({
      data: {
        userId,
        durationMinutes: duration,
        taskId: input.taskId || null,
        topicId: input.topicId || null,
      },
    })

    // 2. Automatically record minutes studied to DailyActivity & Streak
    await streakService.recordActivity(userId, 0, duration)

    // 3. Trigger achievement evaluation
    await achievementService.evaluateAndGetAchievements(userId)

    return session
  }

  /**
   * Get aggregated focus stats for the user.
   */
  async getFocusStats(userId: string): Promise<FocusStats> {
    const todayStr = streakService.getTodayDateString()
    const startOfToday = new Date(todayStr + "T00:00:00.000Z")

    const [allSessions, todaySessions, recentSessions] = await Promise.all([
      prisma.focusSession.findMany({
        where: { userId },
      }),
      prisma.focusSession.findMany({
        where: {
          userId,
          completedAt: { gte: startOfToday },
        },
      }),
      prisma.focusSession.findMany({
        where: { userId },
        orderBy: { completedAt: "desc" },
        take: 5,
      }),
    ])

    const totalMinutes = allSessions.reduce((acc, s) => acc + s.durationMinutes, 0)
    const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0)

    return {
      totalMinutes,
      totalSessions: allSessions.length,
      todayMinutes,
      todaySessions: todaySessions.length,
      recentSessions,
    }
  }
}

export const focusService = new FocusService()
