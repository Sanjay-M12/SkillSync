import { Router } from "express"
import { requireAuth } from "../middleware/auth.middleware"
import { getAchievements } from "../controllers/achievement.controller"

export const achievementRouter = Router()

achievementRouter.use(requireAuth)

// GET /api/achievements — Retrieve achievements catalog with unlocked status
achievementRouter.get("/", getAchievements)

export default achievementRouter
