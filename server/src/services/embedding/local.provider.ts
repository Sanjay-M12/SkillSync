import { IEmbeddingProvider } from "./embedding.types"
import { EMBEDDING_CONFIG } from "./embedding.config"

export class LocalEmbeddingProvider implements IEmbeddingProvider {
  readonly name = "local"
  readonly model = "deterministic-projection-768"
  readonly dimension = EMBEDDING_CONFIG.localDimension

  /**
   * Generates a deterministic 768-dimensional normalized L2 vector from input text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const dim = this.dimension
    const vector = new Float64Array(dim)
    const clean = text.toLowerCase().trim()

    if (!clean) {
      vector[0] = 1.0
      return Array.from(vector)
    }

    // 1. Token-level projection with hashing
    const tokens = clean.split(/[\s\p{P}]+/u).filter(Boolean)
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      let h1 = 0x811c9dc5
      let h2 = 0x5bd1e995

      for (let j = 0; j < token.length; j++) {
        const code = token.charCodeAt(j)
        h1 = Math.imul(h1 ^ code, 0x01000193)
        h2 = Math.imul(h2 ^ code, 0x5bd1e995)
      }

      const idx1 = Math.abs(h1) % dim
      const idx2 = Math.abs(h2) % dim
      const weight = 1.0 / Math.sqrt(tokens.length)

      vector[idx1] += weight * (h1 > 0 ? 1 : -1)
      vector[idx2] += weight * (h2 > 0 ? 1 : -1)
    }

    // 2. Character trigram projections for sub-word semantic density
    for (let i = 0; i < clean.length - 2; i++) {
      const trigram = clean.substring(i, i + 3)
      let th = 0x9e3779b9
      for (let j = 0; j < 3; j++) {
        th = Math.imul(th ^ trigram.charCodeAt(j), 0x85ebca6b)
      }
      const tidx = Math.abs(th) % dim
      vector[tidx] += 0.3
    }

    // 3. L2 Normalization (Unit vector length = 1.0)
    let sumSq = 0
    for (let i = 0; i < dim; i++) {
      sumSq += vector[i] * vector[i]
    }

    const norm = Math.sqrt(sumSq) || 1.0
    const result = new Array<number>(dim)
    for (let i = 0; i < dim; i++) {
      result[i] = Number((vector[i] / norm).toFixed(6))
    }

    return result
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    return await Promise.all(texts.map((t) => this.generateEmbedding(t)))
  }
}

export const localEmbeddingProvider = new LocalEmbeddingProvider()
