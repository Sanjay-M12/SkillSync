import * as React from "react"
import { Link } from "react-router-dom"
import { Button, Badge } from "@/components/ui"
import { AlertCircle, CheckCircle2, RotateCcw, ArrowRight, ShieldCheck } from "lucide-react"
import type { ConfidenceGroupSummary } from "../analytics.types"

export interface ConfidenceInsightsProps {
  confidenceSummary: ConfidenceGroupSummary
}

export const ConfidenceInsights: React.FC<ConfidenceInsightsProps> = ({ confidenceSummary }) => {
  const { strong, needsRevision, weak, notRated, needsAttentionCount } = confidenceSummary

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header with Title and Review CTA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">Confidence &amp; Revision Insights</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Topic comprehension breakdown based on your self-ratings
          </p>
        </div>

        <Link to="/learning">
          <Button size="sm" variant="outline" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
            Review Learning
          </Button>
        </Link>
      </div>

      {/* Revision Alert Callout (If topics need attention) */}
      {needsAttentionCount > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
              {needsAttentionCount} {needsAttentionCount === 1 ? "Topic Needs" : "Topics Need"} Attention
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            These topics are currently marked as Weak or Needs Revision. Focus on these during your next study sessions.
          </p>
        </div>
      )}

      {/* 4 Confidence Buckets Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Strong */}
        <div className="rounded-lg border border-border/80 bg-muted/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Strong
            </span>
            <Badge variant="success" size="sm">
              {strong.length}
            </Badge>
          </div>

          <div className="space-y-1.5 text-xs">
            {strong.length === 0 ? (
              <p className="text-muted-foreground/70 italic text-[11px]">No topics rated strong yet</p>
            ) : (
              strong.slice(0, 4).map((t) => (
                <div key={t.id} className="truncate text-foreground font-medium" title={t.name}>
                  &bull; {t.name}
                </div>
              ))
            )}
            {strong.length > 4 && (
              <span className="text-[10px] text-muted-foreground">+{strong.length - 4} more</span>
            )}
          </div>
        </div>

        {/* Needs Revision */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
              Needs Revision
            </span>
            <Badge variant="warning" size="sm">
              {needsRevision.length}
            </Badge>
          </div>

          <div className="space-y-1.5 text-xs">
            {needsRevision.length === 0 ? (
              <p className="text-muted-foreground/70 italic text-[11px]">No topics needing revision</p>
            ) : (
              needsRevision.slice(0, 4).map((t) => (
                <div key={t.id} className="truncate text-foreground font-medium" title={t.name}>
                  &bull; {t.name}
                </div>
              ))
            )}
            {needsRevision.length > 4 && (
              <span className="text-[10px] text-muted-foreground">
                +{needsRevision.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Weak */}
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400">
              <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
              Weak
            </span>
            <Badge variant="destructive" size="sm">
              {weak.length}
            </Badge>
          </div>

          <div className="space-y-1.5 text-xs">
            {weak.length === 0 ? (
              <p className="text-muted-foreground/70 italic text-[11px]">No weak topics identified</p>
            ) : (
              weak.slice(0, 4).map((t) => (
                <div key={t.id} className="truncate text-foreground font-medium" title={t.name}>
                  &bull; {t.name}
                </div>
              ))
            )}
            {weak.length > 4 && (
              <span className="text-[10px] text-muted-foreground">+{weak.length - 4} more</span>
            )}
          </div>
        </div>

        {/* Not Rated */}
        <div className="rounded-lg border border-border/80 bg-muted/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Not Rated</span>
            <Badge variant="secondary" size="sm">
              {notRated.length}
            </Badge>
          </div>

          <div className="space-y-1.5 text-xs">
            {notRated.length === 0 ? (
              <p className="text-muted-foreground/70 italic text-[11px]">All topics have been rated</p>
            ) : (
              notRated.slice(0, 4).map((t) => (
                <div key={t.id} className="truncate text-muted-foreground font-medium" title={t.name}>
                  &bull; {t.name}
                </div>
              ))
            )}
            {notRated.length > 4 && (
              <span className="text-[10px] text-muted-foreground">+{notRated.length - 4} more</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfidenceInsights
