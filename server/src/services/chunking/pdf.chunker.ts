import { DocumentExtractionResult, ExtractedPage } from "../extraction/extraction.types"
import { RawChunk, ChunkMetadata } from "./chunking.types"
import { CHUNKING_CONFIG } from "./chunking.config"
import {
  estimateTokens,
  splitIntoParagraphs,
  splitIntoSentences,
  extractTrailingOverlap,
} from "./token.utils"

export class PdfChunker {
  chunk(extraction: DocumentExtractionResult): RawChunk[] {
    const chunks: RawChunk[] = []
    let currentChunkIndex = 0
    let overlapText = ""

    const pages = extraction.pages || []
    if (pages.length === 0 && extraction.fullText) {
      pages.push({
        pageNumber: 1,
        content: extraction.fullText,
        wordCount: extraction.wordCount,
      })
    }

    for (const page of pages) {
      const pageText = page.content.trim()
      if (!pageText) continue

      const pageTokens = estimateTokens(pageText)

      // If entire page comfortably fits inside TARGET_CHUNK_TOKENS
      if (pageTokens <= CHUNKING_CONFIG.targetTokens) {
        const fullContent = overlapText ? `${overlapText}\n\n${pageText}` : pageText
        const tokenCount = estimateTokens(fullContent)

        const metadata: ChunkMetadata = {
          pageNumber: page.pageNumber,
          startPage: page.pageNumber,
          endPage: page.pageNumber,
          heading: `Page ${page.pageNumber}`,
          charCount: fullContent.length,
          wordCount: fullContent.split(/\s+/).filter(Boolean).length,
          tokenCount,
          hasOverlap: Boolean(overlapText),
          overlapChars: overlapText.length,
        }

        chunks.push({
          chunkIndex: currentChunkIndex++,
          pageNumber: page.pageNumber,
          content: fullContent,
          tokenCount,
          metadata,
        })

        // Generate overlap for next chunk
        overlapText = extractTrailingOverlap(pageText, CHUNKING_CONFIG.overlapTokens)
        continue
      }

      // If page is larger than target size, split by paragraphs and sentences
      const paragraphs = splitIntoParagraphs(pageText)
      let currentBuffer: string[] = []
      let currentBufferTokens = overlapText ? estimateTokens(overlapText) : 0
      if (overlapText) {
        currentBuffer.push(overlapText)
      }

      for (const para of paragraphs) {
        const paraTokens = estimateTokens(para)

        // If single paragraph exceeds MAX_CHUNK_TOKENS, split by sentences
        if (paraTokens > CHUNKING_CONFIG.maxTokens) {
          // Flush any buffered paragraphs first
          if (currentBuffer.length > 0) {
            const chunkContent = currentBuffer.join("\n\n").trim()
            if (chunkContent) {
              const tokenCount = estimateTokens(chunkContent)
              chunks.push({
                chunkIndex: currentChunkIndex++,
                pageNumber: page.pageNumber,
                content: chunkContent,
                tokenCount,
                metadata: {
                  pageNumber: page.pageNumber,
                  startPage: page.pageNumber,
                  endPage: page.pageNumber,
                  heading: `Page ${page.pageNumber}`,
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

          // Split oversized paragraph by sentences
          const sentences = splitIntoSentences(para)
          for (const sentence of sentences) {
            const sentenceTokens = estimateTokens(sentence)
            if (
              currentBufferTokens + sentenceTokens > CHUNKING_CONFIG.targetTokens &&
              currentBuffer.length > 0
            ) {
              const chunkContent = currentBuffer.join(" ").trim()
              if (chunkContent) {
                const tokenCount = estimateTokens(chunkContent)
                chunks.push({
                  chunkIndex: currentChunkIndex++,
                  pageNumber: page.pageNumber,
                  content: chunkContent,
                  tokenCount,
                  metadata: {
                    pageNumber: page.pageNumber,
                    startPage: page.pageNumber,
                    endPage: page.pageNumber,
                    heading: `Page ${page.pageNumber}`,
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
            currentBufferTokens += sentenceTokens
          }
          continue
        }

        // Check if adding this paragraph exceeds targetTokens
        if (
          currentBufferTokens + paraTokens > CHUNKING_CONFIG.targetTokens &&
          currentBuffer.length > 0
        ) {
          const chunkContent = currentBuffer.join("\n\n").trim()
          if (chunkContent) {
            const tokenCount = estimateTokens(chunkContent)
            chunks.push({
              chunkIndex: currentChunkIndex++,
              pageNumber: page.pageNumber,
              content: chunkContent,
              tokenCount,
              metadata: {
                pageNumber: page.pageNumber,
                startPage: page.pageNumber,
                endPage: page.pageNumber,
                heading: `Page ${page.pageNumber}`,
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

      // Flush remaining buffer for this page
      if (currentBuffer.length > 0) {
        const chunkContent = currentBuffer.join("\n\n").trim()
        if (chunkContent && chunkContent !== overlapText) {
          const tokenCount = estimateTokens(chunkContent)
          chunks.push({
            chunkIndex: currentChunkIndex++,
            pageNumber: page.pageNumber,
            content: chunkContent,
            tokenCount,
            metadata: {
              pageNumber: page.pageNumber,
              startPage: page.pageNumber,
              endPage: page.pageNumber,
              heading: `Page ${page.pageNumber}`,
              charCount: chunkContent.length,
              wordCount: chunkContent.split(/\s+/).filter(Boolean).length,
              tokenCount,
              hasOverlap: Boolean(overlapText),
              overlapChars: overlapText.length,
            },
          })
          overlapText = extractTrailingOverlap(chunkContent, CHUNKING_CONFIG.overlapTokens)
        }
      }
    }

    return chunks
  }
}

export const pdfChunker = new PdfChunker()
