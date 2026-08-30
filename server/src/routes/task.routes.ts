import { Router } from "express"
import {
  updateTask,
  deleteTask,
  updateTaskCompletion,
} from "../controllers/task.controller"
import { requireAuth } from "../middleware/auth.middleware"
import { validate } from "../middleware/validate.middleware"
import {
  updateTaskSchema,
  updateTaskCompletionSchema,
} from "../schemas/learning.schema"

export const taskRouter = Router()

// All task routes require authentication
taskRouter.use(requireAuth)

// Direct task modifications
taskRouter.patch("/:id", validate(updateTaskSchema), updateTask)
taskRouter.delete("/:id", deleteTask)

// Dedicated task completion toggle
taskRouter.patch(
  "/:id/completion",
  validate(updateTaskCompletionSchema),
  updateTaskCompletion
)

export default taskRouter
