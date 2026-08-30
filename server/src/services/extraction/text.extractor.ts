import { normalizeText, countWords } from "./normalizer"
import {
  IDocumentExtractor,
  DocumentExtractionResult,
  ExtractedPage,
  ExtractedSection,
} from "./extraction.types"
import { AppError } from "../../utils/appError"

export class TextExtractor implements IDocumentExtractor {
  async extract(buffer: Buffer, _originalName: string): Promise<DocumentExtractionResult> {
    const rawString = buffer.toString("utf-8")
    const normalized = normalizeText(rawString)

    if (!normalized || normalized.trim().length < 10) {
      throw new AppError(
        "Unable to extract readable text: The text file is empty or contains insufficient content.",
        422
      )
    }

    // Split paragraphs for structured sections
    const paragraphs = normalized.split(/\n\n+/).filter((p) => p.trim().length > 0)
    const sections: ExtractedSection[] = paragraphs.map((para, index) => ({
      heading: `Section ${index + 1}`,
      content: para,
    }))

    const pages: ExtractedPage[] = [
      {
        pageNumber: 1,
        content: normalized,
        wordCount: countWords(normalized),
      },
    ]

    return {
      documentType: "TXT",
      pageCount: 1,
      pages,
      sections,
      fullText: normalized,
      characterCount: normalized.length,
      wordCount: countWords(normalized),
      metadata: {
        extractedAt: new Date().toISOString(),
        paragraphCount: paragraphs.length,
      },
    }
  }
}

export const textExtractor = new TextExtractor()
