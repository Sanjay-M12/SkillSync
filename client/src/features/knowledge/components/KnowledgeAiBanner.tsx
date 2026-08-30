import * as React from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export interface KnowledgeAiBannerProps {
  className?: string
}

export const KnowledgeAiBanner: React.FC<KnowledgeAiBannerProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs text-muted-foreground",
        className
      )}
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
      </div>
      <p className="leading-normal">
        <strong className="font-semibold text-foreground">AI-Powered Grounding:</strong> Your
        uploaded learning materials will be processed into semantic chunks to answer questions, generate
        practice quizzes, and summarize key concepts based strictly on your source documents.
      </p>
    </div>
  )
}

export default KnowledgeAiBanner
