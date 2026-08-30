export interface ProfileFormValues {
  name: string
  email: string
}

export type LearningLevelOption = "Beginner" | "Intermediate" | "Advanced"

export type WeeklyHoursOption = 3 | 6 | 10 | 15

export interface LearningPreferencesValues {
  level: LearningLevelOption | string
  weeklyHours: number
}
