import { prisma } from "../config/prisma"
import {
  StreakResponseData,
  DayActivityItem,
  WeeklyActivitySummary,
  MonthlyConsistencySummary,
  TodayLearningStatus,
} from "../types/streak.types"

export class StreakService {
  /**
   * Format date as YYYY-MM-DD
   */
  formatDate(d: Date): string {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  /**
   * Get today's date formatted as YYYY-MM-DD in local time
   */
  getTodayDateString(): string {
    return this.formatDate(new Date())
  }

  /**
   * Parse YYYY-MM-DD to Date object at local midnight
   */
  parseDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split("-").map(Number)
    return new Date(y, m - 1, d)
  }

  /**
   * Record learning activity delta for a user on a given date (default: today)
   */
  async recordActivity(
    userId: string,
    tasksDelta: number = 0,
    minutesDelta: number = 0,
    customDate?: string
  ) {
    const date = customDate || this.getTodayDateString()

    const existing = await prisma.dailyActivity.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    })

    if (existing) {
      const newTasks = Math.max(0, existing.tasksCompleted + tasksDelta)
      const newMinutes = Math.max(0, existing.minutesStudied + minutesDelta)

      return await prisma.dailyActivity.update({
        where: { id: existing.id },
        data: {
          tasksCompleted: newTasks,
          minutesStudied: newMinutes,
        },
      })
    } else {
      return await prisma.dailyActivity.create({
        data: {
          userId,
          date,
          tasksCompleted: Math.max(0, tasksDelta),
          minutesStudied: Math.max(0, minutesDelta),
        },
      })
    }
  }

  /**
   * Calculate current streak, longest streak, weekly activity, and monthly consistency.
   */
  async getStreakData(
    userId: string,
    targetWeeklyHours: number = 10,
    clientDateStr?: string
  ): Promise<StreakResponseData> {
    const todayStr = clientDateStr || this.getTodayDateString()
    const todayDate = this.parseDate(todayStr)

    // Fetch all user daily activities
    const activities = await prisma.dailyActivity.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    })

    // Map by date for fast O(1) lookup
    const activityMap = new Map<string, { tasksCompleted: number; minutesStudied: number }>()
    for (const act of activities) {
      activityMap.set(act.date, {
        tasksCompleted: act.tasksCompleted,
        minutesStudied: act.minutesStudied,
      })
    }

    // Set of active dates (where tasksCompleted > 0 or minutesStudied > 0)
    const activeDates = new Set<string>()
    for (const act of activities) {
      if (act.tasksCompleted > 0 || act.minutesStudied > 0) {
        activeDates.add(act.date)
      }
    }

    // --------------------------------------------------
    // 1. COMPUTE CURRENT STREAK
    // --------------------------------------------------
    let currentStreak = 0
    const todayIsActive = activeDates.has(todayStr)

    // Start checking from today if active, or from yesterday if today not yet completed
    let checkDate = new Date(todayDate)
    if (!todayIsActive) {
      checkDate.setDate(checkDate.getDate() - 1)
    }

    while (true) {
      const checkStr = this.formatDate(checkDate)
      if (activeDates.has(checkStr)) {
        currentStreak += 1
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    // --------------------------------------------------
    // 2. COMPUTE LONGEST STREAK
    // --------------------------------------------------
    let longestStreak = currentStreak
    if (activeDates.size > 0) {
      const sortedActive = Array.from(activeDates).sort()
      let tempStreak = 0
      let lastDate: Date | null = null

      for (const dStr of sortedActive) {
        const curr = this.parseDate(dStr)
        if (!lastDate) {
          tempStreak = 1
        } else {
          const diffMs = curr.getTime() - lastDate.getTime()
          const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
          if (diffDays === 1) {
            tempStreak += 1
          } else if (diffDays > 1) {
            tempStreak = 1
          }
        }
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak
        }
        lastDate = curr
      }
    }

    // --------------------------------------------------
    // 3. TODAY'S LEARNING STATUS
    // --------------------------------------------------
    const todayAct = activityMap.get(todayStr)
    const tasksCompletedToday = todayAct?.tasksCompleted || 0
    const minutesStudiedToday = todayAct?.minutesStudied || 0
    const isCompletedToday = tasksCompletedToday > 0 || minutesStudiedToday > 0

    const todayStatus: TodayLearningStatus = {
      isCompletedToday,
      tasksCompletedToday,
      minutesStudiedToday,
      message: isCompletedToday
        ? `🔥 Streak Active! Great job keeping your momentum today.`
        : currentStreak > 0
        ? `⚡ Keep your ${currentStreak}-day streak alive! Complete 1 task today.`
        : `Start a new learning streak today by completing your first task!`,
      callToAction: isCompletedToday
        ? "Review topics or continue learning"
        : "Complete today's focus task",
    }

    // --------------------------------------------------
    // 4. WEEKLY ACTIVITY (Last 7 Days)
    // --------------------------------------------------
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const shortDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const weeklyDays: DayActivityItem[] = []
    let weeklyActiveDaysCount = 0
    let weeklyTotalMinutes = 0

    // Build last 7 days window (from 6 days ago up to today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayDate)
      d.setDate(d.getDate() - i)
      const dStr = this.formatDate(d)
      const act = activityMap.get(dStr)

      const tasksCompleted = act?.tasksCompleted || 0
      const minutesStudied = act?.minutesStudied || 0
      const isActive = tasksCompleted > 0 || minutesStudied > 0
      const isToday = dStr === todayStr

      if (isActive) weeklyActiveDaysCount += 1
      weeklyTotalMinutes += minutesStudied

      weeklyDays.push({
        date: dStr,
        day: dayNames[d.getDay()],
        shortDay: shortDayNames[d.getDay()],
        tasksCompleted,
        minutesStudied,
        isActive,
        isToday,
      })
    }

    const totalHoursThisWeek = Number((weeklyTotalMinutes / 60).toFixed(1))
    const targetPercent = Math.min(
      100,
      Math.round((totalHoursThisWeek / (targetWeeklyHours || 10)) * 100)
    )

    const weekly: WeeklyActivitySummary = {
      days: weeklyDays,
      activeDays: weeklyActiveDaysCount,
      totalDays: 7,
      totalHoursThisWeek,
      targetWeeklyHours,
      targetPercent,
    }

    // --------------------------------------------------
    // 5. MONTHLY CONSISTENCY (Current Month)
    // --------------------------------------------------
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ]

    const currentYear = todayDate.getFullYear()
    const currentMonthIndex = todayDate.getMonth()
    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate()

    const monthlyDays: DayActivityItem[] = []
    let monthlyActiveDaysCount = 0

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(currentYear, currentMonthIndex, dayNum)
      const dStr = this.formatDate(d)
      const act = activityMap.get(dStr)

      const tasksCompleted = act?.tasksCompleted || 0
      const minutesStudied = act?.minutesStudied || 0
      const isActive = tasksCompleted > 0 || minutesStudied > 0
      const isToday = dStr === todayStr

      if (isActive) monthlyActiveDaysCount += 1

      monthlyDays.push({
        date: dStr,
        day: dayNames[d.getDay()],
        shortDay: shortDayNames[d.getDay()],
        tasksCompleted,
        minutesStudied,
        isActive,
        isToday,
      })
    }

    const consistencyPercentage = Math.round((monthlyActiveDaysCount / daysInMonth) * 100)

    const monthly: MonthlyConsistencySummary = {
      activeDays: monthlyActiveDaysCount,
      totalDays: daysInMonth,
      consistencyPercentage,
      monthName: monthNames[currentMonthIndex],
      year: currentYear,
      days: monthlyDays,
    }

    // --------------------------------------------------
    // 6. GITHUB-STYLE ACTIVITY HEATMAP (16 Weeks)
    // --------------------------------------------------

    const weeksCount = 16
    const totalDaysToFetch = weeksCount * 7
    const heatmapWeeks: import("../types/streak.types").HeatmapWeek[] = []

    // Find the end of the current week (Saturday) or today
    const heatmapEndDate = new Date(todayDate)
    const currentDayOfWeek = heatmapEndDate.getDay() // 0 = Sun, 6 = Sat
    const daysUntilSaturday = 6 - currentDayOfWeek
    heatmapEndDate.setDate(heatmapEndDate.getDate() + daysUntilSaturday)

    const heatmapStartDate = new Date(heatmapEndDate)
    heatmapStartDate.setDate(heatmapStartDate.getDate() - (totalDaysToFetch - 1))

    let totalHeatmapTasks = 0
    let totalHeatmapMinutes = 0
    let totalHeatmapActiveDays = 0

    let cursorDate = new Date(heatmapStartDate)
    let currentWeekDays: import("../types/streak.types").HeatmapDay[] = []
    let currentWeekMonthLabel: string | undefined = undefined
    let lastSeenMonth = -1

    for (let i = 0; i < totalDaysToFetch; i++) {
      const dStr = this.formatDate(cursorDate)
      const act = activityMap.get(dStr)

      const tasksCompleted = act?.tasksCompleted || 0
      const minutesStudied = act?.minutesStudied || 0
      const isToday = dStr === todayStr

      // Determine level: 0 to 3
      let level: 0 | 1 | 2 | 3 = 0
      if (minutesStudied >= 60 || tasksCompleted >= 4) {
        level = 3
      } else if (minutesStudied >= 30 || tasksCompleted >= 2) {
        level = 2
      } else if (minutesStudied > 0 || tasksCompleted > 0) {
        level = 1
      }

      if (level > 0) totalHeatmapActiveDays += 1
      totalHeatmapTasks += tasksCompleted
      totalHeatmapMinutes += minutesStudied

      const month = cursorDate.getMonth()
      if (month !== lastSeenMonth && cursorDate.getDate() <= 7) {
        currentWeekMonthLabel = monthNames[month].slice(0, 3)
        lastSeenMonth = month
      }

      currentWeekDays.push({
        date: dStr,
        dayOfWeek: cursorDate.getDay(),
        tasksCompleted,
        minutesStudied,
        level,
        isToday,
      })

      if (currentWeekDays.length === 7) {
        heatmapWeeks.push({
          weekIndex: heatmapWeeks.length,
          monthLabel: currentWeekMonthLabel,
          days: currentWeekDays,
        })
        currentWeekDays = []
        currentWeekMonthLabel = undefined
      }

      cursorDate.setDate(cursorDate.getDate() + 1)
    }

    const heatmap: import("../types/streak.types").ActivityHeatmap = {
      totalActiveDays: totalHeatmapActiveDays,
      totalHours: Number((totalHeatmapMinutes / 60).toFixed(1)),
      totalTasks: totalHeatmapTasks,
      weeks: heatmapWeeks,
      startDate: this.formatDate(heatmapStartDate),
      endDate: this.formatDate(heatmapEndDate),
    }

    return {
      currentStreak,
      longestStreak,
      todayStatus,
      weekly,
      monthly,
      heatmap,
    }
  }

}

export const streakService = new StreakService()
