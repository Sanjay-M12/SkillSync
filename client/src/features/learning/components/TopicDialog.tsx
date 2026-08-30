import * as React from "react"
import { Button, FormField, Input, Textarea, Badge } from "@/components/ui"
import { X, BookOpen } from "lucide-react"
import type { WorkspaceSkill, WorkspaceTopic } from "../learning.types"

export interface TopicDialogProps {
  isOpen: boolean
  parentSkill: WorkspaceSkill | null
  onClose: () => void
  onSave: (topicData: { name: string; description?: string }) => void
  editingTopic?: WorkspaceTopic | null
}

export const TopicDialog: React.FC<TopicDialogProps> = ({
  isOpen,
  parentSkill,
  onClose,
  onSave,
  editingTopic,
}) => {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (editingTopic) {
      setName(editingTopic.name)
      setDescription(editingTopic.description || "")
    } else {
      setName("")
      setDescription("")
    }
    setError(null)
  }, [editingTopic, isOpen])

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
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Topic name is required")
      return
    }
    if (trimmed.length < 2) {
      setError("Topic name must be at least 2 characters")
      return
    }

    onSave({
      name: trimmed,
      description: description.trim() || undefined,
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {editingTopic ? "Edit Topic" : "Create New Topic"}
            </h3>
            {parentSkill && (
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[11px] text-muted-foreground">Parent Skill:</span>
                <Badge variant="secondary" size="sm">
                  {parentSkill.name}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <FormField label="Topic Name" htmlFor="topic-name" required error={error || undefined}>
            <Input
              id="topic-name"
              placeholder="e.g. Async JavaScript, React Hooks"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              autoFocus
            />
          </FormField>

          <FormField label="Description (Optional)" htmlFor="topic-desc">
            <Textarea
              id="topic-desc"
              placeholder="What core concepts are covered in this topic?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </FormField>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {editingTopic ? "Save Changes" : "Create Topic"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TopicDialog
