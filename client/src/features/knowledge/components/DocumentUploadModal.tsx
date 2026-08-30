import * as React from "react"
import {
  X,
  UploadCloud,
  FileText,
  FileCode,
  FileType,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui"
import { documentsApi } from "@/services/documents.api"
import type { KnowledgeDocument } from "../knowledge.types"
import { cn } from "@/lib/utils"

export interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadSuccess?: (document: KnowledgeDocument) => void
}

const ALLOWED_EXTENSIONS = [".pdf", ".txt", ".md"]
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase()
  if (ext === "pdf") return <FileText className="h-5 w-5 text-rose-500" />
  if (ext === "md") return <FileCode className="h-5 w-5 text-purple-500" />
  return <FileType className="h-5 w-5 text-blue-500" />
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [dragOver, setDragOver] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [customTitle, setCustomTitle] = React.useState("")
  const [validationError, setValidationError] = React.useState<string | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadSuccess, setUploadSuccess] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const resetState = React.useCallback(() => {
    setSelectedFile(null)
    setCustomTitle("")
    setValidationError(null)
    setIsUploading(false)
    setUploadSuccess(false)
    setDragOver(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const handleClose = React.useCallback(() => {
    if (isUploading) return
    resetState()
    onClose()
  }, [isUploading, resetState, onClose])

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isUploading) {
        handleClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isUploading, handleClose])

  // Lock body scroll
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const validateFile = (file: File): boolean => {
    setValidationError(null)
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setValidationError(`Unsupported format "${ext}". Please upload a .pdf, .txt, or .md file.`)
      return false
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(
        `File is too large (${formatBytes(file.size)}). Maximum allowed size is 10 MB.`
      )
      return false
    }
    return true
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        setCustomTitle(file.name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        setCustomTitle(file.name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const handleRemoveFile = () => {
    resetState()
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || isUploading) return

    setIsUploading(true)
    setValidationError(null)

    try {
      const uploadedDoc = await documentsApi.uploadDocument(selectedFile, customTitle)
      setUploadSuccess(true)

      // Notify parent page and close modal smoothly
      setTimeout(() => {
        onUploadSuccess?.(uploadedDoc)
        handleClose()
      }, 700)
    } catch (err: any) {
      setValidationError(err.message || "Failed to upload document. Please try again.")
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div className="space-y-0.5">
            <h2 id="upload-dialog-title" className="text-base font-bold text-foreground sm:text-lg">
              Upload Learning Material
            </h2>
            <p className="text-xs text-muted-foreground">
              Add documents to your personal knowledge base (PDF, Markdown, Text).
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
          {!selectedFile ? (
            /* Drag and Drop Zone */
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Upload file area. Drag and drop file or press to browse."
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                dragOver
                  ? "border-primary bg-primary/10 text-primary scale-[0.99]"
                  : "border-border/80 bg-muted/20 hover:border-primary/60 hover:bg-muted/40"
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UploadCloud className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">
                Drag and drop your file here, or{" "}
                <span className="text-primary hover:underline">browse files</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Supports PDF, Markdown (.md), and Text (.txt) up to 10 MB
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,text/plain,text/markdown,application/pdf"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>
          ) : (
            /* Selected File Preview & Title Input */
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3.5">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {getFileIcon(selectedFile.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatBytes(selectedFile.size)} • Ready to upload
                    </p>
                  </div>
                </div>

                {!isUploading && !uploadSuccess && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    title="Remove selected file"
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label="Remove file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Optional Custom Title input */}
              <div className="space-y-1">
                <label
                  htmlFor="document-title-input"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Document Display Title (Optional)
                </label>
                <input
                  id="document-title-input"
                  type="text"
                  value={customTitle}
                  disabled={isUploading || uploadSuccess}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. React 19 Complete Architecture Guide"
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
              </div>

              {uploadSuccess && (
                <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Document uploaded successfully! Initial status: UPLOADED.</span>
                </div>
              )}
            </div>
          )}

          {/* Validation / Server Error Alert */}
          {validationError && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border/70 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!selectedFile || isUploading || uploadSuccess}
              isLoading={isUploading}
            >
              {isUploading ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading...
                </span>
              ) : uploadSuccess ? (
                "Uploaded!"
              ) : (
                "Upload Document"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DocumentUploadModal
