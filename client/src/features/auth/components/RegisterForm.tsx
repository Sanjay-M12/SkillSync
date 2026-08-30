import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button, FormField, Input } from "@/components/ui"
import { PasswordInput } from "./PasswordInput"
import { GoogleAuthButton } from "./GoogleAuthButton"
import { validateRegisterForm } from "../auth.validation"
import type { RegisterFormValues, RegisterFormErrors } from "../auth.types"
import { useAuth } from "@/context/AuthContext"
import { ApiError } from "@/lib/api"
import { AlertCircle, User, Mail, Lock, ArrowRight } from "lucide-react"

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate()
  const { register, loginWithGoogle } = useAuth()

  const [values, setValues] = React.useState<RegisterFormValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [touched, setTouched] = React.useState<Record<keyof RegisterFormValues, boolean>>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  })

  const [errors, setErrors] = React.useState<RegisterFormErrors>({})
  const [generalError, setGeneralError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const validateField = (field: keyof RegisterFormValues, currentValues: RegisterFormValues) => {
    const currentErrors = validateRegisterForm(currentValues)
    setErrors((prev) => ({
      ...prev,
      [field]: currentErrors[field],
    }))
  }

  const handleChange = (field: keyof RegisterFormValues, value: string) => {
    const newValues = { ...values, [field]: value }
    setValues(newValues)
    setGeneralError(null)

    if (touched[field]) {
      validateField(field, newValues)
    }

    // Re-validate confirmPassword if password changes
    if (field === "password" && touched.confirmPassword) {
      const currentErrors = validateRegisterForm(newValues)
      setErrors((prev) => ({
        ...prev,
        confirmPassword: currentErrors.confirmPassword,
      }))
    }
  }

  const handleBlur = (field: keyof RegisterFormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validateField(field, values)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    })

    const formErrors = validateRegisterForm(values)
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      return
    }

    setIsLoading(true)
    setGeneralError(null)

    try {
      await register(values.name, values.email, values.password)
      navigate("/onboarding")
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          setErrors(err.errors as RegisterFormErrors)
        }
        setGeneralError(err.message || "An account with this email already exists.")
      } else {
        setGeneralError("Something went wrong while creating your account. Please try again.")
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
      setGeneralError(err?.message || "Google sign-up failed. Please try again.")
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
        {/* Full Name */}
        <FormField
          label="Full Name"
          htmlFor="register-name"
          required
          error={touched.name ? errors.name : undefined}
        >
          <Input
            id="register-name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={values.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            error={touched.name ? errors.name : undefined}
            disabled={isLoading}
            autoComplete="name"
            leftIcon={<User className="h-4 w-4" />}
          />
        </FormField>

        {/* Email Address */}
        <FormField
          label="Email Address"
          htmlFor="register-email"
          required
          error={touched.email ? errors.email : undefined}
        >
          <Input
            id="register-email"
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

        {/* Password */}
        <FormField
          label="Password"
          htmlFor="register-password"
          required
          helperText="Must be at least 8 characters"
          error={touched.password ? errors.password : undefined}
        >
          <PasswordInput
            id="register-password"
            name="password"
            placeholder="••••••••"
            value={values.password}
            onChange={(e) => handleChange("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            error={touched.password ? errors.password : undefined}
            disabled={isLoading}
            autoComplete="new-password"
            leftIcon={<Lock className="h-4 w-4" />}
          />
        </FormField>

        {/* Confirm Password */}
        <FormField
          label="Confirm Password"
          htmlFor="register-confirm-password"
          required
          error={touched.confirmPassword ? errors.confirmPassword : undefined}
        >
          <PasswordInput
            id="register-confirm-password"
            name="confirmPassword"
            placeholder="••••••••"
            value={values.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            onBlur={() => handleBlur("confirmPassword")}
            error={touched.confirmPassword ? errors.confirmPassword : undefined}
            disabled={isLoading}
            autoComplete="new-password"
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
            Create Account
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-border" />
        <span className="absolute bg-card px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Or sign up with
        </span>
      </div>

      {/* Google Sign-Up Button */}
      <div>
        <GoogleAuthButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          text="signup_with"
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default RegisterForm
