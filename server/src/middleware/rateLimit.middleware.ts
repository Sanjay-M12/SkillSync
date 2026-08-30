import { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/appError"

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Periodic cleanup of stale IP records every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, CLEANUP_INTERVAL).unref()

export interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  message?: string
}

export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    message = "Too many requests. Please try again later.",
  } = options

  return (req: Request, _res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || "unknown-ip"
    const key = `${req.baseUrl}${req.path}:${ip}`
    const now = Date.now()

    const record = rateLimitStore.get(key)

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      return next()
    }

    if (record.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000)
      _res.setHeader("Retry-After", String(retryAfterSeconds))
      throw new AppError(message, 429)
    }

    record.count += 1
    next()
  }
}

// Development-friendly auth rate limiter: 50 requests per 15 minutes per IP
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 50,
  message: "Too many authentication attempts. Please try again in 15 minutes.",
})
