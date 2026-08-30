import { z } from "zod"

// --------------------------------------------------
// SKILL SCHEMAS
// --------------------------------------------------

export const createSkillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Skill name must be at least 2 characters")
    .max(100, "Skill name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val ?? null)),
})

export const updateSkillSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Skill name must be at least 2 characters")
      .max(100, "Skill name cannot exceed 100 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, "Description cannot exceed 1000 characters")
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val ?? null)),
  })
  .refine(
    (data) => {
      const fields = Object.keys(data).filter(
        (key) => (data as Record<string, unknown>)[key] !== undefined
      )
      return fields.length > 0
    },
    { message: "At least one valid field must be provided for update" }
  )

// --------------------------------------------------
// TOPIC SCHEMAS
// --------------------------------------------------

export const createTopicSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Topic name must be at least 2 characters")
    .max(100, "Topic name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val ?? null)),
  confidence: z
    .enum(["NOT_RATED", "STRONG", "NEEDS_REVISION", "WEAK"], {
      message: "Valid confidence is required (NOT_RATED, STRONG, NEEDS_REVISION, WEAK)",
    })
    .optional()
    .default("NOT_RATED"),
})

export const updateTopicSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Topic name must be at least 2 characters")
      .max(100, "Topic name cannot exceed 100 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, "Description cannot exceed 1000 characters")
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val ?? null)),
    confidence: z
      .enum(["NOT_RATED", "STRONG", "NEEDS_REVISION", "WEAK"], {
        message: "Valid confidence must be one of: NOT_RATED, STRONG, NEEDS_REVISION, WEAK",
      })
      .optional(),
  })
  .refine(
    (data) => {
      const fields = Object.keys(data).filter(
        (key) => (data as Record<string, unknown>)[key] !== undefined
      )
      return fields.length > 0
    },
    { message: "At least one valid field must be provided for update" }
  )

// --------------------------------------------------
// TASK SCHEMAS
// --------------------------------------------------

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Task title must be at least 2 characters")
    .max(200, "Task title cannot exceed 200 characters"),
  estimatedMinutes: z
    .number()
    .int("Estimated minutes must be a whole number")
    .min(1, "Estimated minutes must be at least 1 minute")
    .max(1440, "Estimated minutes cannot exceed 1440 minutes (24 hours)")
    .optional()
    .nullable()
    .transform((val) => val ?? null),
})

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Task title must be at least 2 characters")
      .max(200, "Task title cannot exceed 200 characters")
      .optional(),
    estimatedMinutes: z
      .number()
      .int("Estimated minutes must be a whole number")
      .min(1, "Estimated minutes must be at least 1 minute")
      .max(1440, "Estimated minutes cannot exceed 1440 minutes (24 hours)")
      .optional()
      .nullable()
      .transform((val) => val ?? null),
  })
  .refine(
    (data) => {
      const fields = Object.keys(data).filter(
        (key) => (data as Record<string, unknown>)[key] !== undefined
      )
      return fields.length > 0
    },
    { message: "At least one valid field must be provided for update" }
  )

export const updateTaskCompletionSchema = z.object({
  completed: z.boolean({
    message: "completed must be a boolean",
  }),
})

// Schema input types
export type CreateSkillInput = z.infer<typeof createSkillSchema>
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>

export type CreateTopicInput = z.infer<typeof createTopicSchema>
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type UpdateTaskCompletionInput = z.infer<typeof updateTaskCompletionSchema>
