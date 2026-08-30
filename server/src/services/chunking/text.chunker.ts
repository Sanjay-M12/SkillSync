import { DocumentExtractionResult } from "../extraction/extraction.types"
import { RawChunk, ChunkMetadata } from "./chunking.types"
import { CHUNKING_CONFIG } from "./chunking.config"
import {
  estimateTokens,
  splitIntoParagraphs,
  splitIntoSentences,
  extractTrailingOverlap,
} from "./token.utils"

export class TextChunker {
  chunk(extraction: DocumentExtractionResult): RawChunk[] {
    const chunks: RawChunk[] = []
    let currentChunkIndex = 0
    let overlapText = ""

    const paragraphs = splitIntoParagraphs(extraction.fullText)
    if (paragraphs.length === 0 && extraction.fullText) {
      paragraphs.push(extraction.fullText)
    }

    let currentBuffer: string[] = []
    let currentBufferTokens = 0

    for (const para of paragraphs) {
      const paraTokens = estimateTokens(para)

      // Oversized single paragraph: split by sentences
      if (paraTokens > CHUNKING_CONFIG.maxTokens) {
        if (currentBuffer.length > 0) {
          const chunkContent = currentBuffer.join("\n\n").trim()
          if (chunkContent) {
            const tokenCount = estimateTokens(chunkContent)
            chunks.push({
              chunkIndex: currentChunkIndex++,
              pageNumber: null,
              content: chunkContent,
              tokenCount,
              metadata: {
                section: `Section ${currentChunkIndex}`,
                charCount: chunkContent.length,
                wordCount: chunkContent.split(/\s+/).filter(Boolean).length,
                tokenCount,
                hasOverlap: Boolean(overlapText),
                overlapChars: overlapText.length,
              },
            })
            overlapText = extractTrailingOverlap(chunkContent, CHUNKING_CONFIG.overlapTokens)
          }
          currentBuffer = overlapText ? [overlapText] : []
          currentBufferTokens = overlapText ? estimateTokens(overlapText) : 0
        }

        const sentences = splitIntoSentences(para)
        for (const sentence of sentences) {
          const sentTokens = estimateTokens(sentence)
          if (
            currentBufferTokens + sentTokens > CHUNKING_CONFIG.targetTokens &&
            currentBuffer.length > 0
          ) {
            const chunkContent = currentBuffer.join(" ").trim()
            if (chunkContent) {
              const tokenCount = estimateTokens(chunkContent)
              chunks.push({
                chunkIndex: currentChunkIndex++,
                pageNumber: null,
                content: chunkContent,
                tokenCount,
                metadata: {
                  section: `Section ${currentChunkIndex}`,
                  charCount: chunkContent.length,
                  wordCount: chunkContent.split(/\s+/).filter(Boolean).length,
                  tokenCount,
                  hasOverlap: Boolean(overlapText),
                  overlapChars: overlapText.length,
                },
              })
              overlapText = extractTrailingOverlap(chunkContent, CHUNKING_CONFIG.overlapTokens)
            }
            currentBuffer = overlapText ? [overlapText] : []
            currentBufferTokens = overlapText ? estimateTokens(overlapText) : 0
          }
          currentBuffer.push(sentence)
          currentBufferTokens += sentTokens
        }
        continue
      }

      if (
        currentBufferTokens + paraTokens > CHUNKING_CONFIG.targetTokens &&
        currentBuffer.length > 0
      ) {
        const chunkContent = currentBuffer.join("\n\n").trim()
        if (chunkContent) {
          const tokenCount = estimateTokens(chunkContent)
          chunks.push({
            chunkIndex: currentChunkIndex++,
            pageNumber: null,
            content: chunkContent,
            tokenCount,
            metadata: {
              section: `Section ${currentChunkIndex}`,
              charCount: chunkContent.length,
              wordCount: chunkContent.split(/\s+/).filter(Boolean).length,
              tokenCount,
              hasOverlap: Boolean(overlapText),
              overlapChars: overlapText.length,
            },
          })
          overlapText = extractTrailingOverlap(chunkContent, CHUNKING_CONFIG.overlapTokens)
        }
        currentBuffer = overlapText ? [overlapText] : []
        currentBufferTokens = overlapText ? estimateTokens(overlapText) : 0
      }

      currentBuffer.push(para)
      currentBufferTokens += paraTokens
    }

    if (currentBuffer.length > 0) {
      const chunkContent = currentBuffer.join("\n\n").trim()
      if (chunkContent && chunkContent !== overlapText) {
        const tokenCount = estimateTokens(chunkContent)
        chunks.push({
          chunkIndex: currentChunkIndex++,
          pageNumber: null,
          content: chunkContent,
          tokenCount,
          metadata: {
            section: `Section ${currentChunkIndex}`,
            charCount: chunkContent.length,
            wordCount: chunkContent.split(/\s+/).filter(Boolean).length,
            tokenCount,
            hasOverlap: Boolean(overlapText),
            overlapChars: overlapText.length,
          },
        })
      }
    }

    return chunks
  }
}

export const textChunker = new TextChunker()
