import { DocumentExtractionResult, ExtractedSection } from "../extraction/extraction.types"
import { RawChunk, ChunkMetadata } from "./chunking.types"
import { CHUNKING_CONFIG } from "./chunking.config"
import {
  estimateTokens,
  splitIntoParagraphs,
  splitIntoSentences,
  extractTrailingOverlap,
} from "./token.utils"

export class MarkdownChunker {
  chunk(extraction: DocumentExtractionResult): RawChunk[] {
    const chunks: RawChunk[] = []
    let currentChunkIndex = 0
    let overlapText = ""

    const sections = extraction.sections || []
    if (sections.length === 0 && extraction.fullText) {
      sections.push({
        heading: "Document Body",
        level: 1,
        content: extraction.fullText,
      })
    }

    for (const sec of sections) {
      const headingPrefix = sec.heading && sec.heading !== "Document Body" ? `## ${sec.heading}\n\n` : ""
      const rawContent = sec.content.trim()
      if (!rawContent) continue

      const fullSectionText = `${headingPrefix}${rawContent}`
      const sectionTokens = estimateTokens(fullSectionText)

      // If entire section fits within targetTokens
      if (sectionTokens <= CHUNKING_CONFIG.targetTokens) {
        const chunkContent = overlapText ? `${overlapText}\n\n${fullSectionText}` : fullSectionText
        const tokenCount = estimateTokens(chunkContent)

        const metadata: ChunkMetadata = {
          heading: sec.heading || "Document Body",
          section: sec.heading || "Document Body",
          headingLevel: sec.level || 1,
          charCount: chunkContent.length,
          wordCount: chunkContent.split(/\s+/).filter(Boolean).length,
          tokenCount,
          hasOverlap: Boolean(overlapText),
          overlapChars: overlapText.length,
        }

        chunks.push({
          chunkIndex: currentChunkIndex++,
          pageNumber: null,
          content: chunkContent,
          tokenCount,
          metadata,
        })

        overlapText = extractTrailingOverlap(rawContent, CHUNKING_CONFIG.overlapTokens)
        continue
      }

      // If section is larger than targetTokens, split by paragraphs
      const paragraphs = splitIntoParagraphs(rawContent)
      let currentBuffer: string[] = []
      let currentBufferTokens = overlapText ? estimateTokens(overlapText) : 0
      if (overlapText) {
        currentBuffer.push(overlapText)
      }

      for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i]
        const paraTokens = estimateTokens(para)

        // Oversized single paragraph: split by sentences
        if (paraTokens > CHUNKING_CONFIG.maxTokens) {
          if (currentBuffer.length > 0) {
            const body = currentBuffer.join("\n\n").trim()
            const chunkContent = headingPrefix ? `${headingPrefix}${body}` : body
            if (chunkContent) {
              const tokenCount = estimateTokens(chunkContent)
              chunks.push({
                chunkIndex: currentChunkIndex++,
                pageNumber: null,
                content: chunkContent,
                tokenCount,
                metadata: {
                  heading: sec.heading || "Document Body",
                  section: sec.heading || "Document Body",
                  headingLevel: sec.level || 1,
                  charCount: chunkContent.length,
                  wordCount: chunkContent.split(/\s+/).filter(Boolean).length,
                  tokenCount,
                  hasOverlap: Boolean(overlapText),
                  overlapChars: overlapText.length,
                },
              })
              overlapText = extractTrailingOverlap(body, CHUNKING_CONFIG.overlapTokens)
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
              const body = currentBuffer.join(" ").trim()
              const chunkContent = headingPrefix ? `${headingPrefix}${body}` : body
              if (chunkContent) {
                const tokenCount = estimateTokens(chunkContent)
                chunks.push({
                  chunkIndex: currentChunkIndex++,
                  pageNumber: null,
                  content: chunkContent,
                  tokenCount,
                  metadata: {
                    heading: sec.heading || "Document Body",
                    section: sec.heading || "Document Body",
                    headingLevel: sec.level || 1,
                    charCount: chunkContent.length,
                    wordCount: chunkContent.split(/\s+/).filter(Boolean).length,
                    tokenCount,
                    hasOverlap: Boolean(overlapText),
                    overlapChars: overlapText.length,
                  },
                })
                overlapText = extractTrailingOverlap(body, CHUNKING_CONFIG.overlapTokens)
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
          const body = currentBuffer.join("\n\n").trim()
          const chunkContent = headingPrefix ? `${headingPrefix}${body}` : body
          if (chunkContent) {
            const tokenCount = estimateTokens(chunkContent)
            chunks.push({
              chunkIndex: currentChunkIndex++,
              pageNumber: null,
              content: chunkContent,
              tokenCount,
              metadata: {
                heading: sec.heading || "Document Body",
                section: sec.heading || "Document Body",
                headingLevel: sec.level || 1,
                charCount: chunkContent.length,
                wordCount: chunkContent.split(/\s+/).filter(Boolean).length,
                tokenCount,
                hasOverlap: Boolean(overlapText),
                overlapChars: overlapText.length,
              },
            })
            overlapText = extractTrailingOverlap(body, CHUNKING_CONFIG.overlapTokens)
          }
          currentBuffer = overlapText ? [overlapText] : []
          currentBufferTokens = overlapText ? estimateTokens(overlapText) : 0
        }

        currentBuffer.push(para)
        currentBufferTokens += paraTokens
      }

      if (currentBuffer.length > 0) {
        const body = currentBuffer.join("\n\n").trim()
        if (body && body !== overlapText) {
          const chunkContent = headingPrefix ? `${headingPrefix}${body}` : body
          const tokenCount = estimateTokens(chunkContent)
          chunks.push({
            chunkIndex: currentChunkIndex++,
            pageNumber: null,
            content: chunkContent,
            tokenCount,
            metadata: {
              heading: sec.heading || "Document Body",
              section: sec.heading || "Document Body",
              headingLevel: sec.level || 1,
              charCount: chunkContent.length,
              wordCount: chunkContent.split(/\s+/).filter(Boolean).length,
              tokenCount,
              hasOverlap: Boolean(overlapText),
              overlapChars: overlapText.length,
            },
          })
          overlapText = extractTrailingOverlap(body, CHUNKING_CONFIG.overlapTokens)
        }
      }
    }

    return chunks
  }
}

export const markdownChunker = new MarkdownChunker()
