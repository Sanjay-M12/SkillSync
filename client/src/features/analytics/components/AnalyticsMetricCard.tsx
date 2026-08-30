import * as React from "react"
import { cn } from "@/lib/utils"

export interface AnalyticsMetricCardProps {
  label: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  iconColor?: string
  className?: string
}

export const AnalyticsMetricCard: React.FC<AnalyticsMetricCardProps> = ({
  label,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary bg-primary/10",
  className,
}) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-xs space-y-3 flex flex-col justify-between transition-colors",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {value}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  )
}

export default AnalyticsMetricCard
