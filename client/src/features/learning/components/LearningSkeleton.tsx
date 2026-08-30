import * as React from "react"
import { Skeleton } from "@/components/ui"

export const LearningSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in-0" aria-label="Loading learning workspace">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Side Skeleton (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <Skeleton className="h-28 w-full rounded-lg" />
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        </div>

        {/* Right Side Skeleton (7 cols) */}
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-3 w-full" />
          </div>
          <Skeleton className="h-2.5 w-full rounded-full" />
          <Skeleton className="h-12 w-full rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearningSkeleton
