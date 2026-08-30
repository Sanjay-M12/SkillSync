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
  completedAt: Date
}

export interface FocusStats {
  totalMinutes: number
  totalSessions: number
  todayMinutes: number
  todaySessions: number
  recentSessions: FocusSessionItem[]
}
