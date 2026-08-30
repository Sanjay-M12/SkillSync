import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  size?: "sm" | "default" | "md" | "lg"
  showLabel?: boolean
  label?: string
  colorVariant?: "primary" | "success" | "warning" | "destructive"
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  size = "default",
  showLabel = false,
  label,
  colorVariant = "primary",
  className,
  ...props
}) => {
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)))

  const heightClasses = {
    sm: "h-1.5",
    default: "h-2",
    md: "h-2",
    lg: "h-3",
  }

  const fillColors = {
    primary: "bg-primary",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    destructive: "bg-rose-500",
  }

  return (
    <div className={cn("w-full space-y-1.5", className)} {...props}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">{label}</span>
          {showLabel && <span className="font-semibold text-muted-foreground">{clampedValue}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          "w-full overflow-hidden rounded-full bg-muted transition-all",
          heightClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            fillColors[colorVariant]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}
