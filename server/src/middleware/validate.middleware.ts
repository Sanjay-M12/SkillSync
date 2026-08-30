import { Request, Response, NextFunction } from "express"
import { z, ZodError } from "zod"

export function validate(schema: z.ZodTypeAny) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string> = {}
        for (const issue of error.issues) {
          const field = issue.path.join(".") || "general"
          formattedErrors[field] = issue.message
        }

        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: formattedErrors,
        })
        return
      }
      next(error)
    }
  }
}
