import { apiClient, ApiResponse } from "./api-client"
import type { DocumentType } from "@/features/knowledge/knowledge.types"

export interface ChunkSourceMetadata {
  documentId: string
  documentName: string
  documentType: DocumentType
  chunkIndex?: number
  pageNumber?: number | null
  startPage?: number
  endPage?: number
  heading?: string
  section?: string
}

export interface RetrievedChunk {
  chunkId: string
  content: string
  score: number // Cosine similarity: 0.0 to 1.0
  tokenCount: number
  source: ChunkSourceMetadata
}

export interface RetrievalResult {
  query: string
  documentId?: string
  totalRetrieved: number
  results: RetrievedChunk[]
  executionTimeMs: number
  model: string
  provider: string
}

export interface SearchQueryPayload {
  query: string
  documentId?: string
  topK?: number
  minScore?: number
}

export interface VerifiedSource extends ChunkSourceMetadata {
  matchScore: number
}

export interface GroundedAnswerResult {
  question: string
  answer: string
  hasContext: boolean
  sources: VerifiedSource[]
  metadata: {
    retrievedChunksCount: number
    executionTimeMs: number
    model: string
    provider: string
    documentId?: string
  }
}

export interface AskQuestionPayload {
  question: string
  documentId?: string
  topK?: number
  minScore?: number
}

// 1. Smart Document Summary
export interface KeyTerm {
  term: string
  explanation: string
}

export interface DocumentSummaryData {
  overview: string
  keyConcepts: string[]
  importantPoints: string[]
  keyTerms: KeyTerm[]
}

export interface DocumentSummaryResult {
  documentId: string
  documentName: string
  summary: DocumentSummaryData
  sources: ChunkSourceMetadata[]
  executionTimeMs: number
  model: string
}

// 2. AI Practice Questions
export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD"
export type QuestionType = "CONCEPTUAL" | "SHORT_ANSWER" | "SCENARIO" | "APPLICATION"

export interface PracticeQuestion {
  id: string
  question: string
  difficulty: QuestionDifficulty
  type: QuestionType
  expectedAnswer: string
  explanation: string
  sourceReferences: ChunkSourceMetadata[]
}

export interface PracticeQuestionsPayload {
  count?: number
  difficulty?: QuestionDifficulty
}

export interface PracticeQuestionsResult {
  documentId: string
  documentName: string
  totalQuestions: number
  difficulty: QuestionDifficulty
  questions: PracticeQuestion[]
  executionTimeMs: number
  model: string
}

// 3. AI Flashcards
export interface Flashcard {
  id: string
  front: string
  back: string
  sourceReferences: ChunkSourceMetadata[]
}

export interface FlashcardsPayload {
  count?: number
}

export interface FlashcardsResult {
  documentId: string
  documentName: string
  totalCards: number
  flashcards: Flashcard[]
  executionTimeMs: number
  model: string
}

// 4. AI Revision Suggestions
export interface RevisionItem {
  topic: string
  reason: string
  section?: string
  sourceReferences: ChunkSourceMetadata[]
}

export interface RevisionPlan {
  highPriority: RevisionItem[]
  mediumPriority: RevisionItem[]
  quickReview: RevisionItem[]
}

export interface RevisionSuggestionsResult {
  documentId: string
  documentName: string
  revisionPlan: RevisionPlan
  executionTimeMs: number
  model: string
}

// 5. Persistent Multi-Turn Conversations (Phase 11)
export interface RagMessage {
  id: string
  conversationId: string
  sender: "USER" | "ASSISTANT"
  content: string
  sources?: VerifiedSource[] | null
  hasContext: boolean
  createdAt: string
}

export interface RagConversationSummary {
  id: string
  title: string
  documentId?: string | null
  documentName?: string | null
  documentType?: DocumentType | null
  messageCount: number
  lastMessage?: string | null
  createdAt: string
  updatedAt: string
}

export interface RagConversationDetail {
  id: string
  title: string
  documentId?: string | null
  document?: {
    id: string
    title: string
    fileType: DocumentType
  } | null
  messages: RagMessage[]
  createdAt: string
  updatedAt: string
}

export interface CreateConversationPayload {
  title?: string
  documentId?: string
  initialMessage?: string
}

export interface SendMessagePayload {
  content: string
}

export interface SendMessageResponse {
  userMessage: RagMessage
  assistantMessage: RagMessage
}

