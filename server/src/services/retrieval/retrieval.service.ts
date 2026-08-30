import { prisma } from "../../config/prisma"
import { embeddingService } from "../embedding"
import { RETRIEVAL_CONFIG } from "./retrieval.config"
import {
  SearchQueryDto,
  RetrievalResult,
  RetrievedChunk,
  ChunkSourceMetadata,
} from "./retrieval.types"
import { AppError } from "../../utils/appError"

function computeCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  if (denominator === 0) return 0

  const sim = dotProduct / denominator
  return Math.max(0, Math.min(1, sim))
}

export class RetrievalService {
  /**
   * Performs semantic vector similarity search strictly scoped to the authenticated user's documents
   */
  async search(userId: string, dto: SearchQueryDto): Promise<RetrievalResult> {
    const startTime = Date.now()

    // 1. Query Validation
    const cleanQuery = (dto.query || "").trim()
    if (!cleanQuery) {
      throw new AppError("Search query cannot be empty.", 400)
    }

    if (cleanQuery.length > RETRIEVAL_CONFIG.maxQueryLength) {
      throw new AppError(
        `Search query exceeds maximum length of ${RETRIEVAL_CONFIG.maxQueryLength} characters.`,
        400
      )
    }

    // 2. Validate optional documentId scope
    if (dto.documentId) {
      const doc = await prisma.document.findFirst({
        where: { id: dto.documentId, userId },
      })

      if (!doc) {
        throw new AppError("Document not found or unauthorized.", 404)
      }

      if (doc.status !== "READY") {
        throw new AppError(
          "Document is not ready for semantic search yet. Please wait for indexing to complete.",
          422
        )
      }
    }

    // 3. Generate Query Vector Embedding
    const queryEmbedding = await embeddingService.generateEmbedding(cleanQuery)

    // 4. Retrieve candidate chunks scoped strictly to the authenticated user's READY documents
    const candidateChunks = await prisma.documentChunk.findMany({
      where: {
        userId, // Strict ownership filter inside database query
        document: {
          status: "READY", // Only search fully indexed documents
          ...(dto.documentId ? { id: dto.documentId } : {}),
        },
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            originalName: true,
            fileType: true,
          },
        },
      },
    })

    const isLocalProvider = queryEmbedding.provider === "local"
    const defaultThreshold = isLocalProvider ? 0.05 : RETRIEVAL_CONFIG.minSimilarityThreshold

    const minScore =
      typeof dto.minScore === "number" && dto.minScore >= 0 && dto.minScore <= 1
        ? dto.minScore
        : defaultThreshold

    const topK = Math.min(
      Math.max(1, dto.topK || RETRIEVAL_CONFIG.defaultTopK),
      RETRIEVAL_CONFIG.maxTopK
    )

    // 5. Score and rank candidates by cosine similarity
    const scoredChunks: RetrievedChunk[] = []
    const allRankedChunks: RetrievedChunk[] = []

    for (const chunk of candidateChunks) {
      const meta = (chunk.metadata as Record<string, any>) || {}
      const storedVector = meta.embedding as number[] | undefined

      let score = 0
      if (Array.isArray(storedVector) && storedVector.length === queryEmbedding.dimension) {
        score = computeCosineSimilarity(queryEmbedding.vector, storedVector)
      }

      const source: ChunkSourceMetadata = {
        documentId: chunk.document.id,
        documentName: chunk.document.title || chunk.document.originalName,
        documentType: chunk.document.fileType,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber ?? meta.pageNumber ?? null,
        startPage: meta.startPage,
        endPage: meta.endPage,
        heading: meta.heading,
        section: meta.section,
      }

      const retrievedItem: RetrievedChunk = {
        chunkId: chunk.id,
        content: chunk.content,
        score: Number(score.toFixed(4)),
        tokenCount: chunk.tokenCount || Math.ceil(chunk.content.length / 4),
        source,
      }

      allRankedChunks.push(retrievedItem)

      if (score >= minScore) {
        scoredChunks.push(retrievedItem)
      }
    }

    // 6. Rank descending by similarity score
    scoredChunks.sort((a, b) => b.score - a.score)
    allRankedChunks.sort((a, b) => b.score - a.score)

    // If scoped to a document or local provider with candidate chunks, but score threshold didn't meet minScore,
    // fallback to top ranked candidate chunks for that document
    const candidatePool = scoredChunks.length > 0 ? scoredChunks : (dto.documentId ? allRankedChunks : [])

    // 7. Select top-K
    const finalResults = candidatePool.slice(0, topK)
    const executionTimeMs = Date.now() - startTime

    return {
      query: cleanQuery,
      documentId: dto.documentId,
      totalRetrieved: finalResults.length,
      results: finalResults,
      executionTimeMs,
      model: queryEmbedding.model,
      provider: queryEmbedding.provider,
    }
  }
}

export const retrievalService = new RetrievalService()
