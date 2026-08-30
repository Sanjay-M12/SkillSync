import { Request, Response, NextFunction } from "express"
import { dashboardService } from "../services/dashboard.service"
import { sendSuccess } from "../utils/apiResponse"
import { AppError } from "../utils/appError"

export async function getDashboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const data = await dashboardService.getDashboardData(req.user.id)
    sendSuccess(res, "Dashboard data retrieved successfully", data, 200)
  } catch (error) {
    next(error)
  }
}
