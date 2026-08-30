import { PrismaClient } from "@prisma/client"
import { config } from "./env"

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined
}

export const prisma: PrismaClient =
  global.__prismaClient ||
  new PrismaClient({
    log: config.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })

global.__prismaClient = prisma

/**
 * Checks PostgreSQL connectivity safely without exposing credentials or throwing fatal errors.
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean
  message: string
}> {
  try {
    // Attempt a lightweight raw query
    await prisma.$queryRaw`SELECT 1`
    console.log("🗄️  PostgreSQL Database: Connected successfully via Prisma.")
    return { connected: true, message: "Connected" }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Connection failed"
    // Sanitize message so no connection string or credentials are leaked
    const sanitizedMsg = errorMsg.replace(/:\/\/[^@]+@/, "://***:***@")
    console.warn(`⚠️  PostgreSQL Database connection unavailable: ${sanitizedMsg}`)
    console.warn("💡 Ensure PostgreSQL is running and DATABASE_URL in .env is configured.")
    return { connected: false, message: "Disconnected" }
  }
}

/**
 * Gracefully disconnects Prisma client on application shutdown.
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    console.log("🗄️  Prisma client disconnected.")
  } catch (error) {
    console.error("❌ Error disconnecting Prisma client:", error)
  }
}

export default prisma
