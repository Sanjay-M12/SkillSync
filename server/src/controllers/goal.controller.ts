import { Request, Response, NextFunction } from "express"
import { goalService } from "../services/goal.service"
import { sendSuccess } from "../utils/apiResponse"
import { AppError } from "../utils/appError"

export async function createGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const goal = await goalService.createGoal(req.user.id, req.body)
    sendSuccess(res, "Learning goal created successfully", { goal }, 201)
  } catch (error) {
    next(error)
  }
}

export async function getGoals(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const goals = await goalService.getGoalsByUser(req.user.id)
    sendSuccess(res, "Learning goals retrieved successfully", { goals }, 200)
  } catch (error) {
    next(error)
  }
}

export async function getGoalById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const goal = await goalService.getGoalById(req.user.id, req.params.id)
    sendSuccess(res, "Learning goal retrieved successfully", { goal }, 200)
  } catch (error) {
    next(error)
  }
}

export async function updateGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const goal = await goalService.updateGoal(req.user.id, req.params.id, req.body)
    sendSuccess(res, "Learning goal updated successfully", { goal }, 200)
  } catch (error) {
    next(error)
  }
}

export async function deleteGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    await goalService.deleteGoal(req.user.id, req.params.id)
    sendSuccess(res, "Learning goal deleted successfully", undefined, 200)
  } catch (error) {
    next(error)
  }
}
