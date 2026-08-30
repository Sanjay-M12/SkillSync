import type { ConfidenceLevel, EntityProgressStatus } from "@/types"

export interface WorkspaceTask {
  id: string
  topicId: string
  title: string
  completed: boolean
  estimatedMinutes?: number
}

export interface WorkspaceTopic {
  id: string
  skillId: string
  name: string
  description?: string
  confidence: ConfidenceLevel
  tasks: WorkspaceTask[]
  progress?: number
  status?: EntityProgressStatus
}

export interface WorkspaceSkill {
  id: string
  goalId: string
  name: string
  description?: string
  isExpanded?: boolean
  topics: WorkspaceTopic[]
  progress?: number
  status?: EntityProgressStatus
}

export interface WorkspaceGoal {
  id: string
  title: string
  description?: string
  level: string
  weeklyHours: number
  skills: WorkspaceSkill[]
  progress?: number
}

export type DeleteItemType = "SKILL" | "TOPIC" | "TASK"

export interface DeleteItemTarget {
  type: DeleteItemType
  id: string
  name: string
  skillId?: string
  topicId?: string
}
