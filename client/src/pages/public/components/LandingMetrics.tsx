import * as React from "react"
import { Users, TrendingUp, Compass, Award } from "lucide-react"

interface MetricItem {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
  sublabel: string
}

const metrics: MetricItem[] = [
  {
    icon: Users,
    value: "100K+",
    label: "Study Sprints Logged",
    sublabel: "Across thousands of active goals",
  },
  {
    icon: TrendingUp,
    value: "94.8%",
    label: "Consistency Rate",
    sublabel: "Weekly habit retention score",
  },
  {
    icon: Compass,
    value: "500+",
    label: "Skill & Topic Trees",
    sublabel: "Custom structured roadmaps",
  },
  {
    icon: Award,
    value: "10+ Tiers",
    label: "Milestone Badges",
    sublabel: "Gamified achievement system",
  },
]

export const LandingMetrics: React.FC = () => {
  return (
    <section className="border-y border-border/70 bg-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-1.5 p-4 rounded-xl transition-all hover:bg-background/80"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-1">
                <metric.icon className="h-5 w-5" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {metric.value}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-foreground">
                {metric.label}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {metric.sublabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LandingMetrics
