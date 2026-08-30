import { Router } from "express"
import { getDashboard } from "../controllers/dashboard.controller"
import { requireAuth } from "../middleware/auth.middleware"

export const dashboardRouter = Router()

// All dashboard routes require authentication
dashboardRouter.use(requireAuth)

dashboardRouter.get("/", getDashboard)

export default dashboardRouter
