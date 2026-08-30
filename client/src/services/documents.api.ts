import { apiClient, ApiResponse } from "./api-client"
import { TOKEN_STORAGE_KEY } from "@/lib/api"
import type { KnowledgeDocument } from "@/features/knowledge/knowledge.types"

export class DocumentsApi {
  private baseUrl: string

  constructor(baseUrl: string = import.meta.env.VITE_API_URL || "/api") {
    this.baseUrl = baseUrl
  }

  /**
   * Retrieves all learning documents owned by authenticated user
   */
  async listDocuments(): Promise<KnowledgeDocument[]> {
    const res = await apiClient.get<ApiResponse<KnowledgeDocument[]>>("/documents")
    return res.data || []
  }

  /**
   * Retrieves a single document by ID
   */
  async getDocument(id: string): Promise<KnowledgeDocument> {
    const res = await apiClient.get<ApiResponse<KnowledgeDocument>>(`/documents/${id}`)
    if (!res.data) {
      throw new Error(res.error || "Document not found.")
    }
    return res.data
  }

  /**
   * Uploads a learning document using multipart form data
   */
  async uploadDocument(file: File, title?: string): Promise<KnowledgeDocument> {
    const formData = new FormData()
    formData.append("file", file)
    if (title && title.trim()) {
      formData.append("title", title.trim())
    }

    const token =
      localStorage.getItem(TOKEN_STORAGE_KEY) ||
      localStorage.getItem("skillsync_auth_token")

    const headers: Record<string, string> = {}
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const url = `${this.baseUrl}/documents/upload`
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    })

    const result = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(result.error || result.message || `Upload failed (${response.status})`)
    }

    return result.data as KnowledgeDocument
  }

  /**
   * Triggers text extraction reprocessing for a document
   */
  async reprocessDocument(id: string): Promise<KnowledgeDocument> {
    const res = await apiClient.post<ApiResponse<KnowledgeDocument>>(`/documents/${id}/reprocess`)
    if (!res.data) {
      throw new Error(res.error || "Reprocess failed.")
    }
    return res.data
  }

  /**
   * Deletes a document by ID
   */
  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<{ message: string }>>(`/documents/${id}`)
  }
}

export const documentsApi = new DocumentsApi()
