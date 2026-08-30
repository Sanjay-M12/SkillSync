export interface AchievementDefinition {
  key: string
  title: string
  description: string
  category: "STREAK" | "TASKS" | "GOALS" | "MASTERY" | "FOCUS"
  icon: string
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
  points: number
  targetValue: number
}

export const ACHIEVEMENTS_CATALOG: AchievementDefinition[] = [
  {
    key: "FIRST_STEP",
    title: "First Step",
    description: "Complete your very first task in SkillSync",
    category: "TASKS",
    icon: "Target",
    tier: "BRONZE",
    points: 50,
    targetValue: 1,
  },
  {
    key: "STREAK_3_DAY",
    title: "Habit Builder",
    description: "Maintain an active 3-day learning streak",
    category: "STREAK",
    icon: "Flame",
    tier: "BRONZE",
    points: 100,
    targetValue: 3,
  },
  {
    key: "STREAK_7_DAY",
    title: "7-Day Warrior",
    description: "Maintain an unbroken 7-day learning streak",
    category: "STREAK",
    icon: "Swords",
    tier: "SILVER",
    points: 250,
    targetValue: 7,
  },
  {
    key: "STREAK_30_DAY",
    title: "Unstoppable Force",
    description: "Achieve a legendary 30-day learning streak",
    category: "STREAK",
    icon: "Crown",
    tier: "PLATINUM",
    points: 1000,
    targetValue: 30,
  },
  {
    key: "TASK_CRUSHER_10",
    title: "Momentum Maker",
    description: "Complete 10 total learning tasks",
    category: "TASKS",
    icon: "CheckCircle",
    tier: "BRONZE",
    points: 100,
    targetValue: 10,
  },
  {
    key: "TASK_CRUSHER_50",
    title: "Task Crusher",
    description: "Complete 50 total learning tasks",
    category: "TASKS",
    icon: "Zap",
    tier: "SILVER",
    points: 300,
    targetValue: 50,
  },
  {
    key: "TASK_CRUSHER_100",
    title: "Century Achiever",
    description: "Complete 100 total learning tasks",
    category: "TASKS",
    icon: "Award",
    tier: "GOLD",
    points: 750,
    targetValue: 100,
  },
  {
    key: "CONFIDENCE_STRONG_5",
    title: "Mastery Seeker",
    description: "Rate 5 topics with Strong confidence",
    category: "MASTERY",
    icon: "Brain",
    tier: "SILVER",
    points: 200,
    targetValue: 5,
  },
  {
    key: "GOAL_COMPLETED",
    title: "Goal Crusher",
    description: "Reach 100% completion on a learning goal",
    category: "GOALS",
    icon: "Rocket",
    tier: "GOLD",
    points: 500,
    targetValue: 1,
  },
  {
    key: "POMODORO_FIRST",
    title: "Deep Work Initiate",
    description: "Complete your first 25-minute Pomodoro focus session",
    category: "FOCUS",
    icon: "Timer",
    tier: "BRONZE",
    points: 50,
    targetValue: 1,
  },
  {
    key: "FOCUS_MASTER_5H",
    title: "Focus Master",
    description: "Accumulate 5 hours (300 minutes) of focused Pomodoro study time",
    category: "FOCUS",
    icon: "Sparkles",
    tier: "GOLD",
    points: 500,
    targetValue: 300,
  },
]
