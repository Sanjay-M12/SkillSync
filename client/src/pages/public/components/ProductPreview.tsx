import * as React from "react"
import {
  Target,
  CheckCircle2,
  Circle,
  Flame,
  AlertCircle,
  Clock,
  Play,
  Layers,
} from "lucide-react"
import { ProgressBar, Badge, ConfidenceBadge } from "@/components/ui"

export const ProductPreview: React.FC = () => {
  return (
    <div className="w-full rounded-xl border border-border/80 bg-card text-card-foreground shadow-xl overflow-hidden transition-all text-left">
      {/* Mock Browser/Window Header */}
      <div className="flex h-10 items-center justify-between border-b border-border bg-muted/40 px-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <div className="flex items-center gap-2 rounded-md bg-background/80 px-3 py-0.5 text-[11px] text-muted-foreground border border-border/60">
          <Target className="h-3 w-3 text-primary" />
          <span>app.skillsync.dev/dashboard</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Mock App Interface */}
      <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Mock Left Mini-Sidebar (4 cols on lg) */}
        <div className="p-4 lg:col-span-4 bg-muted/10 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Learning Path
            </span>
            <Badge variant="default" size="sm">
              62% Overall
            </Badge>
          </div>

          <div className="space-y-2 text-xs">
            {/* Skill 1 */}
            <div className="flex items-center justify-between rounded-md border border-border/60 bg-card p-2.5 shadow-2xs">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                <span className="truncate">HTML &amp; CSS</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                100%
              </span>
            </div>

            {/* Skill 2 */}
            <div className="flex items-center justify-between rounded-md border border-border/60 bg-card p-2.5 shadow-2xs">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                <span className="truncate">JavaScript</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                100%
              </span>
            </div>

            {/* Skill 3 (Active) */}
            <div className="flex items-center justify-between rounded-md border border-primary/40 bg-primary/5 p-2.5 ring-1 ring-primary/20 shadow-2xs">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <Layers className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">React Framework</span>
              </div>
              <span className="text-[10px] font-bold text-primary">50%</span>
            </div>

            {/* Skill 4 */}
            <div className="flex items-center justify-between rounded-md border border-border/40 bg-muted/30 p-2.5 opacity-70">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Circle className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">Node.js &amp; Postgres</span>
              </div>
              <span className="text-[10px] text-muted-foreground">0%</span>
            </div>
          </div>

          {/* Goal Progress Summary */}
          <div className="rounded-lg border border-border/80 bg-card p-3 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Full Stack Developer</span>
              <span className="text-[11px] font-bold text-muted-foreground">62%</span>
            </div>
            <ProgressBar value={62} size="sm" />
          </div>
        </div>

        {/* Mock Main Dashboard Viewport (8 cols on lg) */}
        <div className="p-4 lg:col-span-8 space-y-4">
          {/* Mock Today's Focus Card */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Today&apos;s Focus
              </span>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" /> 45 min est.
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-foreground sm:text-base">
                React Hooks Fundamentals
              </h4>
              <p className="text-xs text-muted-foreground">
                React &bull; Component State &amp; Lifecycle Management
              </p>
            </div>

            {/* Actionable Tasks */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-2.5 py-1.5 text-xs">
                <span className="flex items-center gap-2 line-through text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Master useState hook
                </span>
                <span className="text-[10px] text-muted-foreground">Done</span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium">
                <span className="flex items-center gap-2 text-foreground">
                  <Circle className="h-3.5 w-3.5 text-primary" /> Understand useEffect dependency array
                </span>
                <span className="text-[10px] text-primary font-semibold">Next up</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-2xs">
                <Play className="h-3 w-3 fill-current" /> Start 45m Session
              </div>
              <ConfidenceBadge confidence="NEEDS_REVISION" />
            </div>
          </div>

          {/* Two Small Widget Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Streak & Consistency */}
            <div className="rounded-lg border border-border bg-card p-3 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Flame className="h-3.5 w-3.5" /> Study Streak
                </span>
                <span className="text-[10px]">Active</span>
              </div>
              <div className="text-xl font-extrabold text-foreground">3 Days 🔥</div>
              <p className="text-[10px] text-muted-foreground">This week: 4.5 / 10 Hours</p>
            </div>

            {/* Revision Alert */}
            <div className="rounded-lg border border-border bg-card p-3 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 text-rose-500 font-semibold">
                  <AlertCircle className="h-3.5 w-3.5" /> Revision Queue
                </span>
                <span className="text-[10px] font-bold text-rose-600">2 Weak</span>
              </div>
              <div className="text-sm font-bold text-foreground truncate">Async JS &amp; Promises</div>
              <p className="text-[10px] text-muted-foreground">Scheduled for smart review</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPreview
