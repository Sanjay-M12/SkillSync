import * as React from "react"
import { PageContainer, PageHeader } from "@/components/layout"
import { Button, ConfirmDialog } from "@/components/ui"
import { Upload, Plus, RefreshCw, AlertCircle, Search, Sparkles } from "lucide-react"
import { documentsApi } from "@/services/documents.api"
import {
  KnowledgeStats,
  KnowledgeAiBanner,
  DocumentList,
  DocumentUploadModal,
  SemanticSearchModal,
  AiAssistantModal,
  AiLearningToolsModal,
  DocumentProcessingToast,
  type KnowledgeDocument,
  type KnowledgeStatsData,
  type DocumentToastItem,
} from "@/features/knowledge"

export const KnowledgePage: React.FC = () => {
  const [documents, setDocuments] = React.useState<KnowledgeDocument[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [fetchError, setFetchError] = React.useState<string | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false)
  const [isAssistantModalOpen, setIsAssistantModalOpen] = React.useState(false)
  const [assistantDocId, setAssistantDocId] = React.useState<string | undefined>(undefined)
  const [isToolsModalOpen, setIsToolsModalOpen] = React.useState(false)
  const [selectedToolsDoc, setSelectedToolsDoc] = React.useState<KnowledgeDocument | null>(null)
  const [docToDelete, setDocToDelete] = React.useState<KnowledgeDocument | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Notification Toast state
  const [processingToast, setProcessingToast] = React.useState<DocumentToastItem | null>(null)

  // Fetch real user documents from backend
  const loadDocuments = React.useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true)
    setFetchError(null)
    try {
      const data = await documentsApi.listDocuments()
      setDocuments(data)
      return data
    } catch (err: any) {
      if (!silent) setFetchError(err.message || "Unable to load knowledge base materials.")
      return null
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  // Real-time polling for in-flight document indexing (transitions from UPLOADED / PROCESSING -> READY)
  React.useEffect(() => {
    const hasInFlightDocs = documents.some(
      (d) => d.status === "UPLOADED" || d.status === "PROCESSING"
    )

    if (!hasInFlightDocs) return

    const pollInterval = setInterval(async () => {
      const updatedDocs = await loadDocuments(true)
      if (!updatedDocs) return

      // Check if any in-flight document has now become READY or FAILED
      for (const updatedDoc of updatedDocs) {
        const prevDoc = documents.find((d) => d.id === updatedDoc.id)
        if (prevDoc && (prevDoc.status === "UPLOADED" || prevDoc.status === "PROCESSING")) {
          if (updatedDoc.status === "READY") {
            setProcessingToast({
              id: `ready-${updatedDoc.id}-${Date.now()}`,
              docId: updatedDoc.id,
              docTitle: updatedDoc.title,
              status: "READY",
              message: `Indexed into ${updatedDoc.totalChunks} semantic chunks${updatedDoc.pageCount ? ` across ${updatedDoc.pageCount} pages` : ""}. Study Tools & Ask AI unlocked!`,
              totalChunks: updatedDoc.totalChunks,
              pageCount: updatedDoc.pageCount,
              document: updatedDoc,
            })
          } else if (updatedDoc.status === "FAILED") {
            setProcessingToast({
              id: `failed-${updatedDoc.id}-${Date.now()}`,
              docId: updatedDoc.id,
              docTitle: updatedDoc.title,
              status: "FAILED",
              message: updatedDoc.errorMessage || "Text extraction failed. Please try another file.",
              document: updatedDoc,
            })
          }
        }
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [documents, loadDocuments])

  // Compute real metrics from loaded documents
  const stats = React.useMemo<KnowledgeStatsData>(() => {
    const totalDocuments = documents.length
    const readyCount = documents.filter((d) => d.status === "READY").length
    const processingCount = documents.filter((d) => d.status === "PROCESSING").length
    const failedCount = documents.filter((d) => d.status === "FAILED").length
    const totalChunks = documents.reduce((sum, d) => sum + (d.totalChunks || 0), 0)

    return {
      totalDocuments,
      readyCount,
      processingCount,
      failedCount,
      totalChunks,
    }
  }, [documents])

  // Handle upload success callback from modal
  const handleUploadSuccess = (newDoc: KnowledgeDocument) => {
    setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)])

    if (newDoc.status === "READY") {
      setProcessingToast({
        id: `ready-${newDoc.id}-${Date.now()}`,
        docId: newDoc.id,
        docTitle: newDoc.title,
        status: "READY",
        message: `Ready to use! Generated ${newDoc.totalChunks} semantic chunks.`,
        totalChunks: newDoc.totalChunks,
        pageCount: newDoc.pageCount,
        document: newDoc,
      })
    } else {
      setProcessingToast({
        id: `proc-${newDoc.id}-${Date.now()}`,
        docId: newDoc.id,
        docTitle: newDoc.title,
        status: "PROCESSING",
        message: "Uploading and analyzing document... Extracting text and building semantic index.",
        document: newDoc,
      })
    }
  }

  // Handle Ask AI trigger for a specific document
  const handleAskAi = (doc: KnowledgeDocument) => {
    setAssistantDocId(doc.id)
    setIsAssistantModalOpen(true)
  }

  // Handle Study Tools trigger for a specific document
  const handleOpenTools = (doc: KnowledgeDocument) => {
    setSelectedToolsDoc(doc)
    setIsToolsModalOpen(true)
  }

  // Handle delete document trigger
  const handleDeleteTrigger = (doc: KnowledgeDocument) => {
    setDocToDelete(doc)
  }

  // Execute real deletion on backend
  const handleConfirmDelete = async () => {
    if (!docToDelete) return

    setIsDeleting(true)
    try {
      await documentsApi.deleteDocument(docToDelete.id)
      setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id))
      setDocToDelete(null)
    } catch (err: any) {
      alert(err.message || "Failed to delete document.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <PageContainer>
      {/* Top Page Header */}
      <PageHeader
        title="Knowledge Base"
        description="Manage your personal learning materials, study with AI flashcards & quizzes, and ask grounded questions."
        actions={
          <div className="flex items-center gap-2">
            {stats.readyCount > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSearchModalOpen(true)}
                  leftIcon={<Search className="h-4 w-4" />}
                >
                  Search Chunks
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setAssistantDocId(undefined)
                    setIsAssistantModalOpen(true)
                  }}
                  leftIcon={<Sparkles className="h-4 w-4" />}
                >
                  Ask AI Assistant
                </Button>
              </>
            )}
            <Button
              variant={stats.readyCount > 0 ? "outline" : "primary"}
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Upload Material
            </Button>
          </div>
        }
      />

      <div className="space-y-6 pt-2">
        {/* Metric Summary Cards */}
        <KnowledgeStats stats={stats} />

        {/* Informational AI Grounding Context */}
        <KnowledgeAiBanner />

        {/* Error State if initial fetch fails */}
        {fetchError && (
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              type="button"
              onClick={() => loadDocuments()}
              className="inline-flex items-center gap-1 font-semibold text-destructive hover:underline"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          </div>
        )}

        {/* Section Heading & Materials Collection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div>
              <h2 className="text-sm font-bold tracking-tight text-foreground uppercase text-[11px] text-muted-foreground">
                Your Learning Materials
              </h2>
            </div>
            {documents.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUploadModalOpen(true)}
                leftIcon={<Upload className="h-3.5 w-3.5" />}
                className="h-7 text-xs"
              >
                Add Document
              </Button>
            )}
          </div>

          {/* Loading Skeleton or Document List */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-36 rounded-xl border border-border/60 bg-muted/20 animate-pulse p-4"
                />
              ))}
            </div>
          ) : (
            <DocumentList
              documents={documents}
              onUploadClick={() => setIsUploadModalOpen(true)}
              onAskAi={handleAskAi}
              onOpenTools={handleOpenTools}
              onDelete={handleDeleteTrigger}
            />
          )}
        </div>
      </div>

      {/* AI Learning Tools Modal (Summary, Practice Questions, Flashcards, Revision Guide) - Phase 10 */}
      <AiLearningToolsModal
        isOpen={isToolsModalOpen}
        onClose={() => {
          setIsToolsModalOpen(false)
          setSelectedToolsDoc(null)
        }}
        document={selectedToolsDoc}
      />

      {/* Grounded AI Learning Assistant Modal (Phase 9) */}
      <AiAssistantModal
        isOpen={isAssistantModalOpen}
        onClose={() => {
          setIsAssistantModalOpen(false)
          setAssistantDocId(undefined)
        }}
        documents={documents}
        initialDocumentId={assistantDocId}
      />

      {/* Semantic Vector Search Modal (Phase 8) */}
      <SemanticSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        documents={documents}
      />

      {/* Real Upload Material Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Delete Confirmation Dialog */}
      {docToDelete && (
        <ConfirmDialog
          isOpen={Boolean(docToDelete)}
          onClose={() => {
            if (!isDeleting) setDocToDelete(null)
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Learning Material?"
          description={`Are you sure you want to delete "${docToDelete.title}"? The file and any indexed information will be permanently removed.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="destructive"
          isLoading={isDeleting}
        />
      )}
      {/* Floating Document Processing & Ready Toast Notification */}
      <DocumentProcessingToast
        toast={processingToast}
        onDismiss={() => setProcessingToast(null)}
        onOpenTools={handleOpenTools}
        onAskAi={handleAskAi}
      />
    </PageContainer>
  )
}

export default KnowledgePage
