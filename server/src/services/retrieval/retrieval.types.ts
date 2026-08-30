import { DocumentType } from "@prisma/client"

export interface SearchQueryDto {
  query: string
  documentId?: string
  topK?: number
  minScore?: number
}

export interface ChunkSourceMetadata {
  documentId: string
  documentName: string
  documentType: DocumentType
  chunkIndex: number
  pageNumber?: number | null
  startPage?: number
  endPage?: number
  heading?: string
  section?: string
}

export interface RetrievedChunk {
  chunkId: string
  content: string
  score: number // Cosine similarity: 0.0 to 1.0 (higher is better)
  tokenCount: number
  source: ChunkSourceMetadata
}

export interface RetrievalResult {
  query: string
  documentId?: string
  totalRetrieved: number
  results: RetrievedChunk[]
  executionTimeMs: number
  model: string
  provider: string
}
