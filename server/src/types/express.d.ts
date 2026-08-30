import { SafeUser } from "./auth.types"

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser
    }
  }
}
