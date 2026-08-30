import { prisma } from "../config/prisma"
import { calculateProgress } from "../utils/calculations"
import {
  DashboardResponseData,
  RecentGoalItem,
  RecentTaskItem,
  GoalProgressItem,
} from "../types/dashboard.types"

import { streakService } from "./streak.service"

export class DashboardService {
  /**
   * Retrieves aggregated dashboard metrics, recent items, goal progress, and streak statistics.
   */
  async getDashboardData(userId: string): Promise<DashboardResponseData> {
    // 1. Fetch user goals with nested hierarchy in a single efficient query
    const goals = await prisma.learningGoal.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
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
    })

    // Fetch streak data concurrently
    const streak = await streakService.getStreakData(userId)


    // 2. Fetch 5 most recent tasks for this user
    const rawRecentTasks = await prisma.task.findMany({
      where: {
        topic: {
          skill: {
            learningGoal: { userId },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            skill: {
              select: {
                id: true,
                name: true,
                learningGoal: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // 3. Aggregate totals and calculate progress
    let totalSkills = 0
    let totalTopics = 0
    let totalTasks = 0
    let completedTasks = 0

    const goalProgressList: GoalProgressItem[] = []
    const recentGoalsList: RecentGoalItem[] = []

    for (const goal of goals) {
      totalSkills += goal.skills.length

      let goalTotalTasks = 0
      let goalCompletedTasks = 0

      for (const skill of goal.skills) {
        totalTopics += skill.topics.length

        for (const topic of skill.topics) {
          goalTotalTasks += topic.tasks.length
          for (const task of topic.tasks) {
            if (task.completed) {
              goalCompletedTasks += 1
            }
          }
        }
      }

      totalTasks += goalTotalTasks
      completedTasks += goalCompletedTasks

      const goalProgress = calculateProgress(goalCompletedTasks, goalTotalTasks)
      const goalPendingTasks = goalTotalTasks - goalCompletedTasks

      const progressItem: GoalProgressItem = {
        id: goal.id,
        title: goal.title,
        currentLevel: goal.currentLevel,
        weeklyHours: goal.weeklyHours,
        totalTasks: goalTotalTasks,
        completedTasks: goalCompletedTasks,
        pendingTasks: goalPendingTasks,
        progress: goalProgress,
      }

      goalProgressList.push(progressItem)

      if (recentGoalsList.length < 5) {
        recentGoalsList.push({
          id: goal.id,
          title: goal.title,
          currentLevel: goal.currentLevel,
          weeklyHours: goal.weeklyHours,
          createdAt: goal.createdAt,
          updatedAt: goal.updatedAt,
          progress: goalProgress,
          totalTasks: goalTotalTasks,
          completedTasks: goalCompletedTasks,
        })
      }
    }

    const pendingTasks = totalTasks - completedTasks
    const overallProgress = calculateProgress(completedTasks, totalTasks)

    // 4. Map recent tasks to clean response shape
    const recentTasks: RecentTaskItem[] = rawRecentTasks.map((t) => ({
      id: t.id,
      title: t.title,
      completed: t.completed,
      estimatedMinutes: t.estimatedMinutes,
      createdAt: t.createdAt,
      topic: {
        id: t.topic.id,
        name: t.topic.name,
      },
      skill: {
        id: t.topic.skill.id,
        name: t.topic.skill.name,
      },
      learningGoal: {
        id: t.topic.skill.learningGoal.id,
        title: t.topic.skill.learningGoal.title,
      },
    }))

    return {
      summary: {
        overallProgress,
        totalGoals: goals.length,
        totalSkills,
        totalTopics,
        totalTasks,
        completedTasks,
        pendingTasks,
      },
      recentGoals: recentGoalsList,
      recentTasks,
      goalProgress: goalProgressList,
      streak,
    }
  }
}


export const dashboardService = new DashboardService()
