import type {
  LoginFormValues,
  LoginFormErrors,
  RegisterFormValues,
  RegisterFormErrors,
} from "./auth.types"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): string | null {
  const trimmed = email.trim()
  if (!trimmed) {
    return "Email is required"
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return "Please enter a valid email address"
  }
  return null
}

export function validateLoginForm(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {}

  const emailError = validateEmail(values.email)
  if (emailError) {
    errors.email = emailError
  }

  if (!values.password) {
    errors.password = "Password is required"
  }

  return errors
}

export function validateRegisterForm(values: RegisterFormValues): RegisterFormErrors {
  const errors: RegisterFormErrors = {}

  const trimmedName = values.name.trim()
  if (!trimmedName) {
    errors.name = "Full name is required"
  } else if (trimmedName.length < 2) {
    errors.name = "Name must be at least 2 characters"
  }

  const emailError = validateEmail(values.email)
  if (emailError) {
    errors.email = emailError
  }

  if (!values.password) {
    errors.password = "Password is required"
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters"
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password"
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match"
  }

  return errors
}
