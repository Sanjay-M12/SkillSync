import * as React from "react"
import { Compass, Route, CheckSquare2, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui"

interface StepItem {
  number: string
  title: string
  subtitle: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const steps: StepItem[] = [
  {
    number: "01",
    title: "Define Goals & Weekly Hours",
    subtitle: "Intentional Planning",
    description:
      "Choose your primary learning target, level, and weekly study commitment to set an achievable pace.",
    icon: Compass,
  },
  {
    number: "02",
    title: "Execute Daily Smart Plans & Sprints",
    subtitle: "Actionable Daily Focus",
    description:
      "SkillSync calculates what to learn today. Launch 25-minute Pomodoro sessions linked directly to prioritized tasks.",
    icon: Route,
  },
  {
    number: "03",
    title: "Track Consistency & Master Skills",
    subtitle: "Verifiable Progress",
    description:
      "Review weak topics, build your 16-week GitHub-style heatmap, and unlock milestone achievement badges.",
    icon: CheckSquare2,
  },
]

export const LandingHowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 border-t border-border/80 bg-background relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
            Simple 3-Step Journey
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            How SkillSync Works
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
            From initial concept to complete mastery in a structured, measurable progression.
          </p>
        </div>

        {/* 3 Step Progression Cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-3 relative">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 sm:p-7 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-3xl font-black tracking-tight text-primary/30">
                    {step.number}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {step.subtitle}
                  </span>
                  <h3 className="text-base font-bold text-foreground sm:text-lg">
                    {step.title}
                  </h3>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed sm:text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="mt-12 text-center">
          <Link to="/register">
            <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start Your Journey Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default LandingHowItWorks
