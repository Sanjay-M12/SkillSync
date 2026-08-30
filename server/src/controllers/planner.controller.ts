import { Request, Response, NextFunction } from "express"
import { plannerService } from "../services/planner.service"
import { sendSuccess } from "../utils/apiResponse"
import { AppError } from "../utils/appError"

export async function getDailyPlan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const userId = req.user.id
    const targetMinutes = req.query.targetMinutes
      ? parseInt(req.query.targetMinutes as string, 10)
      : 60

    const plan = await plannerService.getDailyPlan(userId, targetMinutes)
    sendSuccess(res, "Daily learning plan generated successfully", plan, 200)
  } catch (error) {
    next(error)
  }
}

