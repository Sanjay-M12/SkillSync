import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { router } from "@/app/router"
import { AuthContextProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/context/ThemeContext"
import { ErrorBoundary } from "@/components/common/ErrorBoundary"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1003139413210-mi8ufkugm4vgmn4thcn1otopgt0o4lbi.apps.googleusercontent.com"

export const AppProviders: React.FC = () => {
  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={googleClientId}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthContextProvider>
              <RouterProvider router={router} />
            </AuthContextProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  )
}

export default AppProviders
