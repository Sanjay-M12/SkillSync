import { IEmbeddingProvider } from "./embedding.types"
import { EMBEDDING_CONFIG } from "./embedding.config"
import { localEmbeddingProvider } from "./local.provider"

export class GeminiEmbeddingProvider implements IEmbeddingProvider {
  readonly name = "gemini"
  readonly model = EMBEDDING_CONFIG.geminiModel
  readonly dimension = EMBEDDING_CONFIG.geminiDimension

  private getApiKey(): string | undefined {
    return process.env.GEMINI_API_KEY
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const apiKey = this.getApiKey()
    if (!apiKey) {
      return await localEmbeddingProvider.generateEmbedding(text)
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:embedContent?key=${apiKey}`

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: `models/${this.model}`,
          content: {
            parts: [{ text: text.slice(0, 8000) }],
          },
        }),
      })

      if (!response.ok) {
        console.warn(
          `[GeminiEmbeddingProvider] API returned status ${response.status}. Falling back to local embedding provider.`
        )
        return await localEmbeddingProvider.generateEmbedding(text)
      }

      const data = (await response.json()) as any
      const values = data?.embedding?.values

      if (!Array.isArray(values) || values.length !== this.dimension) {
        console.warn(
          `[GeminiEmbeddingProvider] Invalid vector dimensions (${values?.length ?? 0}). Falling back to local embedding provider.`
        )
        return await localEmbeddingProvider.generateEmbedding(text)
      }

      return values
    } catch (err: any) {
      console.warn(
        `[GeminiEmbeddingProvider] Network/API error: ${err.message}. Falling back to local embedding provider.`
      )
      return await localEmbeddingProvider.generateEmbedding(text)
    }
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const apiKey = this.getApiKey()
    if (!apiKey) {
      return await localEmbeddingProvider.generateBatchEmbeddings(texts)
    }

    const results: number[][] = []
    const batchSize = 10
    for (let i = 0; i < texts.length; i += batchSize) {
      const slice = texts.slice(i, i + batchSize)
      const batchPromises = slice.map((t) => this.generateEmbedding(t))
      const batchVectors = await Promise.all(batchPromises)
      results.push(...batchVectors)
    }

    return results
  }
}

export const geminiEmbeddingProvider = new GeminiEmbeddingProvider()
