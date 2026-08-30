import { Skill, Topic, Task, TopicConfidence } from "./database.types"

export type { Skill, Topic, Task, TopicConfidence }

export interface TopicWithTasks extends Topic {
  tasks: Task[]
}

export interface SkillWithTopics extends Skill {
  topics: TopicWithTasks[]
}

export interface GoalLearningHierarchy {
  id: string
  title: string
  description: string | null
  currentLevel: string
  weeklyHours: string
  createdAt: Date
  updatedAt: Date
  skills: SkillWithTopics[]
}
