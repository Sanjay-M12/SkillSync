import jwt from "jsonwebtoken"
import { config } from "../config/env"
import { JwtPayload } from "../types/auth.types"
import { AppError } from "./appError"

export function signJwt(userId: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signOptions: any = {
    expiresIn: config.JWT_EXPIRES_IN,
  }

  return jwt.sign({ userId }, config.JWT_SECRET, signOptions)
}

export function verifyJwt(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload
    if (!decoded || typeof decoded !== "object" || !decoded.userId) {
      throw new AppError("Invalid or malformed authentication token.", 401)
    }
    return decoded
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Authentication token has expired. Please log in again.", 401)
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid authentication token.", 401)
    }
    throw new AppError("Authentication token verification failed.", 401)
  }
}
