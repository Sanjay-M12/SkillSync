import fs from "fs/promises"
import fsSync from "fs"
import path from "path"
import crypto from "crypto"

export interface StoredFileResult {
  storedFilename: string
  storagePath: string
  fileSize: number
}

export interface IStorageService {
  saveFile(
    userId: string,
    originalName: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<StoredFileResult>
  deleteFile(storagePath: string): Promise<boolean>
  readFile(storagePath: string): Promise<Buffer>
  fileExists(storagePath: string): Promise<boolean>
}

export class LocalStorageService implements IStorageService {
  private baseUploadDir: string

  constructor(customBaseDir?: string) {
    this.baseUploadDir =
      customBaseDir ||
      path.resolve(process.cwd(), "uploads", "documents")

    // Ensure base directory exists on initialization
    if (!fsSync.existsSync(this.baseUploadDir)) {
      fsSync.mkdirSync(this.baseUploadDir, { recursive: true })
    }
  }

  /**
   * Sanitizes extension from original filename
   */
  private getSafeExtension(originalName: string): string {
    const rawExt = path.extname(originalName).toLowerCase()
    const sanitized = rawExt.replace(/[^a-z0-9.]/g, "")
    if ([".pdf", ".txt", ".md"].includes(sanitized)) {
      return sanitized
    }
    return ".bin"
  }

  /**
   * Validates that target path is within the allowed base upload directory (prevents path traversal)
   */
  private validatePathWithinBase(targetPath: string): void {
    const resolvedTarget = path.resolve(targetPath)
    const resolvedBase = path.resolve(this.baseUploadDir)

    if (!resolvedTarget.startsWith(resolvedBase)) {
      throw new Error("Security Exception: Path traversal attempt detected.")
    }
  }

  /**
   * Saves uploaded buffer to user-isolated directory with a secure, unique filename
   */
  async saveFile(
    userId: string,
    originalName: string,
    buffer: Buffer,
    _mimeType: string
  ): Promise<StoredFileResult> {
    // Sanitize user directory name
    const safeUserSubdir = userId.replace(/[^a-zA-Z0-9_-]/g, "")
    const userDirPath = path.join(this.baseUploadDir, safeUserSubdir)
    this.validatePathWithinBase(userDirPath)

    // Ensure user directory exists
    await fs.mkdir(userDirPath, { recursive: true })

    // Generate safe unique filename: <timestamp>_<randomHex><safeExt>
    const ext = this.getSafeExtension(originalName)
    const randomSuffix = crypto.randomBytes(8).toString("hex")
    const storedFilename = `doc_${Date.now()}_${randomSuffix}${ext}`

    const storagePath = path.join(userDirPath, storedFilename)
    this.validatePathWithinBase(storagePath)

    // Write file to disk
    await fs.writeFile(storagePath, buffer)

    return {
      storedFilename,
      storagePath,
      fileSize: buffer.length,
    }
  }

  /**
   * Deletes a file from storage safely
   */
  async deleteFile(storagePath: string): Promise<boolean> {
    try {
      this.validatePathWithinBase(storagePath)
      const exists = await this.fileExists(storagePath)
      if (exists) {
        await fs.unlink(storagePath)
        return true
      }
      return false
    } catch (err: any) {
      console.warn(`[LocalStorageService] Could not delete file at "${storagePath}":`, err.message)
      return false
    }
  }

  /**
   * Reads a file buffer from storage
   */
  async readFile(storagePath: string): Promise<Buffer> {
    this.validatePathWithinBase(storagePath)
    return await fs.readFile(storagePath)
  }

  /**
   * Checks if file exists
   */
  async fileExists(storagePath: string): Promise<boolean> {
    try {
      this.validatePathWithinBase(storagePath)
      await fs.access(storagePath)
      return true
    } catch {
      return false
    }
  }
}

export const storageService: IStorageService = new LocalStorageService()
