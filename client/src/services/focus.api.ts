import { api, ApiResponse } from "@/lib/api"

export interface FocusSessionInput {
  durationMinutes: number
  taskId?: string
  topicId?: string
}

export interface FocusSessionItem {
  id: string
  userId: string
  taskId: string | null
  topicId: string | null
  durationMinutes: number
  completedAt: string
}

export interface FocusStats {
  totalMinutes: number
  totalSessions: number
  todayMinutes: number
  todaySessions: number
  recentSessions: FocusSessionItem[]
}

export const focusApi = {
  logSession: async (input: FocusSessionInput): Promise<FocusSessionItem> => {
    const res = await api.post<ApiResponse<FocusSessionItem>>("/focus/session", input)
    return res.data!
  },

  getFocusStats: async (): Promise<FocusStats> => {
    const res = await api.get<ApiResponse<FocusStats>>("/focus/stats")
    return res.data!
  },
}
