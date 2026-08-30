import * as React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui"
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"

export const LandingCTA: React.FC = () => {
  return (
    <section className="border-t border-border/80 bg-muted/20 py-20 sm:py-28 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-primary/30 bg-card p-8 sm:p-14 text-center shadow-lg space-y-6 relative overflow-hidden">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl leading-tight">
            Ready to Take Control of Your <br className="hidden sm:inline" />
            <span className="neo-gradient-text">Learning Consistency?</span>
          </h2>

          <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base leading-relaxed">
            Join thousands of motivated learners using SkillSync to turn ambitious goals into organized, trackable, daily learning routines.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link to="/register">
              <Button size="lg" className="shadow-md shadow-primary/20" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Create Your Free Account
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border/60">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> No credit card required
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Instant goal setup
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Full feature access
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingCTA
