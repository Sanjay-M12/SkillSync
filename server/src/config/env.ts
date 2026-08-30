import dotenv from "dotenv"
import path from "path"

// Load .env file from server root
dotenv.config({ path: path.resolve(__dirname, "../../.env") })

export interface AppConfig {
  PORT: number
  NODE_ENV: "development" | "production" | "test"
  CLIENT_URL: string
  DATABASE_URL: string
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
  API_PREFIX: string
  GOOGLE_CLIENT_ID: string
}

const nodeEnv = (process.env.NODE_ENV as AppConfig["NODE_ENV"]) || "development"
const jwtSecret = process.env.JWT_SECRET || (nodeEnv === "development" ? "skillsync_dev_secret_fallback_key_32chars" : "")

if (nodeEnv === "production" && !jwtSecret) {
  throw new Error("FATAL: JWT_SECRET environment variable is required in production mode.")
}

export const config: AppConfig = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: nodeEnv,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/skillsync?schema=public",
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  API_PREFIX: "/api",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
}
