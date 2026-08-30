import { prisma } from "../config/prisma"
import { AppError } from "../utils/appError"
import { CreateGoalInput, UpdateGoalInput } from "../schemas/goal.schema"
import { LearningGoal } from "../types/goal.types"

export class GoalService {
  /**
   * Creates a new learning goal belonging to the authenticated user.
   */
  async createGoal(userId: string, input: CreateGoalInput): Promise<LearningGoal> {
    const goal = await prisma.learningGoal.create({
      data: {
        title: input.title.trim(),
        description: input.description ?? null,
        currentLevel: input.currentLevel,
        weeklyHours: input.weeklyHours,
        userId,
      },
    })

    return goal
  }

  /**
   * Retrieves all learning goals owned by the authenticated user, ordered by newest first.
   */
  async getGoalsByUser(userId: string): Promise<LearningGoal[]> {
    const goals = await prisma.learningGoal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return goals
  }

  /**
   * Retrieves a single learning goal by ID, strictly verifying user ownership.
   */
  async getGoalById(userId: string, goalId: string): Promise<LearningGoal> {
    const goal = await prisma.learningGoal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    })

    if (!goal) {
      throw new AppError("Learning goal not found.", 404)
    }

    return goal
  }

  /**
   * Updates an owned learning goal partially.
   */
  async updateGoal(
    userId: string,
    goalId: string,
    input: UpdateGoalInput
  ): Promise<LearningGoal> {
    // 1. Verify existence & ownership
    const existing = await prisma.learningGoal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    })

    if (!existing) {
      throw new AppError("Learning goal not found.", 404)
    }

    // 2. Perform update
    const updated = await prisma.learningGoal.update({
      where: { id: goalId },
      data: {
        ...(input.title !== undefined && { title: input.title.trim() }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.currentLevel !== undefined && { currentLevel: input.currentLevel }),
        ...(input.weeklyHours !== undefined && { weeklyHours: input.weeklyHours }),
      },
    })

    return updated
  }

  /**
   * Deletes an owned learning goal, cascading to nested skills, topics, and tasks.
   */
  async deleteGoal(userId: string, goalId: string): Promise<void> {
    // 1. Verify existence & ownership
    const existing = await prisma.learningGoal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    })

    if (!existing) {
      throw new AppError("Learning goal not found.", 404)
    }

    // 2. Delete goal with database cascade
    await prisma.learningGoal.delete({
      where: { id: goalId },
    })
  }
}

export const goalService = new GoalService()
