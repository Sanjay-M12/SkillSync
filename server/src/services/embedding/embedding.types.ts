export interface IEmbeddingProvider {
  readonly name: string
  readonly model: string
  readonly dimension: number
  generateEmbedding(text: string): Promise<number[]>
  generateBatchEmbeddings(texts: string[]): Promise<number[][]>
}

export interface EmbeddingResult {
  vector: number[]
  dimension: number
  model: string
  provider: string
}

export interface BatchEmbeddingResult {
  vectors: number[][]
  dimension: number
  model: string
  provider: string
  count: number
}
