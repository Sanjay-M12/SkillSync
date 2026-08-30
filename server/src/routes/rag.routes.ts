import { Router } from "express"
import { requireAuth } from "../middleware/auth.middleware"
import { ragController } from "../controllers/rag.controller"

export const ragRouter = Router()

// All RAG endpoints require authentication
ragRouter.use(requireAuth)

// POST /api/rag/search — Semantic vector similarity retrieval (Phase 8)
ragRouter.post("/search", ragController.search.bind(ragController))

// POST /api/rag/ask — Grounded LLM learning assistant Q&A (Phase 9)
ragRouter.post("/ask", ragController.ask.bind(ragController))

// AI Learning Features (Phase 10)
// POST /api/rag/documents/:documentId/summary — Smart Document Summary
ragRouter.post("/documents/:documentId/summary", ragController.getSummary.bind(ragController))

// POST /api/rag/documents/:documentId/questions — AI Practice Questions
ragRouter.post("/documents/:documentId/questions", ragController.getQuestions.bind(ragController))

// POST /api/rag/documents/:documentId/flashcards — AI Flashcards
ragRouter.post("/documents/:documentId/flashcards", ragController.getFlashcards.bind(ragController))

// POST /api/rag/documents/:documentId/revision-suggestions — AI Revision Suggestions
ragRouter.post("/documents/:documentId/revision-suggestions", ragController.getRevisionSuggestions.bind(ragController))

// Persistent Multi-Turn Conversations & History (Phase 11)
// GET /api/rag/conversations — List user conversations
ragRouter.get("/conversations", ragController.listConversations.bind(ragController))

// POST /api/rag/conversations — Create a new conversation
ragRouter.post("/conversations", ragController.createConversation.bind(ragController))

// GET /api/rag/conversations/:id — Get conversation details and message history
ragRouter.get("/conversations/:id", ragController.getConversation.bind(ragController))

// POST /api/rag/conversations/:id/messages — Send a message in a conversation
ragRouter.post("/conversations/:id/messages", ragController.sendMessage.bind(ragController))

// DELETE /api/rag/conversations/:id — Delete a conversation
ragRouter.delete("/conversations/:id", ragController.deleteConversation.bind(ragController))

export default ragRouter
