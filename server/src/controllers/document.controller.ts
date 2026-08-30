import { Request, Response, NextFunction } from "express"
import { documentService } from "../services/document.service"
import { AppError } from "../utils/appError"

export class DocumentController {
  async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required.", 401)
      }
      if (!req.file) {
        throw new AppError("Please attach a file to upload.", 400)
      }

      const customTitle = req.body?.title as string | undefined
      const document = await documentService.uploadDocument(
        req.user.id,
        req.file,
        customTitle
      )

      res.status(201).json({
        success: true,
        data: document,
        message: "Document uploaded successfully. Text extraction initialized.",
      })
    } catch (error) {
      next(error)
    }
  }

  async listDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required.", 401)
      }

      const documents = await documentService.getUserDocuments(req.user.id)

      res.json({
        success: true,
        data: documents,
      })
    } catch (error) {
      next(error)
    }
  }

  async getDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required.", 401)
      }

      const { id } = req.params
      if (!id) {
        throw new AppError("Document ID is required.", 400)
      }

      const document = await documentService.getDocumentById(req.user.id, id)

      res.json({
        success: true,
        data: document,
      })
    } catch (error) {
      next(error)
    }
  }

  async reprocessDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required.", 401)
      }

      const { id } = req.params
      if (!id) {
        throw new AppError("Document ID is required.", 400)
      }

      const document = await documentService.reprocessDocument(req.user.id, id)

      res.json({
        success: true,
        data: document,
        message: "Document text extraction reprocessed successfully.",
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required.", 401)
      }

      const { id } = req.params
      if (!id) {
        throw new AppError("Document ID is required.", 400)
      }

      const result = await documentService.deleteDocument(req.user.id, id)

      res.json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const documentController = new DocumentController()
