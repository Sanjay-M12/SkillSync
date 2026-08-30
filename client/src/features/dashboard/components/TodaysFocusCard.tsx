import * as React from "react"
import { Link } from "react-router-dom"
import { Button, Badge, Card, CardHeader, CardContent, CardFooter } from "@/components/ui"
import { Play, Clock, CheckSquare } from "lucide-react"
import type { TodaysFocusItem } from "../dashboard.types"

export interface TodaysFocusCardProps {
  focus: TodaysFocusItem
}

export const TodaysFocusCard: React.FC<TodaysFocusCardProps> = ({ focus }) => {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="pb-3">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Next Priority Task
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{focus.estimatedMinutes} mins</span>
          </div>
        </div>

        {/* Skill & Topic Hierarchy Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant="secondary" size="sm">
            {focus.skillTitle}
          </Badge>
          <span className="text-xs text-muted-foreground">&rsaquo;</span>
          <span className="text-xs font-semibold text-foreground">{focus.topicTitle}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Actionable Next Task Container */}
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            <CheckSquare className="h-3 w-3" />
            <span>Task Title</span>
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
            {focus.taskTitle}
          </h3>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <Link to="/learning" className="w-full">
          <Button
            className="w-full"
            size="sm"
            leftIcon={<Play className="h-3.5 w-3.5 fill-current" />}
          >
            Start Task
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default TodaysFocusCard
