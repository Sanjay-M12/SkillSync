import { DocumentType } from "@prisma/client"

export interface SourceReference {
  documentId: string
  documentName: string
  documentType: DocumentType
  chunkIndex?: number
  pageNumber?: number | null
  heading?: string
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
  sources: SourceReference[]
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
  sourceReferences: SourceReference[]
}

export interface PracticeQuestionsDto {
  count?: number // default 5, max 10
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
  sourceReferences: SourceReference[]
}

export interface FlashcardsDto {
  count?: number // default 6, max 15
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
  sourceReferences: SourceReference[]
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
