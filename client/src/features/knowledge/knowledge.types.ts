export type DocumentStatus = "UPLOADED" | "PROCESSING" | "READY" | "FAILED"

export type DocumentType = "PDF" | "TXT" | "MD" | "DOCX"

export interface KnowledgeDocument {
  id: string
  title: string
  originalName: string
  fileType: DocumentType
  mimeType: string
  fileSize: number // in bytes
  status: DocumentStatus
  totalChunks: number
  pageCount?: number
  errorMessage?: string
  createdAt: string
  updatedAt?: string
}

export interface KnowledgeStatsData {
  totalDocuments: number
  readyCount: number
  processingCount: number
  failedCount: number
  totalChunks: number
}

export interface DocumentFilterOptions {
  searchQuery: string
  fileTypeFilter: "ALL" | DocumentType
  statusFilter: "ALL" | DocumentStatus
}
