import { Request, Response, NextFunction } from "express"
import { learningService } from "../services/learning.service"
import { sendSuccess } from "../utils/apiResponse"
import { AppError } from "../utils/appError"

export async function getLearningHierarchy(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const hierarchy = await learningService.getGoalHierarchy(
      req.user.id,
      req.params.goalId
    )
    sendSuccess(res, "Learning hierarchy retrieved successfully", { goal: hierarchy }, 200)
  } catch (error) {
    next(error)
  }
}
