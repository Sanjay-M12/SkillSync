import { Router } from "express"
import { updateTopic, deleteTopic } from "../controllers/topic.controller"
import { createTask, getTasks } from "../controllers/task.controller"
import { requireAuth } from "../middleware/auth.middleware"
import { validate } from "../middleware/validate.middleware"
import { updateTopicSchema, createTaskSchema } from "../schemas/learning.schema"

export const topicRouter = Router()

// All topic routes require authentication
topicRouter.use(requireAuth)

// Direct topic modifications
topicRouter.patch("/:id", validate(updateTopicSchema), updateTopic)
topicRouter.delete("/:id", deleteTopic)

// Nested tasks under topic
topicRouter.post("/:topicId/tasks", validate(createTaskSchema), createTask)
topicRouter.get("/:topicId/tasks", getTasks)

export default topicRouter
