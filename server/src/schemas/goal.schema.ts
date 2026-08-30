import { z } from "zod"

export const createGoalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(150, "Title cannot exceed 150 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val ?? null)),
  currentLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"], {
    message: "Valid currentLevel is required (BEGINNER, INTERMEDIATE, ADVANCED)",
  }),
  weeklyHours: z.enum(
    ["HOURS_1_TO_3", "HOURS_4_TO_6", "HOURS_7_TO_10", "HOURS_10_PLUS"],
    {
      message:
        "Valid weeklyHours is required (HOURS_1_TO_3, HOURS_4_TO_6, HOURS_7_TO_10, HOURS_10_PLUS)",
    }
  ),
})

export const updateGoalSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters")
      .max(150, "Title cannot exceed 150 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, "Description cannot exceed 1000 characters")
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val ?? null)),
    currentLevel: z
      .enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"], {
        message:
          "Valid currentLevel must be one of: BEGINNER, INTERMEDIATE, ADVANCED",
      })
      .optional(),
    weeklyHours: z
      .enum(["HOURS_1_TO_3", "HOURS_4_TO_6", "HOURS_7_TO_10", "HOURS_10_PLUS"], {
        message:
          "Valid weeklyHours must be one of: HOURS_1_TO_3, HOURS_4_TO_6, HOURS_7_TO_10, HOURS_10_PLUS",
      })
      .optional(),
  })
  .refine(
    (data) => {
      // Check if at least one field is provided
      const fields = Object.keys(data).filter(
        (key) => (data as Record<string, unknown>)[key] !== undefined
      )
      return fields.length > 0
    },
    { message: "At least one valid field must be provided for update" }
  )

export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>
