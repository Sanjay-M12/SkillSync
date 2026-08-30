import { IEmbeddingProvider } from "./embedding.types"
import { EMBEDDING_CONFIG } from "./embedding.config"
import { localEmbeddingProvider } from "./local.provider"

export class OpenAIEmbeddingProvider implements IEmbeddingProvider {
  readonly name = "openai"
  readonly model = EMBEDDING_CONFIG.openaiModel
  readonly dimension = EMBEDDING_CONFIG.openaiDimension

  private getApiKey(): string | undefined {
    return process.env.OPENAI_API_KEY
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const apiKey = this.getApiKey()
    if (!apiKey) {
      return await localEmbeddingProvider.generateEmbedding(text)
    }

    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: text.slice(0, 8000),
        }),
      })

      if (!response.ok) {
        console.warn(
          `[OpenAIEmbeddingProvider] API returned status ${response.status}. Falling back to local embedding provider.`
        )
        return await localEmbeddingProvider.generateEmbedding(text)
      }

      const data = (await response.json()) as any
      const vector = data?.data?.[0]?.embedding

      if (!Array.isArray(vector) || vector.length !== this.dimension) {
        console.warn(
          `[OpenAIEmbeddingProvider] Invalid vector dimensions. Falling back to local embedding provider.`
        )
        return await localEmbeddingProvider.generateEmbedding(text)
      }

      return vector
    } catch (err: any) {
      console.warn(
        `[OpenAIEmbeddingProvider] Network/API error: ${err.message}. Falling back to local embedding provider.`
      )
      return await localEmbeddingProvider.generateEmbedding(text)
    }
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const apiKey = this.getApiKey()
    if (!apiKey) {
      return await localEmbeddingProvider.generateBatchEmbeddings(texts)
    }

    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: texts.map((t) => t.slice(0, 8000)),
        }),
      })

      if (!response.ok) {
        console.warn(
          `[OpenAIEmbeddingProvider] Batch API returned status ${response.status}. Falling back to local provider.`
        )
        return await localEmbeddingProvider.generateBatchEmbeddings(texts)
      }

      const data = (await response.json()) as any
      return (data?.data || []).map((item: any) => item.embedding)
    } catch (err: any) {
      console.warn(
        `[OpenAIEmbeddingProvider] Batch error: ${err.message}. Falling back to local provider.`
      )
      return await localEmbeddingProvider.generateBatchEmbeddings(texts)
    }
  }
}

export const openAIEmbeddingProvider = new OpenAIEmbeddingProvider()
