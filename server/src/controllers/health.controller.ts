import { Request, Response } from "express"
import { sendSuccess } from "../utils/apiResponse"
import { config } from "../config/env"
import { prisma } from "../config/prisma"

export async function getHealthCheck(_req: Request, res: Response): Promise<Response> {
  let dbStatus = "disconnected"

  try {
    await prisma.$queryRaw`SELECT 1`
    dbStatus = "connected"
  } catch {
    dbStatus = "disconnected"
  }

  return sendSuccess(
    res,
    "SkillSync API is running",
    {
      uptimeSeconds: Math.round(process.uptime()),
      environment: config.NODE_ENV,
      database: dbStatus,
      version: "1.0.0",
    },
    200
  )
}
