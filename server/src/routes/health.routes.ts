import { Router } from "express"
import { getHealthCheck } from "../controllers/health.controller"

export const healthRouter = Router()

healthRouter.get("/", getHealthCheck)
