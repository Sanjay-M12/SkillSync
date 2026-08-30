import { PDFParse } from "pdf-parse"
import { normalizeText, countWords } from "./normalizer"
import {
  IDocumentExtractor,
  DocumentExtractionResult,
  ExtractedPage,
  ExtractedSection,
} from "./extraction.types"
import { AppError } from "../../utils/appError"

export class PdfExtractor implements IDocumentExtractor {
  async extract(buffer: Buffer, _originalName: string): Promise<DocumentExtractionResult> {
    let parser: PDFParse | null = null

    try {
      // Initialize PDFParse instance with buffer data
      parser = new PDFParse({ data: buffer })

      // Extract text content and metadata
      const textResult = await parser.getText()
      const infoResult = await parser.getInfo().catch(() => null)

      const pages: ExtractedPage[] = []
      const sections: ExtractedSection[] = []

      if (textResult.pages && textResult.pages.length > 0) {
        for (const page of textResult.pages) {
          const normalized = normalizeText(page.text || "")
          const pageNum = page.num || pages.length + 1

          pages.push({
            pageNumber: pageNum,
            content: normalized,
            wordCount: countWords(normalized),
          })

          if (normalized) {
            sections.push({
              heading: `Page ${pageNum}`,
              pageNumber: pageNum,
              content: normalized,
            })
          }
        }
      } else {
        const normalized = normalizeText(textResult.text || "")
        pages.push({
          pageNumber: 1,
          content: normalized,
          wordCount: countWords(normalized),
        })
        if (normalized) {
          sections.push({
            heading: "Page 1",
            pageNumber: 1,
            content: normalized,
          })
        }
      }

      const fullNormalizedText = pages
        .map((p) => p.content)
        .filter(Boolean)
        .join("\n\n")

      const totalWords = countWords(fullNormalizedText)
      const totalPages = textResult.total || pages.length || 1

      // Scanned/image-only PDF detection (below extractable threshold)
      if (fullNormalizedText.trim().length < 20) {
        throw new AppError(
          "Unable to extract readable text from this PDF. The document appears to be scanned or image-only without an extractable text layer.",
          422
        )
      }

      return {
        documentType: "PDF",
        pageCount: totalPages,
        pages,
        sections,
        fullText: fullNormalizedText,
        characterCount: fullNormalizedText.length,
        wordCount: totalWords,
        metadata: {
          title: infoResult?.info?.Title || undefined,
          author: infoResult?.info?.Author || undefined,
          creator: infoResult?.info?.Creator || undefined,
          producer: infoResult?.info?.Producer || undefined,
          isScannedOnly: false,
          extractedAt: new Date().toISOString(),
        },
      }
    } catch (err: any) {
      if (err instanceof AppError) {
        throw err
      }
      throw new AppError(
        `Failed to parse PDF document: ${err.message || "Invalid or corrupted PDF format."}`,
        400
      )
    } finally {
      if (parser) {
        await parser.destroy().catch(() => {})
      }
    }
  }
}

export const pdfExtractor = new PdfExtractor()
