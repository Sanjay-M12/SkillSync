import { ChunkSourceMetadata } from "../retrieval"

export interface AskQuestionDto {
  question: string
  documentId?: string
  topK?: number
  minScore?: number
}

export interface VerifiedSource extends ChunkSourceMetadata {
  matchScore: number // Cosine similarity score percentage (e.g. 0.85)
}

export interface GroundedAnswerResult {
  question: string
  answer: string
  hasContext: boolean
  sources: VerifiedSource[]
  metadata: {
    retrievedChunksCount: number
    executionTimeMs: number
    model: string
    provider: string
    documentId?: string
  }
}
