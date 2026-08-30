import path from "path"
import { prisma } from "../config/prisma"
import { storageService } from "./storage.service"
import { documentExtractionService } from "./extraction"
import { AppError } from "../utils/appError"
import { DocumentStatus, DocumentType } from "@prisma/client"

export interface SafeDocumentDto {
  id: string
  title: string
  originalName: string
  fileType: DocumentType
  mimeType: string
  fileSize: number
  status: DocumentStatus
  errorMessage?: string | null
  totalChunks: number
  pageCount?: number | null
  createdAt: Date
  updatedAt: Date
}

export class DocumentService {
  /**
   * Resolves DocumentType from original filename extension
   */
  private resolveFileType(originalName: string): DocumentType {
    const ext = path.extname(originalName).toLowerCase()
    switch (ext) {
      case ".pdf":
        return "PDF"
      case ".md":
        return "MD"
      case ".txt":
        return "TXT"
      default:
        return "TXT"
    }
  }

  /**
   * Sanitizes user-facing document title
   */
  private resolveTitle(originalName: string, customTitle?: string): string {
    if (customTitle && customTitle.trim()) {
      return customTitle.trim().slice(0, 150)
    }
    const nameWithoutExt = path.basename(originalName, path.extname(originalName))
    return nameWithoutExt.trim().slice(0, 150) || "Untitled Document"
  }

  /**
   * Uploads, stores, and triggers controlled text extraction
   */
  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    customTitle?: string
  ): Promise<SafeDocumentDto> {
    const fileType = this.resolveFileType(file.originalname)
    const title = this.resolveTitle(file.originalname, customTitle)

    // 1. Store file in storage service
    const stored = await storageService.saveFile(
      userId,
      file.originalname,
      file.buffer,
      file.mimetype
    )

    try {
      // 2. Persist Document record in database with initial status UPLOADED
      const document = await prisma.document.create({
        data: {
          userId,
          title,
          originalName: file.originalname,
          storedFilename: stored.storedFilename,
          fileType,
          mimeType: file.mimetype || "application/octet-stream",
          fileSize: stored.fileSize,
          storagePath: stored.storagePath,
          status: "UPLOADED",
          totalChunks: 0,
        },
        select: {
          id: true,
          title: true,
          originalName: true,
          fileType: true,
          mimeType: true,
          fileSize: true,
          status: true,
          errorMessage: true,
          totalChunks: true,
          pageCount: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      // 3. Trigger text extraction in background without blocking response
      setImmediate(() => {
        documentExtractionService.processDocument(document.id).catch((err) => {
          console.error(
            `[DocumentService] Async extraction failed for document ${document.id}:`,
            err.message
          )
        })
      })

      return document
    } catch (dbError: any) {
      // 4. Rollback: Delete physical file if database record creation fails
      console.error(
        `[DocumentService] Failed to create database record for user ${userId}. Rolling back stored file:`,
        dbError.message
      )
      await storageService.deleteFile(stored.storagePath)
      throw new AppError("Failed to register uploaded document in database.", 500)
    }
  }

  /**
   * Retrieves all documents owned by the authenticated user
   */
  async getUserDocuments(userId: string): Promise<SafeDocumentDto[]> {
    return await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        originalName: true,
        fileType: true,
        mimeType: true,
        fileSize: true,
        status: true,
        errorMessage: true,
        totalChunks: true,
        pageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  /**
   * Retrieves a single document by ID, enforcing user ownership
   */
  async getDocumentById(userId: string, documentId: string): Promise<SafeDocumentDto> {
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
      select: {
        id: true,
        title: true,
        originalName: true,
        fileType: true,
        mimeType: true,
        fileSize: true,
        status: true,
        errorMessage: true,
        totalChunks: true,
        pageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!document) {
      throw new AppError("Document not found.", 404)
    }

    return document
  }

  /**
   * Manually triggers reprocessing / text extraction for a document
   */
  async reprocessDocument(userId: string, documentId: string): Promise<SafeDocumentDto> {
    const document = await this.getDocumentById(userId, documentId)
    await documentExtractionService.reprocessDocument(userId, document.id)
    return await this.getDocumentById(userId, documentId)
  }

  /**
   * Deletes a document, cleaning up both storage file and database records
   */
  async deleteDocument(userId: string, documentId: string): Promise<{ success: boolean; message: string }> {
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    })

    if (!document) {
      throw new AppError("Document not found.", 404)
    }

    // 1. Delete stored physical file
    await storageService.deleteFile(document.storagePath)

    // 2. Delete database record (cascades to document_chunks)
    await prisma.document.delete({
      where: { id: documentId },
    })

    return {
      success: true,
      message: "Document deleted successfully.",
    }
  }
}

export const documentService = new DocumentService()
