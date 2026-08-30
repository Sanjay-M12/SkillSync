import { Router } from "express"
import { requireAuth } from "../middleware/auth.middleware"
import { getStreak, recordManualActivity } from "../controllers/streak.controller"

export const streakRouter = Router()

// All streak routes require authentication
streakRouter.use(requireAuth)

// GET /api/streak — Fetch full streak and consistency metrics
streakRouter.get("/", getStreak)

// POST /api/streak/activity — Record manual study activity
streakRouter.post("/activity", recordManualActivity)

export default streakRouter
