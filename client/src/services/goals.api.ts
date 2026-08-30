import { api, ApiResponse } from "@/lib/api"

export type ApiLearningLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
export type ApiWeeklyHours = "HOURS_1_TO_3" | "HOURS_4_TO_6" | "HOURS_7_TO_10" | "HOURS_10_PLUS"
export type ApiTopicConfidence = "NOT_RATED" | "STRONG" | "NEEDS_REVISION" | "WEAK"

export interface ApiTask {
  id: string
  title: string
  completed: boolean
  estimatedMinutes: number | null
  topicId: string
  createdAt: string
  updatedAt: string
}

export interface ApiTopic {
  id: string
  name: string
  description: string | null
  confidence: ApiTopicConfidence
  skillId: string
  tasks: ApiTask[]
  createdAt: string
  updatedAt: string
}

export interface ApiSkill {
  id: string
  name: string
  description: string | null
  learningGoalId: string
  topics: ApiTopic[]
  createdAt: string
  updatedAt: string
}

export interface ApiLearningGoal {
  id: string
  title: string
  description: string | null
  currentLevel: ApiLearningLevel
  weeklyHours: ApiWeeklyHours
  userId: string
  createdAt: string
  updatedAt: string
}

export interface ApiGoalHierarchy extends ApiLearningGoal {
  skills: ApiSkill[]
}

export interface CreateGoalPayload {
  title: string
  description?: string | null
  currentLevel: ApiLearningLevel
  weeklyHours: ApiWeeklyHours
}

export interface UpdateGoalPayload {
  title?: string
  description?: string | null
  currentLevel?: ApiLearningLevel
  weeklyHours?: ApiWeeklyHours
}

export interface GoalProgressData {
  id: string
  title: string
  currentLevel: ApiLearningLevel
  weeklyHours: ApiWeeklyHours
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  progress: number
}

export const goalsApi = {
  createGoal: async (payload: CreateGoalPayload): Promise<ApiLearningGoal> => {
    const res = await api.post<ApiResponse<{ goal: ApiLearningGoal }>>("/goals", payload)
    return res.data!.goal
  },

  getGoals: async (): Promise<ApiLearningGoal[]> => {
    const res = await api.get<ApiResponse<{ goals: ApiLearningGoal[] }>>("/goals")
    return res.data!.goals
  },

  getGoalById: async (id: string): Promise<ApiLearningGoal> => {
    const res = await api.get<ApiResponse<{ goal: ApiLearningGoal }>>(`/goals/${id}`)
    return res.data!.goal
  },

  getGoalHierarchy: async (goalId: string): Promise<ApiGoalHierarchy> => {
    const res = await api.get<ApiResponse<{ goal: ApiGoalHierarchy }>>(`/goals/${goalId}/learning`)
    return res.data!.goal
  },

  updateGoal: async (id: string, payload: UpdateGoalPayload): Promise<ApiLearningGoal> => {
    const res = await api.patch<ApiResponse<{ goal: ApiLearningGoal }>>(`/goals/${id}`, payload)
    return res.data!.goal
  },

  deleteGoal: async (id: string): Promise<void> => {
    await api.delete<ApiResponse>(`/goals/${id}`)
  },

  getGoalProgress: async (id: string): Promise<GoalProgressData> => {
    const res = await api.get<ApiResponse<GoalProgressData>>(`/goals/${id}/progress`)
    return res.data!
  },
}
