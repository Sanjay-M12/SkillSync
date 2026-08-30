import { DocumentType } from "@prisma/client"

export interface ExtractedPage {
  pageNumber: number // 1-indexed
  content: string
  wordCount: number
}

export interface ExtractedSection {
  heading?: string
  level?: number // 1 for #, 2 for ##, 3 for ###, etc.
  content: string
  pageNumber?: number
}

export interface DocumentExtractionResult {
  documentType: DocumentType
  pageCount: number
  pages: ExtractedPage[]
  sections: ExtractedSection[]
  fullText: string
  characterCount: number
  wordCount: number
  metadata: {
    title?: string
    author?: string
    creator?: string
    isScannedOnly?: boolean
    extractedAt: string
    [key: string]: any
  }
}

export interface IDocumentExtractor {
  extract(buffer: Buffer, originalName: string): Promise<DocumentExtractionResult>
}
