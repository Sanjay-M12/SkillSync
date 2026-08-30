import * as React from "react"
import { Navigate } from "react-router-dom"
import { AuthLayout, RegisterForm } from "@/features/auth"
import { useAuth } from "@/context/AuthContext"

export const RegisterPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking and mastering skills systematically."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <RegisterForm />
    </AuthLayout>
  )
}

export default RegisterPage
