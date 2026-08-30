import { api, ApiResponse } from "@/lib/api"

export interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthResponseData {
  user: AuthUser
  token: string
}

export const authApi = {
  register: async (name: string, email: string, password: string): Promise<AuthResponseData> => {
    const res = await api.post<ApiResponse<AuthResponseData>>("/auth/register", {
      name,
      email,
      password,
    })
    return res.data!
  },

  login: async (email: string, password: string): Promise<AuthResponseData> => {
    const res = await api.post<ApiResponse<AuthResponseData>>("/auth/login", {
      email,
      password,
    })
    return res.data!
  },

  getMe: async (): Promise<AuthUser> => {
    const res = await api.get<ApiResponse<{ user: AuthUser }>>("/auth/me")
    return res.data!.user
  },

  updateProfile: async (data: { name?: string; avatarUrl?: string | null }): Promise<AuthUser> => {
    const res = await api.patch<ApiResponse<{ user: AuthUser }>>("/auth/profile", data)
    return res.data!.user
  },
}
