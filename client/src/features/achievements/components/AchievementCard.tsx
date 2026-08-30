import * as React from "react"
import {
  Target,
  Flame,
  Swords,
  Crown,
  Zap,
  Award,
  Brain,
  Rocket,
  Timer,
  Sparkles,
  CheckCircle,
  Lock,
} from "lucide-react"
import { ProgressBar } from "@/components/ui"
import type { AchievementItem } from "@/services/achievements.api"

export interface AchievementCardProps {
  achievement: AchievementItem
}

interface BadgeColorTheme {
  iconBg: string
  ringColor: string
  pointsColor: string
  borderColor: string
}

// Support key mapping (uppercase and lowercase) and icon name fallback
const BADGE_THEMES: Record<string, BadgeColorTheme> = {
  // First Step / Target
  FIRST_STEP: {
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30",
    ringColor: "ring-blue-500/30",
    pointsColor: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    borderColor: "hover:border-blue-500/40",
  },
  // Habit Builder / Flame
  STREAK_3_DAY: {
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30",
    ringColor: "ring-amber-500/30",
    pointsColor: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    borderColor: "hover:border-amber-500/40",
  },
  // 7-Day Warrior / Swords
  STREAK_7_DAY: {
    iconBg: "bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-md shadow-orange-500/30",
    ringColor: "ring-orange-500/30",
    pointsColor: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20",
    borderColor: "hover:border-orange-500/40",
  },
  // Unstoppable Force / Crown
  STREAK_30_DAY: {
    iconBg: "bg-gradient-to-br from-purple-600 via-fuchsia-600 to-indigo-600 text-white shadow-md shadow-purple-500/30 ring-1 ring-purple-400/40",
    ringColor: "ring-purple-500/40",
    pointsColor: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/25",
    borderColor: "hover:border-purple-500/40",
  },
  // Momentum Maker / Check
  TASK_CRUSHER_10: {
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30",
    ringColor: "ring-emerald-500/30",
    pointsColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    borderColor: "hover:border-emerald-500/40",
  },
  // Task Crusher / Zap
  TASK_CRUSHER_50: {
    iconBg: "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30",
    ringColor: "ring-cyan-500/30",
    pointsColor: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    borderColor: "hover:border-cyan-500/40",
  },
  // Century Achiever / Award
  TASK_CRUSHER_100: {
    iconBg: "bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-white shadow-md shadow-yellow-500/30",
    ringColor: "ring-yellow-500/40",
    pointsColor: "text-yellow-700 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/25",
    borderColor: "hover:border-yellow-500/40",
  },
  // Mastery Seeker / Brain
  CONFIDENCE_STRONG_5: {
    iconBg: "bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-md shadow-violet-500/30",
    ringColor: "ring-violet-500/30",
    pointsColor: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20",
    borderColor: "hover:border-violet-500/40",
  },
  // Goal Crusher / Rocket
  GOAL_COMPLETED: {
    iconBg: "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/30",
    ringColor: "ring-rose-500/30",
    pointsColor: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
    borderColor: "hover:border-rose-500/40",
  },
  // Deep Work Initiate / Timer
  POMODORO_FIRST: {
    iconBg: "bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/30",
    ringColor: "ring-sky-500/30",
    pointsColor: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20",
    borderColor: "hover:border-sky-500/40",
  },
  // Focus Master / Sparkles
  FOCUS_MASTER_5H: {
    iconBg: "bg-gradient-to-br from-violet-600 to-purple-800 text-white shadow-md shadow-purple-500/30",
    ringColor: "ring-purple-500/40",
    pointsColor: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/25",
    borderColor: "hover:border-purple-500/40",
  },
}

