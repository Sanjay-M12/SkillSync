import * as React from "react"
import { Button, FormField, Input, Textarea } from "@/components/ui"
import { X, Layers } from "lucide-react"
import type { WorkspaceSkill } from "../learning.types"

export interface SkillDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (skillData: { name: string; description?: string }) => void
  editingSkill?: WorkspaceSkill | null
}

export const SkillDialog: React.FC<SkillDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSkill,
}) => {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (editingSkill) {
      setName(editingSkill.name)
      setDescription(editingSkill.description || "")
    } else {
      setName("")
      setDescription("")
    }
    setError(null)
  }, [editingSkill, isOpen])

  // Escape key handler
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
      setError("Skill name is required")
      return
    }
    if (trimmed.length < 2) {
      setError("Skill name must be at least 2 characters")
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {editingSkill ? "Edit Skill" : "Create New Skill"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {editingSkill
                ? "Update your skill name and details"
                : "Add a main skill area to your learning journey"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <FormField label="Skill Name" htmlFor="skill-name" required error={error || undefined}>
            <Input
              id="skill-name"
              placeholder="e.g. React Framework, Node.js Backend"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              autoFocus
            />
          </FormField>

          <FormField label="Description (Optional)" htmlFor="skill-desc">
            <Textarea
              id="skill-desc"
              placeholder="Brief description of what this skill encompasses..."
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
              {editingSkill ? "Save Changes" : "Create Skill"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SkillDialog
