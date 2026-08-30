import { Router } from "express"
import { requireAuth } from "../middleware/auth.middleware"
import { uploadSingleDocument } from "../middleware/upload.middleware"
import { documentController } from "../controllers/document.controller"

export const documentRouter = Router()

// All document routes require authentication
documentRouter.use(requireAuth)

// Document CRUD & Upload endpoints
documentRouter.post(
  "/upload",
  uploadSingleDocument,
  documentController.uploadDocument.bind(documentController)
)

documentRouter.get(
  "/",
  documentController.listDocuments.bind(documentController)
)

documentRouter.get(
  "/:id",
  documentController.getDocument.bind(documentController)
)

documentRouter.post(
  "/:id/reprocess",
  documentController.reprocessDocument.bind(documentController)
)

documentRouter.delete(
  "/:id",
  documentController.deleteDocument.bind(documentController)
)

export default documentRouter
