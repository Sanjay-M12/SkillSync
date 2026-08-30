import { Request, Response, NextFunction, ErrorRequestHandler } from "express"
import { AppError } from "../utils/appError"
import { config } from "../config/env"
import { ApiErrorResponse } from "../types/api.types"

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode = 500
  let message = "Internal Server Error"

  if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
  } else if (err.name === "PrismaClientInitializationError") {
    statusCode = 503
    message = "Database service unavailable. Please ensure PostgreSQL is running."
  } else if (err.name === "PrismaClientKnownRequestError") {
    statusCode = 400
    message = "Database request rejected due to constraint violation."
  } else if (err.message && err.message.includes("CORS")) {
    statusCode = 403
    message = "Origin blocked by CORS security policy."
  } else if (err instanceof Error) {
    // In production, mask unhandled 500 exceptions to prevent internal leaks
    message =
      config.NODE_ENV === "production"
        ? "An unexpected internal error occurred."
        : err.message || "An unexpected error occurred."
  }

  if (config.NODE_ENV === "development") {
    console.error("❌ Error caught in errorHandler:", err.message)
  }

  const responseBody: ApiErrorResponse = {
    success: false,
    message,
    ...(config.NODE_ENV === "development" && { stack: err.stack }),
  }

  res.status(statusCode).json(responseBody)
}
