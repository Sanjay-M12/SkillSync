import { Router } from "express"
import { register, login, getMe, updateProfile } from "../controllers/auth.controller"
import { validate } from "../middleware/validate.middleware"
import { requireAuth } from "../middleware/auth.middleware"
import { authRateLimiter } from "../middleware/rateLimit.middleware"
import { registerSchema, loginSchema, updateProfileSchema } from "../schemas/auth.schema"

export const authRouter = Router()

// Public Auth Endpoints with Rate Limiting & Zod Validation
authRouter.post("/register", authRateLimiter, validate(registerSchema), register)
authRouter.post("/login", authRateLimiter, validate(loginSchema), login)

// Protected Auth Endpoints
authRouter.get("/me", requireAuth, getMe)
authRouter.put("/profile", requireAuth, validate(updateProfileSchema), updateProfile)
authRouter.patch("/profile", requireAuth, validate(updateProfileSchema), updateProfile)

export default authRouter
