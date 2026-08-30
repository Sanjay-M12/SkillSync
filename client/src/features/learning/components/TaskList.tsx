import * as React from "react"
import { Button } from "@/components/ui"
import { Plus, CheckSquare } from "lucide-react"
import { TaskItem } from "./TaskItem"
import type { WorkspaceTask } from "../learning.types"

export interface TaskListProps {
  tasks: WorkspaceTask[]
  onToggleComplete: (taskId: string, completed: boolean) => void
  onAddTask: () => void
  onEditTask: (task: WorkspaceTask) => void
  onDeleteTask: (task: WorkspaceTask) => void
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) => {
  const completedCount = tasks.filter((t) => t.completed).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-primary" />
          <h3 className="text-xs sm:text-sm font-bold text-foreground">
            Actionable Tasks{" "}
            {tasks.length > 0 && (
              <span className="text-muted-foreground font-normal">
                ({completedCount}/{tasks.length} Completed)
              </span>
            )}
          </h3>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddTask}
          leftIcon={<Plus className="h-3.5 w-3.5" />}
        >
          Add Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground space-y-2">
          <p>No tasks yet in this topic.</p>
          <Button size="sm" onClick={onAddTask} leftIcon={<Plus className="h-3.5 w-3.5" />}>
            Add First Task
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TaskList
