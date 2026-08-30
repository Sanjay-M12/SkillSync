import { Request, Response, NextFunction } from "express"
import { analyticsService } from "../services/analytics.service"
import { sendSuccess } from "../utils/apiResponse"
import { AppError } from "../utils/appError"

export async function getAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const data = await analyticsService.getAnalyticsData(req.user.id)
    sendSuccess(res, "Analytics data retrieved successfully", data, 200)
  } catch (error) {
    next(error)
  }
}

export async function getGoalProgress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const data = await analyticsService.getSingleGoalProgress(
      req.user.id,
      req.params.id
    )
    sendSuccess(res, "Goal progress retrieved successfully", data, 200)
  } catch (error) {
    next(error)
  }
}
