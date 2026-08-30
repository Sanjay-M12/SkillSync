import * as React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui"
import { ArrowRight, ChevronDown, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react"
import { ProductPreview } from "./ProductPreview"

export const LandingHero: React.FC = () => {
  const scrollToHowItWorks = () => {
    const el = document.getElementById("features")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 neo-hero-glow">
      {/* Background ambient circular gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          {/* Neo Category Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>AI-Driven Learning &amp; Mastery Tracking Platform</span>
          </div>

          {/* Main Headline with Neo Gradient */}
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.12]">
            Transform Learning Into <br className="hidden sm:inline" />
            <span className="neo-gradient-text">Measurable Mastery.</span>
          </h1>

          {/* Supporting Subtitle */}
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg leading-relaxed">
            The modern learning workspace for developers and lifelong learners. Plan daily focus, 
            execute deep work sprints, track skill trees, and maintain streaks with data-driven confidence.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/register">
              <Button size="lg" className="shadow-md shadow-primary/20" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Get Started Free
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToHowItWorks}
              rightIcon={<ChevronDown className="h-4 w-4" />}
            >
              Explore Solutions
            </Button>
          </div>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Free forever tier
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Smart daily learning plan
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" /> Pomodoro &amp; GitHub heatmaps
            </span>
          </div>
        </div>

        {/* Product Preview Mockup Container */}
        <div className="mt-12 sm:mt-16 lg:mt-20 max-w-5xl mx-auto">
          <ProductPreview />
        </div>
      </div>
    </section>
  )
}

export default LandingHero
