import express, { Application } from "express"
import cors from "cors"
import helmet from "helmet"
import { config } from "./config/env"
import { requestLogger } from "./middleware/logger.middleware"
import { notFoundHandler } from "./middleware/notFound.middleware"
import { errorHandler } from "./middleware/error.middleware"
import { apiRouter } from "./routes"

export const createApp = (): Application => {
  const app = express()

  // Security headers
  app.use(helmet())

  // Cross-Origin Resource Sharing
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, postman)
        if (!origin) return callback(null, true)

        const allowedOrigins = [
          config.CLIENT_URL,
          "http://localhost:5173",
          "http://127.0.0.1:5173",
        ]

        if (allowedOrigins.includes(origin) || config.NODE_ENV === "development") {
          return callback(null, true)
        }

        return callback(new Error(`Origin ${origin} not allowed by CORS policy`))
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )

  // Body parsers
  app.use(express.json({ limit: "15mb" }))
  app.use(express.urlencoded({ extended: true, limit: "15mb" }))

  // Request logger
  app.use(requestLogger)

  // Register main API routes
  app.use(config.API_PREFIX, apiRouter)

  // Not Found 404 Handler
  app.use(notFoundHandler)

  // Centralized Error Handler
  app.use(errorHandler)

  return app
}

export const app = createApp()
export default app
