import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button, FormField, Input } from "@/components/ui"
import { PasswordInput } from "./PasswordInput"
import { GoogleAuthButton } from "./GoogleAuthButton"
import { validateLoginForm } from "../auth.validation"
import type { LoginFormValues, LoginFormErrors } from "../auth.types"
import { useAuth } from "@/context/AuthContext"
import { ApiError } from "@/lib/api"
import { AlertCircle, Mail, Lock, ArrowRight } from "lucide-react"

export const LoginForm: React.FC = () => {
  const navigate = useNavigate()
  const { login, loginWithGoogle } = useAuth()

  const [values, setValues] = React.useState<LoginFormValues>({
    email: "",
    password: "",
  })

  const [touched, setTouched] = React.useState<Record<keyof LoginFormValues, boolean>>({
    email: false,
    password: false,
  })

  const [errors, setErrors] = React.useState<LoginFormErrors>({})
  const [generalError, setGeneralError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  // Validate single field on blur or change when touched
  const validateField = (field: keyof LoginFormValues, currentValues: LoginFormValues) => {
    const currentErrors = validateLoginForm(currentValues)
    setErrors((prev) => ({
      ...prev,
      [field]: currentErrors[field],
    }))
  }

  const handleChange = (field: keyof LoginFormValues, value: string) => {
    const newValues = { ...values, [field]: value }
    setValues(newValues)
    setGeneralError(null)

    if (touched[field]) {
      validateField(field, newValues)
    }
  }

  const handleBlur = (field: keyof LoginFormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validateField(field, values)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all as touched
    setTouched({ email: true, password: true })

    const formErrors = validateLoginForm(values)
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      return
    }

    setIsLoading(true)
    setGeneralError(null)

    try {
      await login(values.email, values.password)
      navigate("/dashboard")
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          setErrors(err.errors as LoginFormErrors)
        }
        setGeneralError(err.message || "Invalid email or password.")
      } else {
        setGeneralError("Something went wrong while signing in. Please check your connection.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (credential: string) => {
    setIsLoading(true)
    setGeneralError(null)
    try {
      const { isNewUser } = await loginWithGoogle(credential)
      if (isNewUser) {
        navigate("/onboarding")
      } else {
        navigate("/dashboard")
      }
    } catch (err: any) {
      setGeneralError(err?.message || "Google sign-in failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = (errorMessage: string) => {
    setGeneralError(errorMessage)
  }

  return (
    <div className="space-y-5">
      {/* General Error Banner */}
      {generalError && (
        <div
          className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive animate-in fade-in-0"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email Input */}
        <FormField
          label="Email Address"
          htmlFor="login-email"
          required
          error={touched.email ? errors.email : undefined}
        >
          <Input
            id="login-email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            error={touched.email ? errors.email : undefined}
            disabled={isLoading}
            autoComplete="email"
            leftIcon={<Mail className="h-4 w-4" />}
          />
        </FormField>

        {/* Password Input */}
        <FormField
          label="Password"
          htmlFor="login-password"
          required
          error={touched.password ? errors.password : undefined}
        >
          <PasswordInput
            id="login-password"
            name="password"
            placeholder="••••••••"
            value={values.password}
            onChange={(e) => handleChange("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            error={touched.password ? errors.password : undefined}
            disabled={isLoading}
            autoComplete="current-password"
            leftIcon={<Lock className="h-4 w-4" />}
          />
        </FormField>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Sign In
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-border" />
        <span className="absolute bg-card px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Or continue with
        </span>
      </div>

      {/* Google Sign-In Button */}
      <div>
        <GoogleAuthButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          text="signin_with"
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default LoginForm
