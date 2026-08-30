import { Router } from "express"
import { getAnalytics } from "../controllers/analytics.controller"
import { requireAuth } from "../middleware/auth.middleware"

export const analyticsRouter = Router()

// All analytics routes require authentication
analyticsRouter.use(requireAuth)

analyticsRouter.get("/", getAnalytics)

export default analyticsRouter
