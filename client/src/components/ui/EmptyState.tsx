import * as React from "react"
import { Inbox } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  secondaryAction?: React.ReactNode
  className?: string
  compact?: boolean
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  compact = false,
}) => {
  const renderIcon = () => {
    if (!icon) {
      return <Inbox className="h-6 w-6 text-muted-foreground" />
    }
    if (React.isValidElement(icon)) {
      return icon
    }
    // If it's a component (function component or forwardRef object like Lucide icons)
    const IconComponent = icon as React.ComponentType<{ className?: string }>
    return <IconComponent className="h-6 w-6 text-muted-foreground" />
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-lg border border-dashed border-border bg-card/50",
        compact ? "p-6" : "p-10 md:p-12",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/80 text-muted-foreground ring-8 ring-muted/30">
        {renderIcon()}
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}
