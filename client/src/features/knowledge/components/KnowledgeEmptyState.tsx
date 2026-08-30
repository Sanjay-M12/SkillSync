import * as React from "react"
import { EmptyState, Button } from "@/components/ui"
import { Brain, Upload } from "lucide-react"

export interface KnowledgeEmptyStateProps {
  onUploadClick: () => void
  className?: string
}

export const KnowledgeEmptyState: React.FC<KnowledgeEmptyStateProps> = ({
  onUploadClick,
  className,
}) => {
  return (
    <EmptyState
      icon={
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Brain className="h-6 w-6" aria-hidden="true" />
        </div>
      }
      title="No learning materials yet"
      description="Upload your notes, PDFs, and learning resources to build your personal knowledge base. In future phases, SkillSync AI will index these for grounded learning assistance."
      action={
        <Button
          onClick={onUploadClick}
          leftIcon={<Upload className="h-4 w-4" aria-hidden="true" />}
          size="sm"
        >
          Upload Material
        </Button>
      }
      className={className}
    />
  )
}

export default KnowledgeEmptyState
