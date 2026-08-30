import { LearningGoal, LearningLevel, WeeklyHours } from "./database.types"

export type { LearningGoal, LearningLevel, WeeklyHours }

export interface GoalResponseData {
  goal: LearningGoal
}

export interface GoalsListResponseData {
  goals: LearningGoal[]
}
