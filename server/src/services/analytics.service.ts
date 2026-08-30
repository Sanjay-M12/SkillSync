import { prisma } from "../config/prisma"
import { calculateProgress, minutesToHours } from "../utils/calculations"
import { AppError } from "../utils/appError"
import {
  AnalyticsResponseData,
  SkillProgressItem,
  TopicConfidenceCount,
  SingleGoalProgressResponse,
} from "../types/analytics.types"
import { GoalProgressItem } from "../types/dashboard.types"

import { streakService } from "./streak.service"

export class AnalyticsService {
  /**
   * Generates comprehensive learning analytics for the authenticated user.
   */
  async getAnalyticsData(userId: string): Promise<AnalyticsResponseData> {
    // 1. Fetch streak data and goals
    const streak = await streakService.getStreakData(userId)

    const goals = await prisma.learningGoal.findMany({

      where: { userId },
      orderBy: { createdAt: "asc" },
      include: {
        skills: {
          orderBy: { createdAt: "asc" },
          include: {
            topics: {
              orderBy: { createdAt: "asc" },
              include: {
                tasks: {
                  orderBy: { createdAt: "asc" },
                },
              },
            },
          },
        },
      },
    })

    // 2. Initial state counters
    let totalSkills = 0
    let totalTopics = 0
    let totalTasks = 0
    let completedTasks = 0

    let totalEstimatedMinutes = 0
    let completedEstimatedMinutes = 0
    let pendingEstimatedMinutes = 0

    const topicConfidence: TopicConfidenceCount = {
      NOT_RATED: 0,
      STRONG: 0,
      NEEDS_REVISION: 0,
      WEAK: 0,
    }

    const goalProgressList: GoalProgressItem[] = []
    const skillProgressList: SkillProgressItem[] = []

    // 3. Process hierarchy bottom-up
    for (const goal of goals) {
      totalSkills += goal.skills.length

      let goalTotalTasks = 0
      let goalCompletedTasks = 0

      for (const skill of goal.skills) {
        totalTopics += skill.topics.length

        let skillTotalTasks = 0
        let skillCompletedTasks = 0

        for (const topic of skill.topics) {
          // Increment confidence counter
          if (topic.confidence in topicConfidence) {
            topicConfidence[topic.confidence as keyof TopicConfidenceCount] += 1
          }

          skillTotalTasks += topic.tasks.length

          for (const task of topic.tasks) {
            if (task.completed) {
              skillCompletedTasks += 1
            }

            // Workload accumulation (only valid estimated minutes)
            if (task.estimatedMinutes && task.estimatedMinutes > 0) {
              totalEstimatedMinutes += task.estimatedMinutes
              if (task.completed) {
                completedEstimatedMinutes += task.estimatedMinutes
              } else {
                pendingEstimatedMinutes += task.estimatedMinutes
              }
            }
          }
        }

        goalTotalTasks += skillTotalTasks
        goalCompletedTasks += skillCompletedTasks

        const skillProgress = calculateProgress(skillCompletedTasks, skillTotalTasks)
        const skillPendingTasks = skillTotalTasks - skillCompletedTasks

        skillProgressList.push({
          id: skill.id,
          name: skill.name,
          learningGoalId: goal.id,
          learningGoalTitle: goal.title,
          totalTasks: skillTotalTasks,
          completedTasks: skillCompletedTasks,
          pendingTasks: skillPendingTasks,
          progress: skillProgress,
        })
      }

      totalTasks += goalTotalTasks
      completedTasks += goalCompletedTasks

      const goalProgress = calculateProgress(goalCompletedTasks, goalTotalTasks)
      const goalPendingTasks = goalTotalTasks - goalCompletedTasks

      goalProgressList.push({
        id: goal.id,
        title: goal.title,
        currentLevel: goal.currentLevel,
        weeklyHours: goal.weeklyHours,
        totalTasks: goalTotalTasks,
        completedTasks: goalCompletedTasks,
        pendingTasks: goalPendingTasks,
        progress: goalProgress,
      })
    }

    const pendingTasks = totalTasks - completedTasks
    const overallProgress = calculateProgress(completedTasks, totalTasks)

    return {
      overview: {
        totalGoals: goals.length,
        totalSkills,
        totalTopics,
        totalTasks,
        completedTasks,
        pendingTasks,
        overallProgress,
      },
      goalProgress: goalProgressList,
      skillProgress: skillProgressList,
      topicConfidence,
      taskCompletion: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        completionRate: overallProgress,
      },
      workload: {
        totalEstimatedMinutes,
        completedEstimatedMinutes,
        pendingEstimatedMinutes,
        totalEstimatedHours: minutesToHours(totalEstimatedMinutes),
        completedEstimatedHours: minutesToHours(completedEstimatedMinutes),
        pendingEstimatedHours: minutesToHours(pendingEstimatedMinutes),
      },
      streak,
    }
  }


  /**
   * Retrieves derived progress stats for a single owned learning goal.
   */
  async getSingleGoalProgress(
    userId: string,
    goalId: string
  ): Promise<SingleGoalProgressResponse> {
    const goal = await prisma.learningGoal.findFirst({
      where: { id: goalId, userId },
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

    if (!goal) {
      throw new AppError("Learning goal not found.", 404)
    }

    let totalTasks = 0
    let completedTasks = 0

    for (const skill of goal.skills) {
      for (const topic of skill.topics) {
        totalTasks += topic.tasks.length
        for (const task of topic.tasks) {
          if (task.completed) {
            completedTasks += 1
          }
        }
      }
    }

    const pendingTasks = totalTasks - completedTasks
    const progress = calculateProgress(completedTasks, totalTasks)

    return {
      id: goal.id,
      title: goal.title,
      currentLevel: goal.currentLevel,
      weeklyHours: goal.weeklyHours,
      totalTasks,
      completedTasks,
      pendingTasks,
      progress,
    }
  }
}

export const analyticsService = new AnalyticsService()
