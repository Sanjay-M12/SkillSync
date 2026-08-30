import { api, ApiResponse } from "@/lib/api"
import { ApiSkill, ApiTopic, ApiTask, ApiTopicConfidence } from "./goals.api"

export interface CreateSkillPayload {
  name: string
  description?: string | null
}

export interface UpdateSkillPayload {
  name?: string
  description?: string | null
}

export interface CreateTopicPayload {
  name: string
  description?: string | null
  confidence?: ApiTopicConfidence
}

export interface UpdateTopicPayload {
  name?: string
  description?: string | null
  confidence?: ApiTopicConfidence
}

export interface CreateTaskPayload {
  title: string
  estimatedMinutes?: number | null
}

export interface UpdateTaskPayload {
  title?: string
  estimatedMinutes?: number | null
}

export const learningApi = {
  // Skills
  createSkill: async (goalId: string, payload: CreateSkillPayload): Promise<ApiSkill> => {
    const res = await api.post<ApiResponse<{ skill: ApiSkill }>>(`/goals/${goalId}/skills`, payload)
    return res.data!.skill
  },

  getSkills: async (goalId: string): Promise<ApiSkill[]> => {
    const res = await api.get<ApiResponse<{ skills: ApiSkill[] }>>(`/goals/${goalId}/skills`)
    return res.data!.skills
  },

  updateSkill: async (id: string, payload: UpdateSkillPayload): Promise<ApiSkill> => {
    const res = await api.patch<ApiResponse<{ skill: ApiSkill }>>(`/skills/${id}`, payload)
    return res.data!.skill
  },

  deleteSkill: async (id: string): Promise<void> => {
    await api.delete<ApiResponse>(`/skills/${id}`)
  },

  // Topics
  createTopic: async (skillId: string, payload: CreateTopicPayload): Promise<ApiTopic> => {
    const res = await api.post<ApiResponse<{ topic: ApiTopic }>>(`/skills/${skillId}/topics`, payload)
    return res.data!.topic
  },

  getTopics: async (skillId: string): Promise<ApiTopic[]> => {
    const res = await api.get<ApiResponse<{ topics: ApiTopic[] }>>(`/skills/${skillId}/topics`)
    return res.data!.topics
  },

  updateTopic: async (id: string, payload: UpdateTopicPayload): Promise<ApiTopic> => {
    const res = await api.patch<ApiResponse<{ topic: ApiTopic }>>(`/topics/${id}`, payload)
    return res.data!.topic
  },

  deleteTopic: async (id: string): Promise<void> => {
    await api.delete<ApiResponse>(`/topics/${id}`)
  },

  // Tasks
  createTask: async (topicId: string, payload: CreateTaskPayload): Promise<ApiTask> => {
    const res = await api.post<ApiResponse<{ task: ApiTask }>>(`/topics/${topicId}/tasks`, payload)
    return res.data!.task
  },

  getTasks: async (topicId: string): Promise<ApiTask[]> => {
    const res = await api.get<ApiResponse<{ tasks: ApiTask[] }>>(`/topics/${topicId}/tasks`)
    return res.data!.tasks
  },

  updateTask: async (id: string, payload: UpdateTaskPayload): Promise<ApiTask> => {
    const res = await api.patch<ApiResponse<{ task: ApiTask }>>(`/tasks/${id}`, payload)
    return res.data!.task
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete<ApiResponse>(`/tasks/${id}`)
  },

  updateTaskCompletion: async (id: string, completed: boolean): Promise<ApiTask> => {
    const res = await api.patch<ApiResponse<{ task: ApiTask }>>(`/tasks/${id}/completion`, { completed })
    return res.data!.task
  },
}
