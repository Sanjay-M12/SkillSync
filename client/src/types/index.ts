/**
 * Core Domain Models and Enums for SkillSync
 * Aligned with Phase 1 & 2 Business Logic and Rules
 */

export type GoalStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED"
export type EntityProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
export type TaskStatus = "TODO" | "COMPLETED"
export type ConfidenceLevel = "NOT_RATED" | "STRONG" | "NEEDS_REVISION" | "WEAK"
export type UserLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  targetWeeklyHours: number
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  topicId: string
  title: string
  description?: string
  estimatedMinutes?: number
  status: TaskStatus
  orderIndex: number
  completedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface Topic {
  id: string
  skillId: string
  title: string
  description?: string
  status: EntityProgressStatus
  confidence: ConfidenceLevel
  progressPercent: number
  orderIndex: number
  tasks?: Task[]
  createdAt: string
  updatedAt: string
}

export interface Skill {
  id: string
  goalId: string
  title: string
  description?: string
  status: EntityProgressStatus
  progressPercent: number
  orderIndex: number
  topics?: Topic[]
  createdAt: string
  updatedAt: string
}

export interface LearningGoal {
  id: string
  userId: string
  title: string
  description?: string
  status: GoalStatus
  level: UserLevel
  targetWeeklyHours: number
  progressPercent: number
  skills?: Skill[]
  createdAt: string
  updatedAt: string
}

export interface StudySession {
  id: string
  userId: string
  goalId: string
  topicId?: string
  durationMinutes: number
  sessionDate: string
  notes?: string
  createdAt: string
}

export interface RevisionItem {
  id: string
  userId: string
  topicId: string
  priority: "HIGH" | "MEDIUM" | "NORMAL"
  topic?: Topic
  createdAt: string
}
