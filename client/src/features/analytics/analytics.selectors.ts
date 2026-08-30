import type { WorkspaceGoal } from "@/features/learning"
import type {
  GoalOverviewMetrics,
  SkillProgressSummary,
  ConfidenceGroupSummary,
  ConfidenceTopicItem,
} from "./analytics.types"

export function formatMinutes(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes}m`
  }
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (minutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${minutes}m`
}

export function deriveGoalOverview(goal: WorkspaceGoal): GoalOverviewMetrics {
  let totalTasks = 0
  let completedTasks = 0

  for (const skill of goal.skills) {
    for (const topic of skill.topics) {
      if (topic.tasks) {
        totalTasks += topic.tasks.length
        completedTasks += topic.tasks.filter((t) => t.completed).length
      }
    }
  }

  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : goal.progress || 0

  return {
    goalTitle: goal.title,
    level: goal.level || "Beginner",
    progressPercent,
    completedTasks,
    totalTasks,
  }
}

export function deriveSkillProgressList(goal: WorkspaceGoal): SkillProgressSummary[] {
  return goal.skills.map((skill) => {
    let skillTotal = 0
    let skillCompleted = 0

    for (const topic of skill.topics) {
      if (topic.tasks) {
        skillTotal += topic.tasks.length
        skillCompleted += topic.tasks.filter((t) => t.completed).length
      }
    }

    const progressPercent =
      skillTotal > 0 ? Math.round((skillCompleted / skillTotal) * 100) : skill.progress || 0

    return {
      id: skill.id,
      name: skill.name,
      progressPercent,
      completedTasks: skillCompleted,
      totalTasks: skillTotal,
    }
  })
}

export function deriveConfidenceSummary(goal: WorkspaceGoal): ConfidenceGroupSummary {
  const strong: ConfidenceTopicItem[] = []
  const needsRevision: ConfidenceTopicItem[] = []
  const weak: ConfidenceTopicItem[] = []
  const notRated: ConfidenceTopicItem[] = []

  for (const skill of goal.skills) {
    for (const topic of skill.topics) {
      const item: ConfidenceTopicItem = {
        id: topic.id,
        name: topic.name,
        skillName: skill.name,
        confidence: topic.confidence,
      }

      switch (topic.confidence) {
        case "STRONG":
          strong.push(item)
          break
        case "NEEDS_REVISION":
          needsRevision.push(item)
          break
        case "WEAK":
          weak.push(item)
          break
        case "NOT_RATED":
        default:
          notRated.push(item)
          break
      }
    }
  }

  return {
    strong,
    needsRevision,
    weak,
    notRated,
    needsAttentionCount: weak.length + needsRevision.length,
  }
}
