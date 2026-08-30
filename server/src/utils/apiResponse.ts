import { Response } from "express"
import { ApiResponse } from "../types/api.types"

export function sendSuccess<T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): Response<ApiResponse<T>> {
  const responseBody: ApiResponse<T> = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
    ...(data !== undefined && { data }),
  }

  return res.status(statusCode).json(responseBody)
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  })
}
