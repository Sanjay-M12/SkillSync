/**
 * SkillSync Centralized API Client
 * Manages HTTP communication, Bearer authentication headers, and standardized error responses.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export const TOKEN_STORAGE_KEY = "skillsync_token"

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

export class ApiError extends Error {
  status: number
  errors?: Record<string, string>

  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)

  const headers = new Headers(options.headers || {})

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const contentType = response.headers.get("content-type")
    const isJson = contentType && contentType.includes("application/json")
    const data = isJson ? await response.json() : null

    if (!response.ok) {
      const errorMessage =
        data?.message || `Request failed with status ${response.status}`
      const validationErrors = data?.errors || undefined

      // If token is invalid or expired, trigger auth event
      if (response.status === 401 && token) {
        window.dispatchEvent(new CustomEvent("skillsync:unauthorized"))
      }

      throw new ApiError(errorMessage, response.status, validationErrors)
    }

    return data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    // Network or other runtime failure
    throw new ApiError(
      error instanceof Error ? error.message : "Network error. Please check your connection.",
      0
    )
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
}

export default api
