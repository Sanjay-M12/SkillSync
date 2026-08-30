import { DocumentType } from "@prisma/client"

export interface ChunkMetadata {
  pageNumber?: number
  startPage?: number
  endPage?: number
  heading?: string
  section?: string
  headingLevel?: number
  charCount: number
  wordCount: number
  tokenCount: number
  hasOverlap: boolean
  overlapChars?: number
  [key: string]: any
}

export interface RawChunk {
  chunkIndex: number
  pageNumber?: number | null
  content: string
  tokenCount: number
  metadata: ChunkMetadata
}

export interface ChunkingResult {
  documentId: string
  documentType: DocumentType
  totalChunks: number
  chunks: RawChunk[]
  averageTokenCount: number
  chunkedAt: string
}
