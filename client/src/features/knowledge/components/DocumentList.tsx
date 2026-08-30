import * as React from "react"
import { Search, Filter, X } from "lucide-react"
import { DocumentCard } from "./DocumentCard"
import { KnowledgeEmptyState } from "./KnowledgeEmptyState"
import type { KnowledgeDocument, DocumentFilterOptions, DocumentType, DocumentStatus } from "../knowledge.types"

export interface DocumentListProps {
  documents: KnowledgeDocument[]
  onUploadClick: () => void
  onAskAi?: (document: KnowledgeDocument) => void
  onOpenTools?: (document: KnowledgeDocument) => void
  onDelete?: (document: KnowledgeDocument) => void
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onUploadClick,
  onAskAi,
  onOpenTools,
  onDelete,
}) => {
  const [filters, setFilters] = React.useState<DocumentFilterOptions>({
    searchQuery: "",
    fileTypeFilter: "ALL",
    statusFilter: "ALL",
  })

  const hasActiveFilters =
    filters.searchQuery !== "" ||
    filters.fileTypeFilter !== "ALL" ||
    filters.statusFilter !== "ALL"

  const filteredDocuments = React.useMemo(() => {
    return documents.filter((doc) => {
      // Search matching title or filename
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim()
        const matchesTitle = doc.title.toLowerCase().includes(q)
        const matchesName = doc.originalName.toLowerCase().includes(q)
        if (!matchesTitle && !matchesName) return false
      }

      // File type filter
      if (filters.fileTypeFilter !== "ALL" && doc.fileType !== filters.fileTypeFilter) {
        return false
      }

      // Status filter
      if (filters.statusFilter !== "ALL" && doc.status !== filters.statusFilter) {
        return false
      }

      return true
    })
  }, [documents, filters])

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      fileTypeFilter: "ALL",
      statusFilter: "ALL",
    })
  }

  // If initial knowledge base is completely empty
  if (documents.length === 0) {
    return <KnowledgeEmptyState onUploadClick={onUploadClick} />
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search materials by title or filename..."
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            aria-label="Search materials"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: "" }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter selectors */}
        <div className="flex items-center gap-2">
          {/* File Type Filter */}
          <div className="relative">
            <select
              value={filters.fileTypeFilter}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  fileTypeFilter: e.target.value as "ALL" | DocumentType,
                }))
              }
              aria-label="Filter by file type"
              className="h-9 rounded-lg border border-input bg-background px-3 pr-8 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer appearance-none"
            >
              <option value="ALL">All Types</option>
              <option value="PDF">PDF Documents</option>
              <option value="MD">Markdown Notes</option>
              <option value="TXT">Text Files</option>
            </select>
            <Filter className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filters.statusFilter}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  statusFilter: e.target.value as "ALL" | DocumentStatus,
                }))
              }
              aria-label="Filter by status"
              className="h-9 rounded-lg border border-input bg-background px-3 pr-8 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer appearance-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="READY">Ready</option>
              <option value="PROCESSING">Processing</option>
              <option value="UPLOADED">Uploaded</option>
              <option value="FAILED">Failed</option>
            </select>
            <Filter className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-9 rounded-lg px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors inline-flex items-center gap-1"
              title="Reset all filters"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtered Results Count */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing {filteredDocuments.length} of {documents.length} materials
        </span>
      </div>

      {/* Document Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onAskAi={onAskAi}
              onOpenTools={onOpenTools}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center">
          <p className="text-sm font-semibold text-foreground">No matching materials found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search query or filter settings.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 text-xs font-semibold text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}

export default DocumentList
