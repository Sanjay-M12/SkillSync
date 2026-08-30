import { Router } from "express"
import {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
} from "../controllers/goal.controller"
import { createSkill, getSkills } from "../controllers/skill.controller"
import { getLearningHierarchy } from "../controllers/learning.controller"
import { getGoalProgress } from "../controllers/analytics.controller"
import { requireAuth } from "../middleware/auth.middleware"
import { validate } from "../middleware/validate.middleware"
import { createGoalSchema, updateGoalSchema } from "../schemas/goal.schema"
import { createSkillSchema } from "../schemas/learning.schema"

export const goalRouter = Router()

// All Goal routes require authentication
goalRouter.use(requireAuth)

// Collection routes
goalRouter.post("/", validate(createGoalSchema), createGoal)
goalRouter.get("/", getGoals)

// Full Learning Hierarchy for a specific goal
goalRouter.get("/:goalId/learning", getLearningHierarchy)

// Derived Goal Progress endpoint
goalRouter.get("/:id/progress", getGoalProgress)

// Nested Skills under Goal
goalRouter.post("/:goalId/skills", validate(createSkillSchema), createSkill)
goalRouter.get("/:goalId/skills", getSkills)

// Individual goal resource routes
goalRouter.get("/:id", getGoalById)
goalRouter.patch("/:id", validate(updateGoalSchema), updateGoal)
goalRouter.delete("/:id", deleteGoal)

export default goalRouter
