import * as React from "react"
import { Link } from "react-router-dom"
import { Button, ConfidenceBadge, Card, CardHeader, CardContent, CardFooter } from "@/components/ui"
import { AlertCircle, ArrowRight, RotateCcw } from "lucide-react"
import type { RevisionTopicItem } from "../dashboard.types"

export interface RevisionReminderProps {
  revisionQueue: RevisionTopicItem[]
}

export const RevisionReminder: React.FC<RevisionReminderProps> = ({ revisionQueue }) => {
  if (!revisionQueue || revisionQueue.length === 0) {
    return null
  }

  return (
    <Card className="flex flex-col justify-between border-amber-500/30">
      <CardHeader className="pb-3">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <RotateCcw className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Revision Queue
            </span>
          </div>

          <span className="text-xs font-semibold text-muted-foreground">
            {revisionQueue.length} {revisionQueue.length === 1 ? "topic" : "topics"}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
          {revisionQueue.length} {revisionQueue.length === 1 ? "topic needs" : "topics need"} review
          to reinforce memory:
        </p>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Revision Topics List */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {revisionQueue.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <div className="truncate font-medium text-foreground">
                  <span className="text-muted-foreground text-[11px]">{item.skillTitle} &rsaquo; </span>
                  {item.topicTitle}
                </div>
              </div>
              <ConfidenceBadge confidence={item.confidence} className="text-[10px] shrink-0 ml-2" />
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <Link to="/learning" className="w-full">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center border-amber-500/30 hover:bg-amber-500/10 text-amber-800 dark:text-amber-300"
            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
          >
            Review Topics
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default RevisionReminder
