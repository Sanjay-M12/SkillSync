import * as React from "react"
import { ConfirmDialog } from "@/components/ui"
import type { DeleteItemTarget } from "../learning.types"

export interface DeleteLearningItemDialogProps {
  target: DeleteItemTarget | null
  onClose: () => void
  onConfirm: () => void
}

export const DeleteLearningItemDialog: React.FC<DeleteLearningItemDialogProps> = ({
  target,
  onClose,
  onConfirm,
}) => {
  if (!target) return null

  let title = "Confirm Deletion"
  let description = "Are you sure you want to delete this item? This action cannot be undone."

  if (target.type === "SKILL") {
    title = `Delete Skill "${target.name}"?`
    description = `This will permanently remove "${target.name}" along with all of its nested topics and tasks. This action cannot be undone.`
  } else if (target.type === "TOPIC") {
    title = `Delete Topic "${target.name}"?`
    description = `This will permanently remove "${target.name}" and its associated learning tasks. This action cannot be undone.`
  } else if (target.type === "TASK") {
    title = `Delete Task "${target.name}"?`
    description = `Are you sure you want to delete this task from your learning path?`
  }

  return (
    <ConfirmDialog
      isOpen={Boolean(target)}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmLabel="Delete Item"
      cancelLabel="Cancel"
      variant="destructive"
    />
  )
}

export default DeleteLearningItemDialog
