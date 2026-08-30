import { Router } from "express"
import { requireAuth } from "../middleware/auth.middleware"
import { getDailyPlan } from "../controllers/planner.controller"

export const plannerRouter = Router()

plannerRouter.use(requireAuth)

// GET /api/planner/today — Retrieve smart daily learning plan
plannerRouter.get("/today", getDailyPlan)

export default plannerRouter
