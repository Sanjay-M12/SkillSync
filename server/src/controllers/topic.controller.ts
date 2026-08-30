import { Request, Response, NextFunction } from "express"
import { learningService } from "../services/learning.service"
import { sendSuccess } from "../utils/apiResponse"
import { AppError } from "../utils/appError"

export async function createTopic(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const topic = await learningService.createTopic(
      req.user.id,
      req.params.skillId,
      req.body
    )
    sendSuccess(res, "Topic created successfully", { topic }, 201)
  } catch (error) {
    next(error)
  }
}

export async function getTopics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const topics = await learningService.getTopicsBySkill(
      req.user.id,
      req.params.skillId
    )
    sendSuccess(res, "Topics retrieved successfully", { topics }, 200)
  } catch (error) {
    next(error)
  }
}

export async function updateTopic(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const topic = await learningService.updateTopic(
      req.user.id,
      req.params.id,
      req.body
    )
    sendSuccess(res, "Topic updated successfully", { topic }, 200)
  } catch (error) {
    next(error)
  }
}

export async function deleteTopic(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    await learningService.deleteTopic(req.user.id, req.params.id)
    sendSuccess(res, "Topic deleted successfully", undefined, 200)
  } catch (error) {
    next(error)
  }
}
