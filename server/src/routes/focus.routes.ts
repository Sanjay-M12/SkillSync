import { Router } from "express"
import { requireAuth } from "../middleware/auth.middleware"
import { logFocusSession, getFocusStats } from "../controllers/focus.controller"

export const focusRouter = Router()

focusRouter.use(requireAuth)

// POST /api/focus/session — Log a completed Pomodoro/focus session
focusRouter.post("/session", logFocusSession)

// GET /api/focus/stats — Retrieve aggregated focus time and session counts
focusRouter.get("/stats", getFocusStats)

export default focusRouter
