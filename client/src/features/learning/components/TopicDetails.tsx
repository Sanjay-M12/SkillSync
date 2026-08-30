import * as React from "react"
import { ProgressBar, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui"
import { AlertCircle, BookOpen, Clock } from "lucide-react"
import { ConfidenceSelector } from "./ConfidenceSelector"
import { TaskList } from "./TaskList"
import type { WorkspaceSkill, WorkspaceTopic, WorkspaceTask } from "../learning.types"
import type { ConfidenceLevel } from "@/types"

export interface TopicDetailsProps {
  topic: WorkspaceTopic | null
  parentSkill: WorkspaceSkill | null
  onToggleTaskComplete: (taskId: string, completed: boolean) => void
  onChangeConfidence: (confidence: ConfidenceLevel) => void
  onAddTask: () => void
  onEditTask: (task: WorkspaceTask) => void
  onDeleteTask: (task: WorkspaceTask) => void
}

export const TopicDetails: React.FC<TopicDetailsProps> = ({
  topic,
  parentSkill,
  onToggleTaskComplete,
  onChangeConfidence,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) => {
  if (!topic) {
    return (
      <Card className="flex h-full min-h-[300px] flex-col items-center justify-center p-8 text-center text-xs text-muted-foreground border-dashed">
        <BookOpen className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="font-semibold text-foreground text-sm">No Topic Selected</p>
        <p className="max-w-xs mt-1 text-muted-foreground">
          Select a topic from the learning hierarchy on the left to view tasks and track mastery.
        </p>
      </Card>
    )
  }

  const needsAttention = topic.confidence === "WEAK" || topic.confidence === "NEEDS_REVISION"
  const totalEstimatedMinutes = topic.tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0)

  return (
    <Card className="space-y-4">
      {/* Header Info */}
      <CardHeader className="pb-3 border-b border-border/80">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {parentSkill && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {parentSkill.name} &rsaquo; Topic
              </span>
            )}
            <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {topic.name}
            </CardTitle>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
            {needsAttention && (
              <Badge variant="warning" dot size="sm">
                <AlertCircle className="h-3 w-3 mr-1" />
                Needs attention
              </Badge>
            )}
            {totalEstimatedMinutes > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md font-medium">
                <Clock className="h-3 w-3" />
                <span>{totalEstimatedMinutes}m</span>
              </span>
            )}
          </div>
        </div>

        {topic.description && (
          <p className="text-xs text-muted-foreground leading-relaxed pt-1">
            {topic.description}
          </p>
        )}

        {/* Topic Progress Bar */}
        <div className="space-y-1 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-foreground">Topic Progress</span>
            <span className="text-primary">{topic.progress || 0}%</span>
          </div>
          <ProgressBar value={topic.progress || 0} size="sm" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Confidence Rating Bar */}
        <div className="border-b border-border/70 pb-4">
          <ConfidenceSelector
            confidence={topic.confidence}
            onChange={onChangeConfidence}
          />
        </div>

        {/* Actionable Task List */}
        <TaskList
          tasks={topic.tasks}
          onToggleComplete={onToggleTaskComplete}
          onAddTask={onAddTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      </CardContent>
    </Card>
  )
}

export default TopicDetails
