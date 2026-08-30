import * as React from "react"
import { authApi, AuthUser } from "@/services/auth.api"
import { TOKEN_STORAGE_KEY } from "@/lib/api"

export interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<{ isNewUser: boolean }>
  logout: () => void
  refreshUser: () => Promise<void>
  updateUser: (data: { name?: string; avatarUrl?: string | null }) => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | null>(null)

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [token, setToken] = React.useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY)
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = React.useState(true)

  // Logout helper
  const logout = React.useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      // Also clean up any legacy keys
      localStorage.removeItem("skillsync_auth_token")
    } catch {
      // ignore storage errors
    }
    setToken(null)
    setUser(null)
  }, [])

  // Refresh current user identity
  const refreshUser = React.useCallback(async () => {
    const activeToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!activeToken) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const currentUser = await authApi.getMe()
      setUser(currentUser)
      setToken(activeToken)
    } catch {
      logout()
    } finally {
      setIsLoading(false)
    }
  }, [logout])

  // Mount initialization
  React.useEffect(() => {
    refreshUser()

    const handleUnauthorized = () => {
      logout()
    }

    window.addEventListener("skillsync:unauthorized", handleUnauthorized)
    return () => {
      window.removeEventListener("skillsync:unauthorized", handleUnauthorized)
    }
  }, [refreshUser, logout])

  // Email/password login handler
  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password)
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
      localStorage.setItem("skillsync_auth_token", data.token)
    } catch {
      // ignore
    }
    setToken(data.token)
    setUser(data.user)
  }

  // Email/password register handler
  const register = async (name: string, email: string, password: string) => {
    const data = await authApi.register(name, email, password)
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
      localStorage.setItem("skillsync_auth_token", data.token)
    } catch {
      // ignore
    }
    setToken(data.token)
    setUser(data.user)
  }

  // Google OAuth sign-in handler
  const loginWithGoogle = async (credential: string): Promise<{ isNewUser: boolean }> => {
    const data = await authApi.googleLogin(credential)
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
      localStorage.setItem("skillsync_auth_token", data.token)
    } catch {
      // ignore
    }
    setToken(data.token)
    setUser(data.user)
    return { isNewUser: !!data.isNewUser }
  }

  // Update profile user handler
  const updateUser = async (data: { name?: string; avatarUrl?: string | null }) => {
    const updated = await authApi.updateProfile(data)
    setUser(updated)
  }

  const value = React.useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: !!user && !!token,
      isLoading,
      login,
      register,
      loginWithGoogle,
      logout,
      refreshUser,
      updateUser,
    }),
    [user, token, isLoading, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider")
  }
  return context
}
