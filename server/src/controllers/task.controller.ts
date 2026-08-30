import { Request, Response, NextFunction } from "express"
import { learningService } from "../services/learning.service"
import { sendSuccess } from "../utils/apiResponse"
import { AppError } from "../utils/appError"

export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const task = await learningService.createTask(
      req.user.id,
      req.params.topicId,
      req.body
    )
    sendSuccess(res, "Task created successfully", { task }, 201)
  } catch (error) {
    next(error)
  }
}

export async function getTasks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const tasks = await learningService.getTasksByTopic(
      req.user.id,
      req.params.topicId
    )
    sendSuccess(res, "Tasks retrieved successfully", { tasks }, 200)
  } catch (error) {
    next(error)
  }
}

export async function updateTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const task = await learningService.updateTask(
      req.user.id,
      req.params.id,
      req.body
    )
    sendSuccess(res, "Task updated successfully", { task }, 200)
  } catch (error) {
    next(error)
  }
}

export async function deleteTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    await learningService.deleteTask(req.user.id, req.params.id)
    sendSuccess(res, "Task deleted successfully", undefined, 200)
  } catch (error) {
    next(error)
  }
}

export async function updateTaskCompletion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const task = await learningService.updateTaskCompletion(
      req.user.id,
      req.params.id,
      req.body.completed
    )
    sendSuccess(
      res,
      req.body.completed ? "Task marked as completed" : "Task marked as incomplete",
      { task },
      200
    )
  } catch (error) {
    next(error)
  }
}
