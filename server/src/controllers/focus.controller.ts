import { Request, Response, NextFunction } from "express"
import { focusService } from "../services/focus.service"
import { sendSuccess } from "../utils/apiResponse"
import { AppError } from "../utils/appError"

export async function logFocusSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const userId = req.user.id
    const { durationMinutes, taskId, topicId } = req.body

    const session = await focusService.logSession(userId, {
      durationMinutes: Number(durationMinutes) || 25,
      taskId,
      topicId,
    })

    sendSuccess(res, "Focus session logged successfully", session, 201)
  } catch (error) {
    next(error)
  }
}

export async function getFocusStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const userId = req.user.id
    const stats = await focusService.getFocusStats(userId)
    sendSuccess(res, "Focus stats retrieved successfully", stats, 200)
  } catch (error) {
    next(error)
  }
}

