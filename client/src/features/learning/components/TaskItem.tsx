import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Check, Clock, Edit2, Trash2, Timer } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WorkspaceTask } from "../learning.types"

export interface TaskItemProps {
  task: WorkspaceTask
  onToggleComplete: (taskId: string, completed: boolean) => void
  onEditTask: (task: WorkspaceTask) => void
  onDeleteTask: (task: WorkspaceTask) => void
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}) => {
  const navigate = useNavigate()

  return (
    <div
      className={cn(
        "group flex items-center justify-between rounded-lg border p-2.5 sm:p-3 transition-all",
        task.completed
          ? "border-border/50 bg-muted/20"
          : "border-border bg-card hover:border-border/80 shadow-2xs"
      )}
    >
      {/* Checkbox and Title */}
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <button
          type="button"
          onClick={() => onToggleComplete(task.id, !task.completed)}
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            task.completed
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-background hover:border-primary"
          )}
          aria-label={task.completed ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as complete`}
        >
          {task.completed && <Check className="h-3 w-3 stroke-[3]" />}
        </button>

        <span
          className={cn(
            "text-xs sm:text-sm font-medium transition-colors break-words",
            task.completed ? "text-muted-foreground line-through" : "text-foreground"
          )}
        >
          {task.title}
        </span>
      </div>

      {/* Meta & Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {task.estimatedMinutes && (
          <span className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
            <Clock className="h-3 w-3" />
            <span>{task.estimatedMinutes}m</span>
          </span>
        )}

        <div className="flex items-center gap-0.5 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {!task.completed && (
            <button
              type="button"
              title="Start Pomodoro Focus on this task"
              onClick={() => navigate(`/focus?taskId=${task.id}`)}
              className="rounded p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors focus:opacity-100 focus:outline-none"
              aria-label={`Start Pomodoro on ${task.title}`}
            >
              <Timer className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onEditTask(task)}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:opacity-100 focus:outline-none"
            aria-label={`Edit task ${task.title}`}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteTask(task)}
            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors focus:opacity-100 focus:outline-none"
            aria-label={`Delete task ${task.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskItem
