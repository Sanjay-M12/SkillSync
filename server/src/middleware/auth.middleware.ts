import { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/appError"
import { verifyJwt } from "../utils/jwt"
import { prisma } from "../config/prisma"
import { SafeUser } from "../types/auth.types"

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required. Please provide a Bearer token.", 401)
    }

    const token = authHeader.substring(7).trim()
    if (!token) {
      throw new AppError("Authentication required. Bearer token is empty.", 401)
    }

    // Verify JWT and extract payload
    const payload = verifyJwt(token)

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new AppError("User account no longer exists. Please log in again.", 401)
    }

    // Attach safe user identity to request
    req.user = user as SafeUser
    next()
  } catch (error) {
    next(error)
  }
}
