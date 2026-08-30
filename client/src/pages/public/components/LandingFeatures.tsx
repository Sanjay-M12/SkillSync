import * as React from "react"
import {
  Target,
  RotateCcw,
  Timer,
  Trophy,
  Sparkles,
  CheckCircle2,
  Calendar,
} from "lucide-react"

interface FeatureModule {
  icon: React.ComponentType<{ className?: string }>
  title: string
  badge: string
  description: string
  points: string[]
  color: string
  bgGlow: string
}

const featureModules: FeatureModule[] = [
  {
    icon: Sparkles,
    title: "Daily Smart Learning Planner",
    badge: "Smart Recommendation",
    description:
      "Answers 'What should I learn today?' with automated prioritization based on deadlines, weak topics, and study goals.",
    points: [
      "Rule-based smart recommendations",
      "Calculated estimated study time",
      "Immediate task action checklists",
    ],
    color: "text-primary",
    bgGlow: "bg-primary/10 border-primary/20",
  },
  {
    icon: Target,
    title: "Hierarchical Skill & Topic Trees",
    badge: "Curriculum Modeling",
    description:
      "Structure any learning goal into clear skills, detailed topics, and concrete tasks with automatic roll-up progress calculation.",
    points: [
      "Custom skill and topic breakdowns",
      "Automatic percentage roll-up",
      "Granular task completion tracking",
    ],
    color: "text-indigo-600 dark:text-indigo-400",
    bgGlow: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    icon: Timer,
    title: "Integrated Focus Mode & Pomodoro",
    badge: "Productivity Engine",
    description:
      "25-minute distraction-free study timer with Web Audio chimes, directly linking sprints to specific tasks and habits.",
    points: [
      "25m Focus / 5m Short / 15m Long Breaks",
      "Single-task context locking",
      "Automatic streak & minute logging",
    ],
    color: "text-blue-600 dark:text-blue-400",
    bgGlow: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Calendar,
    title: "GitHub-Style Learning Heatmap",
    badge: "Streak & Consistency",
    description:
      "Visualize your daily study habits over a 16-week matrix with density levels, weekly active days, and streak milestones.",
    points: [
      "16-week activity density grid",
      "Daily minute & task tooltips",
      "30-day monthly consistency rates",
    ],
    color: "text-emerald-600 dark:text-emerald-400",
    bgGlow: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: RotateCcw,
    title: "Confidence & Revision Queue",
    badge: "Spaced Retention",
    description:
      "Rate topics as Weak, Needs Revision, or Strong to automatically queue up targeted review sessions before knowledge fades.",
    points: [
      "3-tier confidence self-assessment",
      "Smart revision reminder queues",
      "Topic health & retention scoring",
    ],
    color: "text-amber-600 dark:text-amber-400",
    bgGlow: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Trophy,
    title: "Gamified Milestone Badges",
    badge: "Achievement Gallery",
    description:
      "Unlock Bronze, Silver, Gold, and Platinum badges across streaks, task velocity, goal completions, and deep work hours.",
    points: [
      "Tiered rarity achievements",
      "Total points and score multiplier",
      "Automatic milestone evaluator",
    ],
    color: "text-purple-600 dark:text-purple-400",
    bgGlow: "bg-purple-500/10 border-purple-500/20",
  },
]

export const LandingFeatures: React.FC = () => {
  return (
    <section id="features" className="py-20 sm:py-28 bg-muted/20 border-t border-border/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
            All-In-One Solution
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Engineered for Serious Learners
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
            Every tool you need to turn ambiguous ambitions into daily execution, measurable progress, and long-term mastery.
          </p>
        </div>

        {/* 6 Feature Modules Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureModules.map((feature, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${feature.bgGlow} ${feature.color}`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                    {feature.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-foreground sm:text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed sm:text-sm">
                    {feature.description}
                  </p>
                </div>

                {/* Bullet Points */}
                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  {feature.points.map((point, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-xs text-foreground/90">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LandingFeatures
