import * as React from "react"
import { Navigate } from "react-router-dom"
import { AuthLayout, LoginForm } from "@/features/auth"
import { useAuth } from "@/context/AuthContext"

export const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Continue your learning journey."
      footerText="Don't have an account?"
      footerLinkText="Create one"
      footerLinkHref="/register"
    >
      <LoginForm />
    </AuthLayout>
  )
}

export default LoginPage
