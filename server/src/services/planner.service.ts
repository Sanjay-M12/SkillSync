import { prisma } from "../config/prisma"
import { DailyLearningPlan, RecommendedTaskItem, RecommendedRevisionItem } from "../types/planner.types"
import { streakService } from "./streak.service"

const MOTIVATIONAL_QUOTES = [
  "Small daily improvements over time lead to stunning results.",
  "Consistency is the DNA of mastery.",
  "Focus on progress, not perfection. One task at a time.",
  "The expert in anything was once a beginner.",
  "Action is the foundational key to all success.",
  "Discipline is choosing between what you want now and what you want most.",
  "Mastery is not an accident—it is a daily practice.",
]

export class PlannerService {
  /**
   * Generates a smart, rule-based daily study plan for the user.
   */
  async getDailyPlan(userId: string, targetDailyMinutes = 60): Promise<DailyLearningPlan> {
    const todayStr = streakService.getTodayDateString()

    // 1. Fetch user goals with hierarchy
    const goals = await prisma.learningGoal.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
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

    // 2. Fetch today's activity log for completed tasks
    const todayActivity = await prisma.dailyActivity.findUnique({
      where: { userId_date: { userId, date: todayStr } },
    })

    const completedMinutesToday = todayActivity?.minutesStudied || 0

    // 3. Rule-based task selection:
    // Gather all incomplete tasks and identify current in-progress topic/skill
    const recommendedTasks: RecommendedTaskItem[] = []
    let primaryFocus: DailyLearningPlan["primaryFocus"] = null
    let recommendedRevision: RecommendedRevisionItem | null = null

    let accumulatedMinutes = 0

    for (const goal of goals) {
      for (const skill of goal.skills) {
        for (const topic of skill.topics) {
          // Check for revision recommendation (first weak topic encountered)
          if (
            !recommendedRevision &&
            (topic.confidence === "WEAK" || topic.confidence === "NEEDS_REVISION")
          ) {
            recommendedRevision = {
              topicId: topic.id,
              topicName: topic.name,
              skillName: skill.name,
              confidence: topic.confidence,
              reason:
                topic.confidence === "WEAK"
                  ? "Rated Weak: Strengthen your core understanding today"
                  : "Marked for revision: Refresh key concepts to solidify memory",
            }
          }

          const pendingTasks = topic.tasks.filter((t) => !t.completed)
          const completedTasksCount = topic.tasks.filter((t) => t.completed).length

          // Establish primary focus from the first topic with pending tasks
          if (!primaryFocus && pendingTasks.length > 0) {
            const topicTotal = topic.tasks.length
            const progress = topicTotal > 0 ? Math.round((completedTasksCount / topicTotal) * 100) : 0
            primaryFocus = {
              skillName: skill.name,
              topicName: topic.name,
              goalTitle: goal.title,
              completionProgress: progress,
            }
          }

          // Pick tasks up to targetDailyMinutes (or at least 2 tasks)
          for (const task of pendingTasks) {
            if (recommendedTasks.length < 3 && accumulatedMinutes < targetDailyMinutes) {
              const minutes = task.estimatedMinutes || 25
              recommendedTasks.push({
                id: task.id,
                title: task.title,
                estimatedMinutes: minutes,
                completed: task.completed,
                topicId: topic.id,
                topicName: topic.name,
                skillId: skill.id,
                skillName: skill.name,
                goalId: goal.id,
                goalTitle: goal.title,
              })
              accumulatedMinutes += minutes
            }
          }
        }
      }
    }

    // 4. Checklist Progress
    const totalRecommended = recommendedTasks.length
    const completedRecommended = recommendedTasks.filter((t) => t.completed).length
    const checklistPercentage =
      totalRecommended > 0 ? Math.round((completedRecommended / totalRecommended) * 100) : 100

    // 5. Dynamic Greetings
    const hour = new Date().getHours()
    const greeting =
      hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

    // 6. Select quote based on day of month
    const dayOfMonth = new Date().getDate()
    const motivationalQuote = MOTIVATIONAL_QUOTES[dayOfMonth % MOTIVATIONAL_QUOTES.length]

    return {
      date: todayStr,
      greeting,
      dailyTargetMinutes: targetDailyMinutes,
      estimatedTotalMinutes: accumulatedMinutes,
      completedMinutesToday,
      primaryFocus,
      recommendedTasks,
      recommendedRevision,
      dailyChecklistProgress: {
        totalTasks: totalRecommended,
        completedTasks: completedRecommended,
        percentage: checklistPercentage,
      },
      motivationalQuote,
    }
  }
}

export const plannerService = new PlannerService()
