import * as React from "react"
import { Card } from "@/components/ui"
import {
  FileText,
  FileCode,
  FileType,
  Sparkles,
  Trash2,
  Layers,
  Calendar,
  HardDrive,
  BookOpen,
} from "lucide-react"
import { DocumentStatusBadge } from "./DocumentStatusBadge"
import type { KnowledgeDocument, DocumentType } from "../knowledge.types"
import { cn } from "@/lib/utils"

export interface DocumentCardProps {
  document: KnowledgeDocument
  onAskAi?: (document: KnowledgeDocument) => void
  onOpenTools?: (document: KnowledgeDocument) => void
  onDelete?: (document: KnowledgeDocument) => void
  className?: string
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  } catch {
    return dateStr
  }
}

function getFileIcon(type: DocumentType) {
  switch (type) {
    case "PDF":
      return {
        icon: FileText,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
      }
    case "MD":
      return {
        icon: FileCode,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
      }
    case "TXT":
    default:
      return {
        icon: FileType,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      }
  }
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onAskAi,
  onOpenTools,
  onDelete,
  className,
}) => {
  const { icon: Icon, color, bg } = getFileIcon(document.fileType)
  const isReady = document.status === "READY"

  return (
    <Card
      hover
      className={cn(
        "flex flex-col justify-between p-4 sm:p-5 transition-all duration-150 group",
        className
      )}
    >
      <div>
        {/* Top bar: Icon, Document Title, and Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-semibold",
                bg,
                color
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors"
                title={document.title || document.originalName}
              >
                {document.title || document.originalName}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {document.fileType}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  {formatBytes(document.fileSize)}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(document.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <DocumentStatusBadge status={document.status} />
        </div>

        {/* Chunks & Progress indicator */}
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium">
            <Layers className="h-3.5 w-3.5 text-primary/70" />
            <span>
              {document.totalChunks > 0
                ? `${document.totalChunks} semantic chunks`
                : document.status === "PROCESSING"
                ? "Indexing chunks..."
                : "0 chunks"}
            </span>
          </div>

          {document.pageCount && document.pageCount > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {document.pageCount} {document.pageCount === 1 ? "page" : "pages"}
            </span>
          )}
        </div>

        {/* Error message if failed */}
        {document.status === "FAILED" && document.errorMessage && (
          <p className="mt-2 rounded bg-destructive/10 px-2 py-1 text-[11px] text-destructive">
            {document.errorMessage}
          </p>
        )}
      </div>

      {/* Action footer */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
        <div className="flex items-center gap-2">
          {/* Study Tools button */}
          <button
            type="button"
            onClick={() => onOpenTools?.(document)}
            disabled={!isReady}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
              isReady
                ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
                : "cursor-not-allowed text-muted-foreground/60 bg-muted/40"
            )}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Study Tools</span>
          </button>

          {/* Ask AI button */}
          <button
            type="button"
            onClick={() => onAskAi?.(document)}
            disabled={!isReady}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              isReady
                ? "bg-primary/10 text-primary hover:bg-primary/20 active:scale-[0.98]"
                : "cursor-not-allowed text-muted-foreground/60 bg-muted/40"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ask AI</span>
          </button>
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(document)}
            title="Delete document"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label={`Delete ${document.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </Card>
  )
}

export default DocumentCard
