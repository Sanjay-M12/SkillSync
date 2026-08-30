import { Request, Response, NextFunction } from "express"
import { authService } from "../services/auth.service"
import { sendSuccess } from "../utils/apiResponse"
import { AppError } from "../utils/appError"

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.registerUser(req.body)
    sendSuccess(res, "Registration successful", result, 201)
  } catch (error) {
    next(error)
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.loginUser(req.body)
    sendSuccess(res, "Login successful", result, 200)
  } catch (error) {
    next(error)
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    sendSuccess(res, "Authenticated user retrieved successfully", { user: req.user }, 200)
  } catch (error) {
    next(error)
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const updatedUser = await authService.updateUserProfile(req.user.id, req.body)
    sendSuccess(res, "Profile updated successfully", { user: updatedUser }, 200)
  } catch (error) {
    next(error)
  }
}
