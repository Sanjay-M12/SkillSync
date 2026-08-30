import { Request, Response, NextFunction } from "express"
import { streakService } from "../services/streak.service"
import { sendSuccess } from "../utils/apiResponse"
import { AppError } from "../utils/appError"

export async function getStreak(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const userId = req.user.id
    const clientDate = req.query.date as string | undefined
    const targetWeeklyHours = req.query.targetWeeklyHours
      ? parseInt(req.query.targetWeeklyHours as string, 10)
      : 10

    const data = await streakService.getStreakData(userId, targetWeeklyHours, clientDate)
    sendSuccess(res, "Streak and consistency data retrieved successfully", data, 200)
  } catch (error) {
    next(error)
  }
}

export async function recordManualActivity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const userId = req.user.id
    const { tasksDelta, minutesDelta, date } = req.body

    const activity = await streakService.recordActivity(
      userId,
      Number(tasksDelta) || 0,
      Number(minutesDelta) || 0,
      date
    )

    sendSuccess(res, "Daily activity recorded successfully", activity, 200)
  } catch (error) {
    next(error)
  }
}

