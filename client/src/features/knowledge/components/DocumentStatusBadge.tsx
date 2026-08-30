import * as React from "react"
import { Badge } from "@/components/ui"
import { CheckCircle2, Loader2, Clock, AlertCircle } from "lucide-react"
import type { DocumentStatus } from "../knowledge.types"
import { cn } from "@/lib/utils"

export interface DocumentStatusBadgeProps {
  status: DocumentStatus
  className?: string
  showIcon?: boolean
}

export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
}) => {
  switch (status) {
    case "READY":
      return (
        <Badge
          variant="success"
          className={cn("gap-1 font-medium text-[11px] select-none", className)}
        >
          {showIcon && <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />}
          <span>Ready</span>
        </Badge>
      )

    case "PROCESSING":
      return (
        <Badge
          variant="default"
          className={cn(
            "gap-1 font-medium text-[11px] bg-primary/15 text-primary border-primary/30 select-none",
            className
          )}
        >
          {showIcon && <Loader2 className="h-3 w-3 shrink-0 animate-spin" aria-hidden="true" />}
          <span>Processing</span>
        </Badge>
      )

    case "UPLOADED":
      return (
        <Badge
          variant="secondary"
          className={cn("gap-1 font-medium text-[11px] select-none", className)}
        >
          {showIcon && <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />}
          <span>Uploaded</span>
        </Badge>
      )

    case "FAILED":
      return (
        <Badge
          variant="destructive"
          className={cn("gap-1 font-medium text-[11px] select-none", className)}
        >
          {showIcon && <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />}
          <span>Failed</span>
        </Badge>
      )

    default:
      return (
        <Badge variant="muted" className={className}>
          Unknown
        </Badge>
      )
  }
}

export default DocumentStatusBadge
