import * as React from "react"
import { ConfirmDialog } from "@/components/ui"

export interface ResetDemoDataDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ResetDemoDataDialog: React.FC<ResetDemoDataDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Reset demo data?"
      description="Your current frontend learning changes will be replaced with the original demo data. This action cannot be undone in the current session."
      confirmLabel="Reset Data"
      cancelLabel="Cancel"
      variant="destructive"
    />
  )
}

export default ResetDemoDataDialog
