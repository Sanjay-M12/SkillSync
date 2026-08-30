import multer from "multer"
import { Request, Response, NextFunction } from "express"
import path from "path"
import { AppError } from "../utils/appError"

// Maximum allowed size: 10 MB
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

const ALLOWED_EXTENSIONS = [".pdf", ".txt", ".md"]
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/x-markdown",
]

// Use MemoryStorage so we can inspect magic bytes before persisting to storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    
    // 1. Validate extension
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(
        new AppError(
          `Unsupported file extension "${ext}". Allowed types are: .pdf, .txt, .md`,
          400
        )
      )
    }

    // 2. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype) && file.mimetype !== "application/octet-stream") {
      return cb(
        new AppError(
          `Invalid MIME type "${file.mimetype}". Allowed types are: PDF, Text, Markdown.`,
          400
        )
      )
    }

    cb(null, true)
  },
})

/**
 * Validates file signature / magic bytes to prevent masqueraded files
 */
export function validateFileMagicBytes(buffer: Buffer, originalName: string): void {
  const ext = path.extname(originalName).toLowerCase()

  if (ext === ".pdf") {
    // PDF magic bytes: %PDF- (0x25 0x50 0x44 0x46)
    if (buffer.length < 4) {
      throw new AppError("Corrupted or empty PDF file.", 400)
    }
    const header = buffer.subarray(0, 4).toString("ascii")
    if (!header.startsWith("%PDF")) {
      throw new AppError("Invalid PDF file: File signature does not match PDF standard.", 400)
    }
  } else if (ext === ".txt" || ext === ".md") {
    // Text / Markdown inspection: scan initial slice for null bytes (0x00)
    const checkLength = Math.min(buffer.length, 1024)
    for (let i = 0; i < checkLength; i++) {
      if (buffer[i] === 0x00) {
        throw new AppError("Invalid text file: File contains binary data.", 400)
      }
    }
  }
}

/**
 * Express middleware for single document upload
 */
export function uploadSingleDocument(req: Request, res: Response, next: NextFunction): void {
  const uploadHandler = upload.single("file")

  uploadHandler(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new AppError("File is too large. Maximum allowed size is 10 MB.", 400)
          )
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return next(
            new AppError("Unexpected form field. Please upload under the field name 'file'.", 400)
          )
        }
        return next(new AppError(`Upload error: ${err.message}`, 400))
      }
      return next(err)
    }

    if (!req.file) {
      return next(new AppError("No file provided. Please attach a .pdf, .txt, or .md file.", 400))
    }

    try {
      // Validate magic bytes
      validateFileMagicBytes(req.file.buffer, req.file.originalname)
      next()
    } catch (validationErr) {
      next(validationErr)
    }
  })
}
