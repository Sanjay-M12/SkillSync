import { app } from "./app"
import { config } from "./config/env"
import { checkDatabaseConnection, disconnectDatabase } from "./config/prisma"
import http from "http"

const server = http.createServer(app)

server.listen(config.PORT, async () => {
  console.log(`========================================`)
  console.log(`🚀 SkillSync Server is running!`)
  console.log(`📡 Environment: ${config.NODE_ENV}`)
  console.log(`🌐 Port:        ${config.PORT}`)
  console.log(`🔗 API Base:    http://localhost:${config.PORT}${config.API_PREFIX}`)
  console.log(`🩺 Health:      http://localhost:${config.PORT}${config.API_PREFIX}/health`)
  console.log(`========================================`)

  // Check database connectivity on startup
  await checkDatabaseConnection()
})

// Graceful Shutdown
let isShuttingDown = false

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) return
  isShuttingDown = true

  console.log(`\n[${new Date().toISOString()}] Received ${signal}. Starting graceful shutdown...`)

  // Disconnect database client
  await disconnectDatabase()

  // Close HTTP Server
  server.close(() => {
    console.log("✅ HTTP server closed successfully.")
    process.exit(0)
  })

  // Force close after 5 seconds if connections linger
  setTimeout(() => {
    console.error("⚠️ Forced shutdown due to lingering connections.")
    process.exit(1)
  }, 5000)
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"))
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))

export default server
