export interface EmbeddingConfig {
  defaultProvider: "gemini" | "openai" | "local"
  geminiModel: string
  geminiDimension: number
  openaiModel: string
  openaiDimension: number
  localDimension: number
  batchSize: number
  maxRetries: number
}

export const EMBEDDING_CONFIG: EmbeddingConfig = {
  defaultProvider: (process.env.EMBEDDING_PROVIDER as any) || (process.env.GEMINI_API_KEY ? "gemini" : process.env.OPENAI_API_KEY ? "openai" : "local"),
  geminiModel: process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004",
  geminiDimension: 768,
  openaiModel: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
  openaiDimension: 1536,
  localDimension: 768,
  batchSize: 20,
  maxRetries: 3,
}
