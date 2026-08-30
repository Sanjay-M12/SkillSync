import type { EntityProgressStatus } from "@/types"
import type { WorkspaceGoal, WorkspaceSkill, WorkspaceTopic } from "./learning.types"

export function deriveStatus(progress: number): EntityProgressStatus {
  if (progress <= 0) return "NOT_STARTED"
  if (progress >= 100) return "COMPLETED"
  return "IN_PROGRESS"
}

export function calculateTopicProgress(topic: WorkspaceTopic): number {
  if (!topic.tasks || topic.tasks.length === 0) {
    return 0
  }
  const completed = topic.tasks.filter((t) => t.completed).length
  return Math.round((completed / topic.tasks.length) * 100)
}

export function calculateSkillProgress(skill: WorkspaceSkill): number {
  if (!skill.topics || skill.topics.length === 0) {
    return 0
  }

  let totalTasks = 0
  let completedTasks = 0

  for (const topic of skill.topics) {
    if (topic.tasks && topic.tasks.length > 0) {
      totalTasks += topic.tasks.length
      completedTasks += topic.tasks.filter((t) => t.completed).length
    }
  }

  if (totalTasks > 0) {
    return Math.round((completedTasks / totalTasks) * 100)
  }

  // Fallback: Average topic progress if no tasks exist
  const topicPercentages = skill.topics.map((t) => calculateTopicProgress(t))
  const avg = topicPercentages.reduce((a, b) => a + b, 0) / skill.topics.length
  return Math.round(avg)
}

export function calculateGoalProgress(goal: WorkspaceGoal): number {
  if (!goal.skills || goal.skills.length === 0) {
    return 0
  }

  let totalTasks = 0
  let completedTasks = 0

  for (const skill of goal.skills) {
    for (const topic of skill.topics) {
      if (topic.tasks && topic.tasks.length > 0) {
        totalTasks += topic.tasks.length
        completedTasks += topic.tasks.filter((t) => t.completed).length
      }
    }
  }

  if (totalTasks > 0) {
    return Math.round((completedTasks / totalTasks) * 100)
  }

  // Fallback: Average skill progress
  const skillPercentages = goal.skills.map((s) => calculateSkillProgress(s))
  const avg = skillPercentages.reduce((a, b) => a + b, 0) / goal.skills.length
  return Math.round(avg)
}

/**
 * Attaches derived progress and status across the entire learning hierarchy.
 */
export function hydrateGoalWithProgress(goal: WorkspaceGoal): WorkspaceGoal {
  const updatedSkills = goal.skills.map((skill) => {
    const updatedTopics = skill.topics.map((topic) => {
      const progress = calculateTopicProgress(topic)
      return {
        ...topic,
        progress,
        status: deriveStatus(progress),
      }
    })

    const skillWithUpdatedTopics = { ...skill, topics: updatedTopics }
    const skillProgress = calculateSkillProgress(skillWithUpdatedTopics)

    return {
      ...skill,
      topics: updatedTopics,
      progress: skillProgress,
      status: deriveStatus(skillProgress),
    }
  })

  const goalWithUpdatedSkills = { ...goal, skills: updatedSkills }
  const goalProgress = calculateGoalProgress(goalWithUpdatedSkills)

  return {
    ...goal,
    skills: updatedSkills,
    progress: goalProgress,
  }
}
