import { OAuth2Client } from "google-auth-library"
import { prisma } from "../config/prisma"
import { config } from "../config/env"
import { AppError } from "../utils/appError"
import { hashPassword, comparePassword } from "../utils/password"
import { signJwt } from "../utils/jwt"
import { RegisterInput, LoginInput } from "../schemas/auth.schema"
import { AuthResponseData, SafeUser } from "../types/auth.types"

const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID || undefined)

export class AuthService {
  /**
   * Registers a new user account with hashed password and generates a JWT.
   */
  async registerUser(input: RegisterInput): Promise<AuthResponseData> {
    const normalizedEmail = input.email.trim().toLowerCase()

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      throw new AppError("An account with this email already exists.", 409)
    }

    // Hash password
    const passwordHash = await hashPassword(input.password)

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        googleId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Generate JWT
    const token = signJwt(user.id)

    return {
      user,
      token,
      isNewUser: true,
    }
  }

  /**
   * Validates user credentials and returns safe user data and a JWT.
   */
  async loginUser(input: LoginInput): Promise<AuthResponseData> {
    const normalizedEmail = input.email.trim().toLowerCase()

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // Generic error to avoid account enumeration
    if (!user) {
      throw new AppError("Invalid email or password.", 401)
    }

    // Check if account is OAuth-only (no password set)
    if (!user.passwordHash) {
      throw new AppError(
        "This account was registered with Google. Please use 'Sign in with Google' to continue.",
        400
      )
    }

    // Compare password hash
    const isPasswordValid = await comparePassword(input.password, user.passwordHash)
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password.", 401)
    }

    // Generate JWT
    const token = signJwt(user.id)

    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      googleId: user.googleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return {
      user: safeUser,
      token,
      isNewUser: false,
    }
  }

  /**
   * Verifies Google ID token and logs in or creates user account.
   */
  async authenticateWithGoogle(credential: string): Promise<AuthResponseData> {
    if (!credential) {
      throw new AppError("Google credential token is required.", 400)
    }

    let payload
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: config.GOOGLE_CLIENT_ID ? config.GOOGLE_CLIENT_ID : undefined,
      })
      payload = ticket.getPayload()
    } catch (err: any) {
      throw new AppError(
        `Failed to verify Google token: ${err?.message || "Invalid or expired token"}`,
        401
      )
    }

    if (!payload || !payload.email) {
      throw new AppError("Google account token does not contain a verified email address.", 400)
    }

    const googleId = payload.sub
    const email = payload.email.trim().toLowerCase()
    const name = payload.name || payload.given_name || email.split("@")[0]
    const avatarUrl = payload.picture || null

    // Search for user by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
    })

    let isNewUser = false

    if (user) {
      // If user exists, link Google ID and update avatarUrl if missing
      const updateData: { googleId?: string; avatarUrl?: string; name?: string } = {}
      if (!user.googleId) {
        updateData.googleId = googleId
      }
      if (!user.avatarUrl && avatarUrl) {
        updateData.avatarUrl = avatarUrl
      }
      if (!user.name && name) {
        updateData.name = name
      }

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        })
      }
    } else {
      // Create new Google-authenticated user
      isNewUser = true
      user = await prisma.user.create({
        data: {
          name,
          email,
          googleId,
          avatarUrl,
          passwordHash: null,
        },
      })
    }

    // Generate SkillSync session JWT
    const token = signJwt(user.id)

    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      googleId: user.googleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return {
      user: safeUser,
      token,
      isNewUser,
    }
  }

  /**
   * Retrieves safe user identity by userId.
   */
  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        googleId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new AppError("User not found or session expired.", 404)
    }

    return user
  }

  /**
   * Updates user profile (name, avatarUrl).
   */
  async updateUserProfile(
    userId: string,
    data: { name?: string; avatarUrl?: string | null }
  ): Promise<SafeUser> {
    const updateData: { name?: string; avatarUrl?: string | null } = {}

    if (data.name !== undefined) {
      updateData.name = data.name.trim()
    }
    if (data.avatarUrl !== undefined) {
      updateData.avatarUrl = data.avatarUrl
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        googleId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return updatedUser
  }
}

export const authService = new AuthService()
