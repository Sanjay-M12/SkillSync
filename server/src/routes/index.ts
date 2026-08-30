import { Router } from "express"
import { healthRouter } from "./health.routes"
import { authRouter } from "./auth.routes"
import { goalRouter } from "./goal.routes"
import { skillRouter } from "./skill.routes"
import { topicRouter } from "./topic.routes"
import { taskRouter } from "./task.routes"
import { dashboardRouter } from "./dashboard.routes"
import { analyticsRouter } from "./analytics.routes"
import { streakRouter } from "./streak.routes"
import { plannerRouter } from "./planner.routes"
import { achievementRouter } from "./achievement.routes"
import { focusRouter } from "./focus.routes"
import { documentRouter } from "./document.routes"
import { ragRouter } from "./rag.routes"

export const apiRouter = Router()

// Register all API sub-routers
apiRouter.use("/health", healthRouter)
apiRouter.use("/auth", authRouter)
apiRouter.use("/goals", goalRouter)
apiRouter.use("/skills", skillRouter)
apiRouter.use("/topics", topicRouter)
apiRouter.use("/tasks", taskRouter)
apiRouter.use("/dashboard", dashboardRouter)
apiRouter.use("/analytics", analyticsRouter)
apiRouter.use("/streak", streakRouter)
apiRouter.use("/planner", plannerRouter)
apiRouter.use("/achievements", achievementRouter)
apiRouter.use("/focus", focusRouter)
apiRouter.use("/documents", documentRouter)
apiRouter.use("/rag", ragRouter)

export default apiRouter
