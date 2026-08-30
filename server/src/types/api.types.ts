export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  timestamp?: string
}

export interface ApiErrorResponse {
  success: false
  message: string
  error?: string
  stack?: string
}
