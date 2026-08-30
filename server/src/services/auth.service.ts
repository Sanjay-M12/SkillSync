import { prisma } from "../config/prisma"
import { AppError } from "../utils/appError"
import { hashPassword, comparePassword } from "../utils/password"
import { signJwt } from "../utils/jwt"
import { RegisterInput, LoginInput } from "../schemas/auth.schema"
import { AuthResponseData, SafeUser } from "../types/auth.types"

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
        createdAt: true,
        updatedAt: true,
      },
    })

    // Generate JWT
    const token = signJwt(user.id)

    return {
      user,
      token,
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
    if (!user || !user.passwordHash) {
      throw new AppError("Invalid email or password.", 401)
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return {
      user: safeUser,
      token,
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
        createdAt: true,
        updatedAt: true,
      },
    })

    return updatedUser
  }
}

export const authService = new AuthService()
