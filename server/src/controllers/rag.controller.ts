import { Request, Response, NextFunction } from "express"
import { retrievalService } from "../services/retrieval"
import { ragAnswerService } from "../services/rag"
import { aiLearningService } from "../services/ai-learning"
import { ragChatService } from "../services/rag-chat"
import { AppError } from "../utils/appError"

export class RagController {
  /**
   * Semantic knowledge search endpoint for authenticated users (Phase 8)
   */
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required.", 401)
      }

      const { query, documentId, topK, minScore } = req.body

      const result = await retrievalService.search(req.user.id, {
        query,
        documentId,
        topK: topK ? parseInt(topK, 10) : undefined,
        minScore: minScore ? parseFloat(minScore) : undefined,
      })

      res.json({
        success: true,
        data: result,
        message:
          result.totalRetrieved === 0
            ? "No sufficiently relevant information was found in your learning materials."
            : undefined,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Grounded question answering endpoint for authenticated users (Phase 9)
   */
  async ask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required.", 401)
      }

      const { question, documentId, topK, minScore } = req.body

      const result = await ragAnswerService.answerQuestion(req.user.id, {
        question,
        documentId,
        topK: topK ? parseInt(topK, 10) : undefined,
        minScore: minScore ? parseFloat(minScore) : undefined,
      })

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 1. Smart Document Summary endpoint (Phase 10)
   */
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required.", 401)
      }

      const { documentId } = req.params
      const result = await aiLearningService.generateSummary(req.user.id, documentId)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 2. Practice Question Generation endpoint (Phase 10)
   */
  async getQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required.", 401)
      }

      const { documentId } = req.params
      const { count, difficulty } = req.body

      const result = await aiLearningService.generatePracticeQuestions(req.user.id, documentId, {
        count: count ? parseInt(count, 10) : undefined,
        difficulty,
      })

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 3. Flashcard Generation endpoint (Phase 10)
   */
  async getFlashcards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required.", 401)
      }

      const { documentId } = req.params
      const { count } = req.body

      const result = await aiLearningService.generateFlashcards(req.user.id, documentId, {
        count: count ? parseInt(count, 10) : undefined,
      })

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 4. Revision Suggestions endpoint (Phase 10)
   */
  async getRevisionSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required.", 401)
      }

      const { documentId } = req.params
      const result = await aiLearningService.generateRevisionSuggestions(req.user.id, documentId)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  // --------------------------------------------------
  // PERSISTENT MULTI-TURN RAG CONVERSATIONS (Phase 11)
  // --------------------------------------------------

  /**
   * Lists all persistent conversations for the user
   */
  async listConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError("Authentication required.", 401)
      const list = await ragChatService.listConversations(req.user.id)
      res.json({ success: true, data: list })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Retrieves a single conversation by ID
   */
  async getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError("Authentication required.", 401)
      const { id } = req.params
      const conv = await ragChatService.getConversation(req.user.id, id)
      res.json({ success: true, data: conv })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Creates a new conversation
   */
  async createConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError("Authentication required.", 401)
      const { title, documentId, initialMessage } = req.body
      const conv = await ragChatService.createConversation(req.user.id, {
        title,
        documentId,
        initialMessage,
      })
      res.status(201).json({ success: true, data: conv })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a message in a conversation and generates grounded multi-turn response
   */
  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError("Authentication required.", 401)
      const { id } = req.params
      const { content } = req.body
      const result = await ragChatService.sendMessage(req.user.id, id, { content })
      res.json({ success: true, data: result })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Deletes a conversation
   */
  async deleteConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError("Authentication required.", 401)
      const { id } = req.params
      await ragChatService.deleteConversation(req.user.id, id)
      res.json({ success: true, message: "Conversation deleted successfully." })
    } catch (error) {
      next(error)
    }
  }
}

export const ragController = new RagController()
