import { DocumentType } from "@prisma/client"
import { prisma } from "../../config/prisma"
import { storageService } from "../storage.service"
import { pdfExtractor } from "./pdf.extractor"
import { textExtractor } from "./text.extractor"
import { markdownExtractor } from "./markdown.extractor"
import { documentChunkingService } from "../chunking"
import {
  DocumentExtractionResult,
  IDocumentExtractor,
} from "./extraction.types"
import { AppError } from "../../utils/appError"

export class DocumentExtractionService {
  private getExtractor(fileType: DocumentType): IDocumentExtractor {
    switch (fileType) {
      case "PDF":
        return pdfExtractor
      case "MD":
        return markdownExtractor
      case "TXT":
      default:
        return textExtractor
    }
  }

  /**
   * Extracts structured text from in-memory buffer based on DocumentType
   */
  async extractFromBuffer(
    buffer: Buffer,
    fileType: DocumentType,
    originalName: string
  ): Promise<DocumentExtractionResult> {
    const extractor = this.getExtractor(fileType)
    return await extractor.extract(buffer, originalName)
  }

  /**
   * Controlled end-to-end processing pipeline: Extraction -> Chunking -> Vector Embedding (Atomic)
   */
  async processDocument(documentId: string, force: boolean = false): Promise<DocumentExtractionResult> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      throw new AppError("Document not found for processing.", 404)
    }

    // Atomic SQL claim: Only one process can transition UPLOADED/FAILED -> PROCESSING
    if (!force) {
      const claim = await prisma.document.updateMany({
        where: {
          id: documentId,
          status: { in: ["UPLOADED", "FAILED"] },
        },
        data: {
          status: "PROCESSING",
          errorMessage: null,
        },
      })

      if (claim.count === 0) {
        console.log(
          `[DocumentExtractionService] Document ${documentId} is already processing or ready. Skipping duplicate trigger.`
        )
        return {
          documentType: document.fileType,
          pageCount: document.pageCount || 1,
          pages: [],
          sections: [],
          fullText: "",
          characterCount: 0,
          wordCount: 0,
          metadata: { extractedAt: new Date().toISOString() },
        }
      }
    } else {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: "PROCESSING",
          errorMessage: null,
        },
      })
    }

    try {
      // 1. Read stored file from storage service
      const fileBuffer = await storageService.readFile(document.storagePath)

      // 2. Perform text extraction
      const extractionResult = await this.extractFromBuffer(
        fileBuffer,
        document.fileType,
        document.originalName
      )

      // 3. Update document with extracted pageCount
      await prisma.document.update({
        where: { id: documentId },
        data: {
          pageCount: extractionResult.pageCount,
        },
      })

      console.log(
        `[DocumentExtractionService] Extracted ${extractionResult.wordCount} words across ${extractionResult.pageCount} page(s) for "${document.title}" (${document.id})`
      )

      // 4. Smart Document Chunking & Vector Embedding (Phases 6 & 7)
      await documentChunkingService.processAndStoreChunks(
        document.id,
        document.userId,
        extractionResult
      )

      return extractionResult
    } catch (err: any) {
      const userFriendlyError =
        err instanceof AppError
          ? err.message
          : "Unable to process and index this document. Please verify the file format."

      console.error(
        `[DocumentExtractionService] Processing failed for document ${documentId}:`,
        err.message
      )

      // Mark document as FAILED in database
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: "FAILED",
          errorMessage: userFriendlyError,
        },
      })

      throw new AppError(userFriendlyError, err.statusCode || 422)
    }
  }

  /**
   * Reprocesses a document (e.g. from failed state)
   */
  async reprocessDocument(userId: string, documentId: string): Promise<DocumentExtractionResult> {
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    })

    if (!document) {
      throw new AppError("Document not found or unauthorized.", 404)
    }

    return await this.processDocument(documentId, true)
  }
}

export const documentExtractionService = new DocumentExtractionService()
