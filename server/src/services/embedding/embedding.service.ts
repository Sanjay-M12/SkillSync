import { prisma } from "../../config/prisma"
import { IEmbeddingProvider, EmbeddingResult, BatchEmbeddingResult } from "./embedding.types"
import { EMBEDDING_CONFIG } from "./embedding.config"
import { localEmbeddingProvider } from "./local.provider"
import { geminiEmbeddingProvider } from "./gemini.provider"
import { openAIEmbeddingProvider } from "./openai.provider"
import { AppError } from "../../utils/appError"

export class EmbeddingService {
  private getProvider(): IEmbeddingProvider {
    const providerName = EMBEDDING_CONFIG.defaultProvider

    if (providerName === "gemini" && process.env.GEMINI_API_KEY) {
      return geminiEmbeddingProvider
    }

    if (providerName === "openai" && process.env.OPENAI_API_KEY) {
      return openAIEmbeddingProvider
    }

    return localEmbeddingProvider
  }

  /**
   * Generates a validated embedding vector for a query or text chunk
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const provider = this.getProvider()
    const vector = await provider.generateEmbedding(text)

    // Validate dimensions and numeric integrity
    if (!Array.isArray(vector) || vector.length !== provider.dimension) {
      throw new AppError(
        `Embedding vector dimension mismatch: got ${vector?.length ?? 0}, expected ${provider.dimension}`,
        500
      )
    }

    return {
      vector,
      dimension: provider.dimension,
      model: provider.model,
      provider: provider.name,
    }
  }

  /**
   * Generates validated embeddings for a batch of text chunks
   */
  async generateBatchEmbeddings(texts: string[]): Promise<BatchEmbeddingResult> {
    const provider = this.getProvider()
    const vectors = await provider.generateBatchEmbeddings(texts)

    for (let i = 0; i < vectors.length; i++) {
      const vec = vectors[i]
      if (!Array.isArray(vec) || vec.length !== provider.dimension) {
        throw new AppError(
          `Batch embedding vector at index ${i} dimension mismatch: got ${vec?.length ?? 0}, expected ${provider.dimension}`,
          500
        )
      }
    }

    return {
      vectors,
      dimension: provider.dimension,
      model: provider.model,
      provider: provider.name,
      count: vectors.length,
    }
  }

  /**
   * Embeds all DocumentChunks for a document and updates Document status to READY
   */
  async embedDocumentChunks(documentId: string): Promise<{
    totalEmbedded: number
    dimension: number
    provider: string
  }> {
    const chunks = await prisma.documentChunk.findMany({
      where: { documentId },
      orderBy: { chunkIndex: "asc" },
    })

    if (chunks.length === 0) {
      throw new AppError(`Cannot embed document ${documentId}: No document chunks found.`, 422)
    }

    const provider = this.getProvider()
    const texts = chunks.map((c) => c.content)
    const batchResult = await this.generateBatchEmbeddings(texts)

    // Update chunk records with vector embeddings in a transaction
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const vector = batchResult.vectors[i]
        const currentMeta = (chunk.metadata as Record<string, any>) || {}

        await tx.documentChunk.update({
          where: { id: chunk.id },
          data: {
            metadata: {
              ...currentMeta,
              embedding: vector,
              embeddingDimension: batchResult.dimension,
              embeddingModel: batchResult.model,
              embeddingProvider: batchResult.provider,
              embeddedAt: new Date().toISOString(),
            },
          },
        })
      }

      // Mark Document as READY for semantic search!
      await tx.document.update({
        where: { id: documentId },
        data: {
          status: "READY",
          errorMessage: null,
        },
      })
    })

    console.log(
      `[EmbeddingService] Successfully embedded ${chunks.length} chunks using ${batchResult.provider} (${batchResult.model}) for doc ${documentId}. Status updated to READY.`
    )

    return {
      totalEmbedded: chunks.length,
      dimension: batchResult.dimension,
      provider: batchResult.provider,
    }
  }
}

export const embeddingService = new EmbeddingService()
