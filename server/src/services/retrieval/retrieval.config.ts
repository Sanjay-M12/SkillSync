export interface RetrievalConfig {
  /** Default number of top relevant chunks to retrieve */
  defaultTopK: number
  /** Maximum allowable topK to prevent context bloating */
  maxTopK: number
  /** Minimum cosine similarity threshold to consider a chunk relevant (0.0 to 1.0) */
  minSimilarityThreshold: number
  /** Maximum length of search query string in characters */
  maxQueryLength: number
}

export const RETRIEVAL_CONFIG: RetrievalConfig = {
  defaultTopK: 5,
  maxTopK: 10,
  minSimilarityThreshold: 0.35,
  maxQueryLength: 1000,
}
