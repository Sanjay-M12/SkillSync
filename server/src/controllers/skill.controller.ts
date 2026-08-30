import { Request, Response, NextFunction } from "express"
import { learningService } from "../services/learning.service"
import { sendSuccess } from "../utils/apiResponse"
import { AppError } from "../utils/appError"

export async function createSkill(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const skill = await learningService.createSkill(
      req.user.id,
      req.params.goalId,
      req.body
    )
    sendSuccess(res, "Skill created successfully", { skill }, 201)
  } catch (error) {
    next(error)
  }
}

export async function getSkills(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const skills = await learningService.getSkillsByGoal(
      req.user.id,
      req.params.goalId
    )
    sendSuccess(res, "Skills retrieved successfully", { skills }, 200)
  } catch (error) {
    next(error)
  }
}

export async function updateSkill(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    const skill = await learningService.updateSkill(
      req.user.id,
      req.params.id,
      req.body
    )
    sendSuccess(res, "Skill updated successfully", { skill }, 200)
  } catch (error) {
    next(error)
  }
}

export async function deleteSkill(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required.", 401)
    }

    await learningService.deleteSkill(req.user.id, req.params.id)
    sendSuccess(res, "Skill deleted successfully", undefined, 200)
  } catch (error) {
    next(error)
  }
}