export class RagApi {
  /**
   * Performs semantic vector search on authenticated user's knowledge base (Phase 8)
   */
  async search(payload: SearchQueryPayload): Promise<RetrievalResult> {
    const res = await apiClient.post<ApiResponse<RetrievalResult>>("/rag/search", payload)
    if (!res.data) {
      throw new Error(res.error || "Retrieval search failed.")
    }
    return res.data
  }

  /**
   * Generates a grounded learning assistant answer based on retrieved documents (Phase 9)
   */
  async askQuestion(payload: AskQuestionPayload): Promise<GroundedAnswerResult> {
    const res = await apiClient.post<ApiResponse<GroundedAnswerResult>>("/rag/ask", payload)
    if (!res.data) {
      throw new Error(res.error || "Failed to generate grounded answer.")
    }
    return res.data
  }

  /**
   * Generates a structured document summary (Phase 10)
   */
  async getDocumentSummary(documentId: string): Promise<DocumentSummaryResult> {
    const res = await apiClient.post<ApiResponse<DocumentSummaryResult>>(
      `/rag/documents/${documentId}/summary`
    )
    if (!res.data) {
      throw new Error(res.error || "Failed to generate document summary.")
    }
    return res.data
  }

  /**
   * Generates practice assessment questions (Phase 10)
   */
  async getPracticeQuestions(
    documentId: string,
    payload: PracticeQuestionsPayload = {}
  ): Promise<PracticeQuestionsResult> {
    const res = await apiClient.post<ApiResponse<PracticeQuestionsResult>>(
      `/rag/documents/${documentId}/questions`,
      payload
    )
    if (!res.data) {
      throw new Error(res.error || "Failed to generate practice questions.")
    }
    return res.data
  }

  /**
   * Generates active recall flashcards (Phase 10)
   */
  async getFlashcards(
    documentId: string,
    payload: FlashcardsPayload = {}
  ): Promise<FlashcardsResult> {
    const res = await apiClient.post<ApiResponse<FlashcardsResult>>(
      `/rag/documents/${documentId}/flashcards`,
      payload
    )
    if (!res.data) {
      throw new Error(res.error || "Failed to generate flashcards.")
    }
    return res.data
  }

  /**
   * Generates structured revision priority suggestions (Phase 10)
   */
  async getRevisionSuggestions(documentId: string): Promise<RevisionSuggestionsResult> {
    const res = await apiClient.post<ApiResponse<RevisionSuggestionsResult>>(
      `/rag/documents/${documentId}/revision-suggestions`
    )
    if (!res.data) {
      throw new Error(res.error || "Failed to generate revision suggestions.")
    }
    return res.data
  }

  // --------------------------------------------------
  // CONVERSATION CHAT METHODS (Phase 11)
  // --------------------------------------------------

  /**
   * Lists all persistent conversations for the user
   */
  async listConversations(): Promise<RagConversationSummary[]> {
    const res = await apiClient.get<ApiResponse<RagConversationSummary[]>>("/rag/conversations")
    if (!res.data) {
      throw new Error(res.error || "Failed to load conversations.")
    }
    return res.data
  }

  /**
   * Retrieves a single conversation by ID
   */
  async getConversation(id: string): Promise<RagConversationDetail> {
    const res = await apiClient.get<ApiResponse<RagConversationDetail>>(`/rag/conversations/${id}`)
    if (!res.data) {
      throw new Error(res.error || "Failed to load conversation details.")
    }
    return res.data
  }

  /**
   * Creates a new conversation
   */
  async createConversation(payload: CreateConversationPayload = {}): Promise<RagConversationDetail> {
    const res = await apiClient.post<ApiResponse<RagConversationDetail>>(
      "/rag/conversations",
      payload
    )
    if (!res.data) {
      throw new Error(res.error || "Failed to create conversation.")
    }
    return res.data
  }

  /**
   * Sends a message in a conversation and receives assistant response
   */
  async sendMessage(
    conversationId: string,
    payload: SendMessagePayload
  ): Promise<SendMessageResponse> {
    const res = await apiClient.post<ApiResponse<SendMessageResponse>>(
      `/rag/conversations/${conversationId}/messages`,
      payload
    )
    if (!res.data) {
      throw new Error(res.error || "Failed to send message.")
    }
    return res.data
  }

  /**
   * Deletes a conversation
   */
  async deleteConversation(id: string): Promise<void> {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(`/rag/conversations/${id}`)
    if (res.error) {
      throw new Error(res.error || "Failed to delete conversation.")
    }
  }
}

export const ragApi = new RagApi()
