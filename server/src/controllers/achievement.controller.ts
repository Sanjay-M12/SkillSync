import { Request, Response, NextFunction } from "express"
import { achievementService } from "../services/achievement.service"
import { sendSuccess } from "../utils/apiResponse"
import { AppError } from "../utils/appError"

export async function getAchievements(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const userId = req.user.id
    const data = await achievementService.evaluateAndGetAchievements(userId)
    sendSuccess(res, "Achievements retrieved and updated successfully", data, 200)
  } catch (error) {
    next(error)
  }
}

