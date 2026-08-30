import * as React from "react"
import { Skeleton } from "@/components/ui"

export const AnalyticsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in-0" aria-label="Loading analytics insights">
      {/* Overview Skeleton */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* 3 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>

      {/* Weekly Activity Skeleton */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-32 w-full rounded-md" />
      </div>

      {/* Skill Progress Skeleton */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-48" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default AnalyticsSkeleton
