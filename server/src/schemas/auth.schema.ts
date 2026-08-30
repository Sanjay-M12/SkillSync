import { z } from "zod"

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
})

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required"),
})

export const googleAuthSchema = z.object({
  credential: z
    .string()
    .min(1, "Google credential token is required"),
})

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").optional(),
  avatarUrl: z.string().nullable().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
