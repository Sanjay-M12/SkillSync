import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageHeaderProps {
  title: string
  description?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border/70 pb-4 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground sm:text-sm max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 pt-1 md:pt-0">{actions}</div>}
    </div>
  )
}

export default PageHeader
