import { DocumentType } from "@prisma/client"
import { prisma } from "../../config/prisma"
import { DocumentExtractionResult } from "../extraction/extraction.types"
import { RawChunk, ChunkingResult } from "./chunking.types"
import { pdfChunker } from "./pdf.chunker"
import { markdownChunker } from "./markdown.chunker"
import { textChunker } from "./text.chunker"
import { embeddingService } from "../embedding"
import { AppError } from "../../utils/appError"

export class DocumentChunkingService {
  /**
   * Generates structured chunks from extraction result
   */
  chunkDocument(extraction: DocumentExtractionResult): RawChunk[] {
    let rawChunks: RawChunk[] = []

    switch (extraction.documentType) {
      case "PDF":
        rawChunks = pdfChunker.chunk(extraction)
        break
      case "MD":
        rawChunks = markdownChunker.chunk(extraction)
        break
      case "TXT":
      default:
        rawChunks = textChunker.chunk(extraction)
        break
    }

    // Validate and filter chunks
    const validatedChunks: RawChunk[] = []
    let sequentialIndex = 0

    for (const chunk of rawChunks) {
      const trimmedContent = chunk.content ? chunk.content.trim() : ""

      // Filter out empty or whitespace-only chunks
      if (!trimmedContent || trimmedContent.length < 10) {
        continue
      }

      validatedChunks.push({
        chunkIndex: sequentialIndex++,
        pageNumber: chunk.pageNumber ?? null,
        content: trimmedContent,
        tokenCount: Math.max(1, chunk.tokenCount || Math.ceil(trimmedContent.length / 4)),
        metadata: {
          ...chunk.metadata,
          charCount: trimmedContent.length,
          wordCount: trimmedContent.split(/\s+/).filter(Boolean).length,
        },
      })
    }

    if (validatedChunks.length === 0 && extraction.fullText && extraction.fullText.trim().length >= 10) {
      const fallbackContent = extraction.fullText.trim()
      validatedChunks.push({
        chunkIndex: 0,
        pageNumber: 1,
        content: fallbackContent,
        tokenCount: Math.max(1, Math.ceil(fallbackContent.length / 4)),
        metadata: {
          charCount: fallbackContent.length,
          wordCount: fallbackContent.split(/\s+/).filter(Boolean).length,
          tokenCount: Math.max(1, Math.ceil(fallbackContent.length / 4)),
          hasOverlap: false,
        },
      })
    }

    return validatedChunks
  }

  /**
   * Processes, embeds, and stores chunks in database inside an atomic transaction
   */
  async processAndStoreChunks(
    documentId: string,
    userId: string,
    extraction: DocumentExtractionResult
  ): Promise<ChunkingResult> {
    try {
      const chunks = this.chunkDocument(extraction)

      if (chunks.length === 0) {
        throw new AppError(
          "Document chunking produced zero valid chunks. The document contains insufficient text content.",
          422
        )
      }

      // Generate vector embeddings for all chunks in batch (Phase 7)
      const texts = chunks.map((c) => c.content)
      const batchResult = await embeddingService.generateBatchEmbeddings(texts)

      const chunkRecords = chunks.map((chunk, idx) => {
        const vector = batchResult.vectors[idx]
        return {
          documentId,
          userId,
          chunkIndex: chunk.chunkIndex,
          pageNumber: chunk.pageNumber,
          content: chunk.content,
          tokenCount: chunk.tokenCount,
          metadata: {
            ...chunk.metadata,
            embedding: vector,
            embeddingDimension: batchResult.dimension,
            embeddingModel: batchResult.model,
            embeddingProvider: batchResult.provider,
            embeddedAt: new Date().toISOString(),
          },
        }
      })

      // Transactional storage: clean old chunks and insert new ones atomically
      await prisma.$transaction(async (tx) => {
        // 1. Delete previous chunks if reprocessing
        await tx.documentChunk.deleteMany({
          where: { documentId },
        })

        // 2. Batch insert new chunks with embedding vectors
        await tx.documentChunk.createMany({
          data: chunkRecords,
        })

        // 3. Update parent Document status to READY
        await tx.document.update({
          where: { id: documentId },
          data: {
            totalChunks: chunks.length,
            status: "READY",
            errorMessage: null,
          },
        })
      })

      const totalTokens = chunks.reduce((sum, c) => sum + c.tokenCount, 0)
      const avgTokens = Math.round(totalTokens / chunks.length)

      console.log(
        `[DocumentChunkingService] Generated, embedded & stored ${chunks.length} chunks (avg ${avgTokens} tokens) for doc ${documentId}. Status is now READY.`
      )

      return {
        documentId,
        documentType: extraction.documentType,
        totalChunks: chunks.length,
        chunks,
        averageTokenCount: avgTokens,
        chunkedAt: new Date().toISOString(),
      }
    } catch (err: any) {
      console.error(`[DocumentChunkingService] Chunking/embedding failed for doc ${documentId}:`, err.message)

      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: "FAILED",
          errorMessage:
            err instanceof AppError
              ? err.message
              : "Failed to chunk and embed document content for semantic search.",
        },
      })

      throw err
    }
  }
}

export const documentChunkingService = new DocumentChunkingService()
