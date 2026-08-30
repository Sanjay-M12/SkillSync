import { prisma } from "../config/prisma"
import { AppError } from "../utils/appError"
import {
  CreateSkillInput,
  UpdateSkillInput,
  CreateTopicInput,
  UpdateTopicInput,
  CreateTaskInput,
  UpdateTaskInput,
} from "../schemas/learning.schema"
import { Skill, Topic, Task, GoalLearningHierarchy } from "../types/learning.types"
import { streakService } from "./streak.service"


export class LearningService {
  // --------------------------------------------------
  // OWNERSHIP HELPERS
  // --------------------------------------------------

  async getOwnedGoal(userId: string, goalId: string) {
    const goal = await prisma.learningGoal.findFirst({
      where: { id: goalId, userId },
    })
    if (!goal) {
      throw new AppError("Learning goal not found.", 404)
    }
    return goal
  }

  async getOwnedSkill(userId: string, skillId: string) {
    const skill = await prisma.skill.findFirst({
      where: {
        id: skillId,
        learningGoal: { userId },
      },
    })
    if (!skill) {
      throw new AppError("Skill not found.", 404)
    }
    return skill
  }

  async getOwnedTopic(userId: string, topicId: string) {
    const topic = await prisma.topic.findFirst({
      where: {
        id: topicId,
        skill: {
          learningGoal: { userId },
        },
      },
    })
    if (!topic) {
      throw new AppError("Topic not found.", 404)
    }
    return topic
  }

  async getOwnedTask(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        topic: {
          skill: {
            learningGoal: { userId },
          },
        },
      },
    })
    if (!task) {
      throw new AppError("Task not found.", 404)
    }
    return task
  }

  // --------------------------------------------------
  // SKILL OPERATIONS
  // --------------------------------------------------

  async createSkill(
    userId: string,
    goalId: string,
    input: CreateSkillInput
  ): Promise<Skill> {
    await this.getOwnedGoal(userId, goalId)

    const skill = await prisma.skill.create({
      data: {
        name: input.name.trim(),
        description: input.description ?? null,
        learningGoalId: goalId,
      },
    })

    return skill
  }

  async getSkillsByGoal(userId: string, goalId: string): Promise<Skill[]> {
    await this.getOwnedGoal(userId, goalId)

    const skills = await prisma.skill.findMany({
      where: { learningGoalId: goalId },
      orderBy: { createdAt: "asc" },
    })

    return skills
  }

  async updateSkill(
    userId: string,
    skillId: string,
    input: UpdateSkillInput
  ): Promise<Skill> {
    await this.getOwnedSkill(userId, skillId)

    const updated = await prisma.skill.update({
      where: { id: skillId },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.description !== undefined && { description: input.description }),
      },
    })

    return updated
  }

  async deleteSkill(userId: string, skillId: string): Promise<void> {
    await this.getOwnedSkill(userId, skillId)

    await prisma.skill.delete({
      where: { id: skillId },
    })
  }

  // --------------------------------------------------
  // TOPIC OPERATIONS
  // --------------------------------------------------

  async createTopic(
    userId: string,
    skillId: string,
    input: CreateTopicInput
  ): Promise<Topic> {
    await this.getOwnedSkill(userId, skillId)

    const topic = await prisma.topic.create({
      data: {
        name: input.name.trim(),
        description: input.description ?? null,
        confidence: input.confidence ?? "NOT_RATED",
        skillId,
      },
    })

    return topic
  }

  async getTopicsBySkill(userId: string, skillId: string): Promise<Topic[]> {
    await this.getOwnedSkill(userId, skillId)

    const topics = await prisma.topic.findMany({
      where: { skillId },
      orderBy: { createdAt: "asc" },
    })

    return topics
  }

  async updateTopic(
    userId: string,
    topicId: string,
    input: UpdateTopicInput
  ): Promise<Topic> {
    await this.getOwnedTopic(userId, topicId)

    const updated = await prisma.topic.update({
      where: { id: topicId },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.confidence !== undefined && { confidence: input.confidence }),
      },
    })

    return updated
  }

  async deleteTopic(userId: string, topicId: string): Promise<void> {
    await this.getOwnedTopic(userId, topicId)

    await prisma.topic.delete({
      where: { id: topicId },
    })
  }

  // --------------------------------------------------
  // TASK OPERATIONS
  // --------------------------------------------------

  async createTask(
    userId: string,
    topicId: string,
    input: CreateTaskInput
  ): Promise<Task> {
    await this.getOwnedTopic(userId, topicId)

    const task = await prisma.task.create({
      data: {
        title: input.title.trim(),
        estimatedMinutes: input.estimatedMinutes ?? null,
        completed: false,
        topicId,
      },
    })

    return task
  }

  async getTasksByTopic(userId: string, topicId: string): Promise<Task[]> {
    await this.getOwnedTopic(userId, topicId)

    const tasks = await prisma.task.findMany({
      where: { topicId },
      orderBy: { createdAt: "asc" },
    })

    return tasks
  }

  async updateTask(
    userId: string,
    taskId: string,
    input: UpdateTaskInput
  ): Promise<Task> {
    await this.getOwnedTask(userId, taskId)

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(input.title !== undefined && { title: input.title.trim() }),
        ...(input.estimatedMinutes !== undefined && {
          estimatedMinutes: input.estimatedMinutes,
        }),
      },
    })

    return updated
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    await this.getOwnedTask(userId, taskId)

    await prisma.task.delete({
      where: { id: taskId },
    })
  }

  async updateTaskCompletion(
    userId: string,
    taskId: string,
    completed: boolean
  ): Promise<Task> {
    const existingTask = await this.getOwnedTask(userId, taskId)

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { completed },
    })

    // Record activity delta if status changed
    if (existingTask.completed !== completed) {
      const tasksDelta = completed ? 1 : -1
      const estimatedMinutes = existingTask.estimatedMinutes || 30
      const minutesDelta = completed ? estimatedMinutes : -estimatedMinutes
      await streakService.recordActivity(userId, tasksDelta, minutesDelta)
    }

    return updated
  }


  // --------------------------------------------------
  // FULL LEARNING HIERARCHY
  // --------------------------------------------------

  async getGoalHierarchy(
    userId: string,
    goalId: string
  ): Promise<GoalLearningHierarchy> {
    await this.getOwnedGoal(userId, goalId)

    const goal = await prisma.learningGoal.findFirst({
      where: { id: goalId, userId },
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

    if (!goal) {
      throw new AppError("Learning goal not found.", 404)
    }

    return goal as unknown as GoalLearningHierarchy
  }
}

export const learningService = new LearningService()
