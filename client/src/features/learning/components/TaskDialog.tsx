import * as React from "react"
import { Button, FormField, Input } from "@/components/ui"
import { X, CheckSquare } from "lucide-react"
import type { WorkspaceTask } from "../learning.types"

export interface TaskDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: { title: string; estimatedMinutes?: number }) => void
  editingTask?: WorkspaceTask | null
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTask,
}) => {
  const [title, setTitle] = React.useState("")
  const [estimatedMinutes, setEstimatedMinutes] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setEstimatedMinutes(
        editingTask.estimatedMinutes ? String(editingTask.estimatedMinutes) : ""
      )
    } else {
      setTitle("")
      setEstimatedMinutes("30")
    }
    setError(null)
  }, [editingTask, isOpen])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setError("Task title is required")
      return
    }
    if (trimmed.length < 2) {
      setError("Task title must be at least 2 characters")
      return
    }

    const minutesNum = estimatedMinutes ? parseInt(estimatedMinutes, 10) : undefined

    onSave({
      title: trimmed,
      estimatedMinutes: minutesNum && !isNaN(minutesNum) ? minutesNum : undefined,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 border-b border-border/80 pb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CheckSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {editingTask ? "Edit Learning Task" : "Add Actionable Task"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Break down this topic into concrete, trackable steps.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <FormField label="Task Title" htmlFor="task-title" required error={error || undefined}>
            <Input
              id="task-title"
              placeholder="e.g. Build custom useLocalStorage hook"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setError(null)
              }}
              autoFocus
            />
          </FormField>

          <FormField
            label="Estimated Time (Minutes)"
            htmlFor="task-est"
            helperText="Typical study session duration for this specific task."
          >
            <Input
              id="task-est"
              type="number"
              min={5}
              max={300}
              step={5}
              placeholder="30"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
            />
          </FormField>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {editingTask ? "Save Task" : "Add Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskDialog
