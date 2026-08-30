import { normalizeText, countWords } from "./normalizer"
import {
  IDocumentExtractor,
  DocumentExtractionResult,
  ExtractedPage,
  ExtractedSection,
} from "./extraction.types"
import { AppError } from "../../utils/appError"

export class MarkdownExtractor implements IDocumentExtractor {
  async extract(buffer: Buffer, _originalName: string): Promise<DocumentExtractionResult> {
    const rawString = buffer.toString("utf-8")
    const normalized = normalizeText(rawString)

    if (!normalized || normalized.trim().length < 10) {
      throw new AppError(
        "Unable to extract readable text: The Markdown file is empty or contains insufficient content.",
        422
      )
    }

    // Parse sections based on Markdown headings (# Title, ## Heading, ### Subheading)
    const lines = normalized.split("\n")
    const sections: ExtractedSection[] = []
    let currentHeading = "Introduction"
    let currentLevel = 1
    let currentBuffer: string[] = []

    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
      if (headingMatch) {
        // Flush previous section if it has content
        if (currentBuffer.length > 0) {
          const content = currentBuffer.join("\n").trim()
          if (content) {
            sections.push({
              heading: currentHeading,
              level: currentLevel,
              content,
            })
          }
          currentBuffer = []
        }

        currentLevel = headingMatch[1].length
        currentHeading = headingMatch[2].trim()
      } else {
        currentBuffer.push(line)
      }
    }

    // Flush last section
    if (currentBuffer.length > 0) {
      const content = currentBuffer.join("\n").trim()
      if (content) {
        sections.push({
          heading: currentHeading,
          level: currentLevel,
          content,
        })
      }
    }

    // If no explicit markdown headings were found, fallback to full text
    if (sections.length === 0) {
      sections.push({
        heading: "Document Body",
        level: 1,
        content: normalized,
      })
    }

    const pages: ExtractedPage[] = [
      {
        pageNumber: 1,
        content: normalized,
        wordCount: countWords(normalized),
      },
    ]

    return {
      documentType: "MD",
      pageCount: 1,
      pages,
      sections,
      fullText: normalized,
      characterCount: normalized.length,
      wordCount: countWords(normalized),
      metadata: {
        extractedAt: new Date().toISOString(),
        sectionCount: sections.length,
        headings: sections.map((s) => s.heading).filter(Boolean),
      },
    }
  }
}

export const markdownExtractor = new MarkdownExtractor()
