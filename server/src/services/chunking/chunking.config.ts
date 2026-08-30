/**
 * Centralized Configuration for Document Chunking
 * 
 * Token to character ratio is ~4 characters per token for English text.
 */

export interface ChunkingConfig {
  /** Target token count per chunk (~600 tokens / 2400 chars) */
  targetTokens: number
  /** Maximum allowable token count before forced split (~800 tokens / 3200 chars) */
  maxTokens: number
  /** Minimum token count to avoid tiny orphan chunks (~50 tokens / 200 chars) */
  minTokens: number
  /** Token overlap between consecutive chunks (~80 tokens / 320 chars) */
  overlapTokens: number
  /** Approximate character per token ratio */
  charsPerToken: number
}

export const CHUNKING_CONFIG: ChunkingConfig = {
  targetTokens: 600,
  maxTokens: 800,
  minTokens: 50,
  overlapTokens: 80,
  charsPerToken: 4,
}