// Icon-based fallback map
const ICON_THEMES: Record<string, BadgeColorTheme> = {
  Target: BADGE_THEMES.FIRST_STEP,
  Flame: BADGE_THEMES.STREAK_3_DAY,
  Swords: BADGE_THEMES.STREAK_7_DAY,
  Crown: BADGE_THEMES.STREAK_30_DAY,
  CheckCircle: BADGE_THEMES.TASK_CRUSHER_10,
  Zap: BADGE_THEMES.TASK_CRUSHER_50,
  Award: BADGE_THEMES.TASK_CRUSHER_100,
  Brain: BADGE_THEMES.CONFIDENCE_STRONG_5,
  Rocket: BADGE_THEMES.GOAL_COMPLETED,
  Timer: BADGE_THEMES.POMODORO_FIRST,
  Sparkles: BADGE_THEMES.FOCUS_MASTER_5H,
}

const DEFAULT_THEME: BadgeColorTheme = {
  iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20",
  ringColor: "ring-primary/30",
  pointsColor: "text-primary bg-primary/10 border-primary/20",
  borderColor: "hover:border-primary/40",
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const getIcon = (iconName: string) => {
    const props = { className: "h-5 w-5 sm:h-6 sm:w-6 text-white stroke-[2.2]" }
    switch (iconName) {
      case "Target":
        return <Target {...props} />
      case "Flame":
        return <Flame {...props} />
      case "Swords":
        return <Swords {...props} />
      case "Crown":
        return <Crown {...props} />
      case "Zap":
        return <Zap {...props} />
      case "Award":
        return <Award {...props} />
      case "Brain":
        return <Brain {...props} />
      case "Rocket":
        return <Rocket {...props} />
      case "Timer":
        return <Timer {...props} />
      case "Sparkles":
        return <Sparkles {...props} />
      default:
        return <CheckCircle {...props} />
    }
  }

  const getTierBadgeClass = (tier: AchievementItem["tier"]) => {
    switch (tier) {
      case "PLATINUM":
        return "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-300 border-purple-400/40 shadow-xs"
      case "GOLD":
        return "bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border-yellow-500/40 shadow-xs"
      case "SILVER":
        return "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-400/40 shadow-xs"
      case "BRONZE":
      default:
        return "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 shadow-xs"
    }
  }

  // Look up by uppercase key, or by icon name, or fallback
  const theme =
    BADGE_THEMES[achievement.key] ||
    BADGE_THEMES[achievement.key.toUpperCase()] ||
    ICON_THEMES[achievement.icon] ||
    DEFAULT_THEME

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 transition-all duration-200 relative overflow-hidden flex flex-col justify-between shadow-xs bg-card ${
        theme.borderColor
      } ${
        achievement.isUnlocked
          ? "border-primary/40 ring-1 ring-primary/20 hover:scale-[1.02] shadow-sm"
          : "border-border/80 hover:shadow-xs"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Colorful Vibrant Gradient Icon Box */}
          <div
            className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl transition-transform hover:scale-105 ${
              theme.iconBg
            }`}
          >
            {getIcon(achievement.icon)}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-sm font-bold text-foreground truncate">
                {achievement.title}
              </h4>
              {achievement.isUnlocked ? (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 shrink-0 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle className="h-3 w-3" /> Unlocked
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-0.5 shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">
                  <Lock className="h-2.5 w-2.5" /> Locked
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {achievement.description}
            </p>
          </div>
        </div>

        {/* Tier & Points Badges */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider border ${getTierBadgeClass(
              achievement.tier
            )}`}
          >
            {achievement.tier}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${theme.pointsColor}`}
          >
            +{achievement.points} pts
          </span>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="space-y-1.5 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between text-[11px] font-medium">
          <span className="text-muted-foreground">
            {achievement.isUnlocked
              ? achievement.unlockedAt
                ? `Earned ${new Date(achievement.unlockedAt).toLocaleDateString()}`
                : "Completed 🎉"
              : `Progress: ${achievement.currentValue} / ${achievement.targetValue}`}
          </span>
          <span
            className={`font-bold ${
              achievement.isUnlocked ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
            }`}
          >
            {achievement.progressPercentage}%
          </span>
        </div>
        <ProgressBar
          value={achievement.progressPercentage}
          size="sm"
        />
      </div>
    </div>
  )
}

export default AchievementCard
