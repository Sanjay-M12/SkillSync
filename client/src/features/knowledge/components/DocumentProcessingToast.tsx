import * as React from "react"
import { Loader2, CheckCircle2, AlertCircle, X, Sparkles, BookOpen } from "lucide-react"
import { Button } from "@/components/ui"
import type { KnowledgeDocument } from "../knowledge.types"
import { cn } from "@/lib/utils"

export type ToastStatus = "UPLOADING" | "PROCESSING" | "READY" | "FAILED"

export interface DocumentToastItem {
  id: string
  docId: string
  docTitle: string
  status: ToastStatus
  message?: string
  totalChunks?: number
  pageCount?: number | null
  document?: KnowledgeDocument
}

export interface DocumentProcessingToastProps {
  toast: DocumentToastItem | null
  onDismiss: () => void
  onOpenTools?: (doc: KnowledgeDocument) => void
  onAskAi?: (doc: KnowledgeDocument) => void
}

export const DocumentProcessingToast: React.FC<DocumentProcessingToastProps> = ({
  toast,
  onDismiss,
  onOpenTools,
  onAskAi,
}) => {
  if (!toast) return null

  const isProcessing = toast.status === "UPLOADING" || toast.status === "PROCESSING"
  const isReady = toast.status === "READY"
  const isFailed = toast.status === "FAILED"

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-card/95 p-4 shadow-2xl backdrop-blur-md transition-all",
          isProcessing && "border-amber-500/30 shadow-amber-500/10",
          isReady && "border-emerald-500/30 shadow-emerald-500/15 ring-1 ring-emerald-500/20",
          isFailed && "border-destructive/30 shadow-destructive/10"
        )}
      >
        {/* Top Progress bar indicator for processing */}
        {isProcessing && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500/20 overflow-hidden">
            <div className="h-full w-1/3 bg-amber-500 animate-[indeterminate_1.5s_infinite_linear]" />
          </div>
        )}

        {isReady && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
        )}

        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              isProcessing && "bg-amber-500/10 text-amber-500",
              isReady && "bg-emerald-500/10 text-emerald-500",
              isFailed && "bg-destructive/10 text-destructive"
            )}
          >
            {isProcessing && <Loader2 className="h-5 w-5 animate-spin" />}
            {isReady && <CheckCircle2 className="h-5 w-5 animate-in zoom-in-50" />}
            {isFailed && <AlertCircle className="h-5 w-5" />}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  isProcessing && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                  isReady && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                  isFailed && "bg-destructive/15 text-destructive"
                )}
              >
                {isProcessing ? "Uploading & Indexing" : isReady ? "Ready to Use" : "Processing Failed"}
              </span>
            </div>

            <p className="mt-1 text-xs font-bold text-foreground truncate">
              {toast.docTitle}
            </p>

            <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
              {isProcessing && (
                toast.message || "Extracting text, analyzing structure, and generating semantic chunks..."
              )}
              {isReady && (
                toast.message || "Document is fully processed! AI Study Tools and Chat are now ready."
              )}
              {isFailed && (
                toast.message || "Failed to parse document. Please check the file format and try again."
              )}
            </p>

            {/* Quick Action buttons on Ready */}
            {isReady && toast.document && (
              <div className="mt-3 flex items-center gap-2 pt-1 border-t border-border/40">
                {onOpenTools && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onOpenTools(toast.document!)
                      onDismiss()
                    }}
                    leftIcon={<BookOpen className="h-3.5 w-3.5" />}
                    className="h-7 text-[11px] px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Study Tools
                  </Button>
                )}
                {onAskAi && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onAskAi(toast.document!)
                      onDismiss()
                    }}
                    leftIcon={<Sparkles className="h-3.5 w-3.5 text-amber-500" />}
                    className="h-7 text-[11px] px-2.5"
                  >
                    Ask AI
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default DocumentProcessingToast
