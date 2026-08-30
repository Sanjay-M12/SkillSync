import { Router } from "express"
import { updateSkill, deleteSkill } from "../controllers/skill.controller"
import { createTopic, getTopics } from "../controllers/topic.controller"
import { requireAuth } from "../middleware/auth.middleware"
import { validate } from "../middleware/validate.middleware"
import { updateSkillSchema, createTopicSchema } from "../schemas/learning.schema"

export const skillRouter = Router()

// All skill routes require authentication
skillRouter.use(requireAuth)

// Direct skill modifications
skillRouter.patch("/:id", validate(updateSkillSchema), updateSkill)
skillRouter.delete("/:id", deleteSkill)

// Nested topics under skill
skillRouter.post("/:skillId/topics", validate(createTopicSchema), createTopic)
skillRouter.get("/:skillId/topics", getTopics)

export default skillRouter
