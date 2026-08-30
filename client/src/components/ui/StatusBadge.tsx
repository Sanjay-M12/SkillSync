import * as React from "react"
import { Badge } from "./Badge"
import type { EntityProgressStatus, ConfidenceLevel, GoalStatus } from "@/types"

// Status Badge for Skills and Topics
export interface ProgressStatusBadgeProps {
  status: EntityProgressStatus
  className?: string
}

export const ProgressStatusBadge: React.FC<ProgressStatusBadgeProps> = ({ status, className }) => {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge variant="success" dot className={className}>
          Completed
        </Badge>
      )
    case "IN_PROGRESS":
      return (
        <Badge variant="warning" dot className={className}>
          In Progress
        </Badge>
      )
    case "NOT_STARTED":
    default:
      return (
        <Badge variant="muted" dot className={className}>
          Not Started
        </Badge>
      )
  }
}

// Confidence Badge for Topics
export interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel
  className?: string
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence, className }) => {
  switch (confidence) {
    case "STRONG":
      return (
        <Badge variant="success" dot className={className}>
          Strong
        </Badge>
      )
    case "NEEDS_REVISION":
      return (
        <Badge variant="warning" dot className={className}>
          Needs Revision
        </Badge>
      )
    case "WEAK":
      return (
        <Badge variant="destructive" dot className={className}>
          Weak
        </Badge>
      )
    case "NOT_RATED":
    default:
      return (
        <Badge variant="muted" className={className}>
          Not Rated
        </Badge>
      )
  }
}

// Goal Status Badge
export interface GoalStatusBadgeProps {
  status: GoalStatus
  className?: string
}

export const GoalStatusBadge: React.FC<GoalStatusBadgeProps> = ({ status, className }) => {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="default" dot className={className}>
          Active Goal
        </Badge>
      )
    case "COMPLETED":
      return (
        <Badge variant="success" dot className={className}>
          Completed
        </Badge>
      )
    case "ARCHIVED":
    default:
      return (
        <Badge variant="muted" className={className}>
          Archived
        </Badge>
      )
  }
}
