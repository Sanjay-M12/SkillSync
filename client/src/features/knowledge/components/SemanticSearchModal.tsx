import * as React from "react"
import { Button } from "@/components/ui"
import {
  Search,
  FileText,
  FileCode,
  FileType,
  Sparkles,
  AlertCircle,
  BookOpen,
  X,
} from "lucide-react"
import { ragApi, RetrievedChunk, RetrievalResult } from "@/services/rag.api"
import type { KnowledgeDocument, DocumentType } from "../knowledge.types"
import { cn } from "@/lib/utils"

export interface SemanticSearchModalProps {
  isOpen: boolean
  onClose: () => void
  documents: KnowledgeDocument[]
  initialDocumentId?: string
}

function getFileIcon(type: DocumentType) {
  switch (type) {
    case "PDF":
      return <FileText className="h-4 w-4 text-rose-500" />
    case "MD":
      return <FileCode className="h-4 w-4 text-purple-500" />
    case "TXT":
    default:
      return <FileType className="h-4 w-4 text-blue-500" />
  }
}

export const SemanticSearchModal: React.FC<SemanticSearchModalProps> = ({
  isOpen,
  onClose,
  documents,
  initialDocumentId,
}) => {
  const [query, setQuery] = React.useState("")
  const [selectedDocId, setSelectedDocId] = React.useState<string>(initialDocumentId || "")
  const [isLoading, setIsLoading] = React.useState(false)
  const [result, setResult] = React.useState<RetrievalResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (initialDocumentId) {
      setSelectedDocId(initialDocumentId)
    }
  }, [initialDocumentId])

  // Escape key handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isLoading, onClose])

  // Body scroll lock
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const readyDocuments = React.useMemo(
    () => documents.filter((d) => d.status === "READY"),
    [documents]
  )

  if (!isOpen) return null

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const clean = query.trim()
    if (!clean) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await ragApi.search({
        query: clean,
        documentId: selectedDocId || undefined,
        topK: 5,
      })
      setResult(data)
    } catch (err: any) {
      setError(err.message || "Failed to retrieve knowledge chunks.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setQuery("")
    setResult(null)
    setError(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in-0"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-dialog-title"
        className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="space-y-0.5">
            <h2 id="search-dialog-title" className="text-base font-bold text-foreground sm:text-lg">
              Semantic Knowledge Retrieval
            </h2>
            <p className="text-xs text-muted-foreground">
              Search across your indexed learning materials using vector similarity.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a concept, e.g. What are React Hooks?..."
                  className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  autoFocus
                />
              </div>

              {/* Document Scope Selector */}
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-48"
              >
                <option value="">All Indexed Materials</option>
                {readyDocuments.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title.length > 22 ? `${doc.title.slice(0, 22)}...` : doc.title}
                  </option>
                ))}
              </select>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || !query.trim()}
                isLoading={isLoading}
                className="h-10 shrink-0"
              >
                Retrieve
              </Button>
            </div>
          </form>

          {/* Informational Sub-Banner */}
          <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>
              Retrieval Layer: Demonstrates semantic vector matching. Grounded LLM response generation will be connected in Phase 9.
            </span>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Container */}
          {isLoading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl border border-border/60 bg-muted/20 animate-pulse p-4"
                />
              ))}
            </div>
          ) : result ? (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Found <strong>{result.totalRetrieved}</strong> relevant excerpt(s) in {result.executionTimeMs}ms
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Clear Search
                </button>
              </div>

              {result.results.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border py-8 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-medium text-foreground">No matching excerpts found</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    No excerpts in your materials met the relevance threshold for this query. Try rephrasing or selecting another document.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.results.map((item: RetrievedChunk) => {
                    const matchPercent = Math.round(item.score * 100)
                    return (
                      <div
                        key={item.chunkId}
                        className="rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/40 space-y-2.5"
                      >
                        {/* Top Excerpt Header */}
                        <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {getFileIcon(item.source.documentType)}
                            <span
                              className="text-xs font-semibold text-foreground truncate"
                              title={item.source.documentName}
                            >
                              {item.source.documentName}
                            </span>
                            {item.source.pageNumber && (
                              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                Page {item.source.pageNumber}
                              </span>
                            )}
                            {item.source.heading && (
                              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary truncate max-w-[140px]">
                                {item.source.heading}
                              </span>
                            )}
                          </div>

                          {/* Relevance Score Badge */}
                          <div
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-tight shrink-0",
                              matchPercent >= 70
                                ? "bg-emerald-500/10 text-emerald-500"
                                : matchPercent >= 45
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {matchPercent}% match
                          </div>
                        </div>

                        {/* Content Excerpt */}
                        <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line font-sans bg-muted/10 p-2.5 rounded-lg border border-border/30">
                          {item.content}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-border/60 pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SemanticSearchModal
