export interface JwtPayload {
  userId: string
  iat?: number
  exp?: number
}

export interface SafeUser {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AuthResponseData {
  user: SafeUser
  token: string
}
