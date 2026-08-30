import * as React from "react"
import { Skeleton } from "@/components/ui"

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in-0" aria-label="Loading dashboard data">
      {/* Welcome Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Goal Overview Card Skeleton */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-56" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
        </div>

        <div className="flex justify-between border-t border-border pt-4">
          <Skeleton className="h-4 w-48 hidden sm:block" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>

      {/* 2-Column Focus & Revision Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </div>

      {/* Weekly Activity Skeleton */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <Skeleton className="h-28 w-full rounded-md" />
      </div>
    </div>
  )
}

export default DashboardSkeleton
