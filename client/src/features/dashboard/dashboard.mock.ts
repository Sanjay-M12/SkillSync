import type { DashboardData } from "./dashboard.types"

export const defaultMockDashboardData: DashboardData = {
  user: {
    name: "Sanjay",
    email: "sanjay@skillsync.dev",
  },
  activeGoal: {
    id: "goal-fullstack-1",
    title: "Become a Full Stack Developer",
    level: "Beginner",
    progressPercent: 38,
    targetWeeklyHours: 10,
    totalSkills: 6,
    completedSkills: 2,
    totalTopics: 18,
    completedTopics: 7,
  },
  todaysFocus: {
    goalId: "goal-fullstack-1",
    topicId: "topic-async-js",
    skillTitle: "JavaScript",
    topicTitle: "Async JavaScript",
    taskTitle: "Understand async/await with a small API example",
    estimatedMinutes: 45,
  },
  revisionQueue: [
    {
      id: "rev-1",
      topicTitle: "JavaScript Closures",
      skillTitle: "JavaScript",
      confidence: "WEAK",
    },
    {
      id: "rev-2",
      topicTitle: "Array Methods & Callbacks",
      skillTitle: "JavaScript",
      confidence: "NEEDS_REVISION",
    },
  ],
  weeklyActivity: {
    days: [
      { day: "Monday", shortDay: "Mon", date: "2026-08-20", minutesStudied: 60, isToday: false },
      { day: "Tuesday", shortDay: "Tue", date: "2026-08-21", minutesStudied: 45, isToday: false },
      { day: "Wednesday", shortDay: "Wed", date: "2026-08-22", minutesStudied: 90, isToday: false },
      { day: "Thursday", shortDay: "Thu", date: "2026-08-23", minutesStudied: 30, isToday: false },
      { day: "Friday", shortDay: "Fri", date: "2026-08-24", minutesStudied: 45, isToday: false },
      { day: "Saturday", shortDay: "Sat", date: "2026-08-25", minutesStudied: 0, isToday: false },
      { day: "Sunday", shortDay: "Sun", date: "2026-08-26", minutesStudied: 0, isToday: true },
    ],
    totalHoursThisWeek: 4.5,
    targetWeeklyHours: 10,
    streakDays: 3,
    longestStreak: 7,
  },
}

/**
 * Access layer for Dashboard Data.
 * Pulls from local storage if onboarding created a customized journey,
 * otherwise falls back to the default curated mock data.
 */
export function getMockDashboardData(): DashboardData {
  try {
    const storedGoal = localStorage.getItem("skillsync_onboarding_goal")
    const storedLevel = localStorage.getItem("skillsync_onboarding_level")
    const storedHours = localStorage.getItem("skillsync_onboarding_hours")
    const storedName = localStorage.getItem("skillsync_user_name")

    if (storedGoal || storedLevel || storedHours || storedName) {
      return {
        ...defaultMockDashboardData,
        user: {
          ...defaultMockDashboardData.user,
          name: storedName || defaultMockDashboardData.user.name,
        },
        activeGoal: defaultMockDashboardData.activeGoal
          ? {
              ...defaultMockDashboardData.activeGoal,
              title: storedGoal || defaultMockDashboardData.activeGoal.title,
              level: storedLevel || defaultMockDashboardData.activeGoal.level,
              targetWeeklyHours: storedHours
                ? parseInt(storedHours, 10)
                : defaultMockDashboardData.activeGoal.targetWeeklyHours,
            }
          : null,
      }
    }
  } catch {
    // Return default mock if localStorage is not accessible
  }

  return defaultMockDashboardData
}
