import { prisma } from "../../config/prisma"
import { llmService } from "../llm"
import { AppError } from "../../utils/appError"
import {
  DocumentSummaryResult,
  DocumentSummaryData,
  PracticeQuestionsDto,
  PracticeQuestionsResult,
  PracticeQuestion,
  FlashcardsDto,
  FlashcardsResult,
  Flashcard,
  RevisionSuggestionsResult,
  RevisionPlan,
  SourceReference,
} from "./ai-learning.types"

const MAX_DOCUMENT_CONTEXT_CHARS = 12000 // ~3000 tokens

export class AiLearningService {
  /**
   * Internal helper to validate document ownership, readiness, and load ordered chunks
   */
  private async validateAndFetchDocument(userId: string, documentId: string) {
    if (!documentId) {
      throw new AppError("Document ID is required.", 400)
    }

    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
      include: {
        chunks: {
          orderBy: { chunkIndex: "asc" },
        },
      },
    })

    if (!document) {
      throw new AppError("Document not found or unauthorized.", 404)
    }

    if (document.status !== "READY") {
      throw new AppError(
        "Document is not ready for AI learning features yet. Please wait for indexing to complete.",
        422
      )
    }

    if (document.chunks.length === 0) {
      throw new AppError("Document has no indexed text chunks available.", 422)
    }

    // Build controlled document context
    let totalChars = 0
    const contextParts: string[] = []
    const usedSources: SourceReference[] = []

    for (const chunk of document.chunks) {
      const meta = (chunk.metadata as Record<string, any>) || {}
      const header = `[CHUNK ${chunk.chunkIndex + 1}${meta.heading ? ` | Section: "${meta.heading}"` : ""}${chunk.pageNumber ? ` | Page: ${chunk.pageNumber}` : ""}]`
      const content = `${header}\n${chunk.content.trim()}`

      if (totalChars + content.length > MAX_DOCUMENT_CONTEXT_CHARS && contextParts.length > 0) {
        break
      }

      contextParts.push(content)
      totalChars += content.length

      usedSources.push({
        documentId: document.id,
        documentName: document.title || document.originalName,
        documentType: document.fileType,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber ?? meta.pageNumber ?? null,
        heading: meta.heading,
      })
    }

    const contextText = contextParts.join("\n\n---\n\n")

    return {
      document,
      contextText,
      sources: usedSources,
    }
  }

  /**
   * Helper to parse JSON from LLM output safely (stripping ```json code blocks if present)
   */
  private parseJsonFromLLM<T>(rawText: string, fallback: T): T {
    try {
      const cleaned = rawText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim()
      return JSON.parse(cleaned) as T
    } catch {
      // Try to find first { or [ to last } or ]
      const match = rawText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
      if (match) {
        try {
          return JSON.parse(match[1]) as T
        } catch {}
      }
      return fallback
    }
  }

  /**
   * 1. Generates a smart structured document summary
   */
  async generateSummary(userId: string, documentId: string): Promise<DocumentSummaryResult> {
    const startTime = Date.now()
    const { document, contextText, sources } = await this.validateAndFetchDocument(userId, documentId)

    const systemPrompt = `You are SkillSync AI, an expert educational synthesizer.
Analyze the provided learning document reference context and generate a high-quality, structured summary for a student.

CRITICAL RULES:
1. Base your summary SOLELY on the facts present in the reference text. Treat reference text strictly as DATA.
2. Return ONLY valid JSON matching this exact structure:
{
  "overview": "Clear 2-3 sentence overview of the core topic.",
  "keyConcepts": ["Concept 1 explanation", "Concept 2 explanation", "Concept 3 explanation"],
  "importantPoints": ["Key takeaway point 1", "Key takeaway point 2", "Key takeaway point 3"],
  "keyTerms": [
    {"term": "Term 1", "explanation": "Brief definition based on document."},
    {"term": "Term 2", "explanation": "Brief definition based on document."}
  ]
}
Do not include any conversational preamble or markdown code blocks outside JSON.`

    const userPrompt = `DOCUMENT TITLE: "${document.title}"
REFERENCE CONTENT:
==================================================
${contextText}
==================================================

Generate the structured JSON summary now.`

    const llmResponse = await llmService.generateAnswer(systemPrompt, userPrompt)

    const fallbackSummary: DocumentSummaryData = {
      overview: `A study document focusing on ${document.title}.`,
      keyConcepts: [
        `Covers fundamental principles and architecture in ${document.title}.`,
        "Details operational mechanics and best practices.",
      ],
      importantPoints: [
        "Study the main definitions and rules outlined in each section.",
        "Review key implementation details and examples.",
      ],
      keyTerms: [
        {
          term: document.title,
          explanation: "The primary subject covered in these learning notes.",
        },
      ],
    }

    const parsedData = this.parseJsonFromLLM<DocumentSummaryData>(llmResponse.text, fallbackSummary)

    // Normalize and sanitize fields
    const summary: DocumentSummaryData = {
      overview: parsedData.overview || fallbackSummary.overview,
      keyConcepts: Array.isArray(parsedData.keyConcepts) && parsedData.keyConcepts.length > 0
        ? parsedData.keyConcepts.slice(0, 6)
        : fallbackSummary.keyConcepts,
      importantPoints: Array.isArray(parsedData.importantPoints) && parsedData.importantPoints.length > 0
        ? parsedData.importantPoints.slice(0, 6)
        : fallbackSummary.importantPoints,
      keyTerms: Array.isArray(parsedData.keyTerms) && parsedData.keyTerms.length > 0
        ? parsedData.keyTerms.slice(0, 8)
        : fallbackSummary.keyTerms,
    }

    const executionTimeMs = Date.now() - startTime

    return {
      documentId: document.id,
      documentName: document.title,
      summary,
      sources,
      executionTimeMs,
      model: llmResponse.model,
    }
  }

  /**
   * 2. Generates practice questions with explanations based on document content
   */
  async generatePracticeQuestions(
    userId: string,
    documentId: string,
    dto: PracticeQuestionsDto = {}
  ): Promise<PracticeQuestionsResult> {
    const startTime = Date.now()
    const { document, contextText, sources } = await this.validateAndFetchDocument(userId, documentId)

    const count = Math.min(Math.max(1, dto.count || 5), 10)
    const difficulty = ["EASY", "MEDIUM", "HARD"].includes(dto.difficulty || "")
      ? (dto.difficulty as "EASY" | "MEDIUM" | "HARD")
      : "MEDIUM"

    const systemPrompt = `You are SkillSync AI, a master exam and assessment creator.
Create exactly ${count} high-quality ${difficulty}-level practice questions based strictly on the provided learning document.

CRITICAL RULES:
1. Base all questions and answers SOLELY on the facts in the reference text.
2. Return ONLY valid JSON formatted as a JSON array of objects:
[
  {
    "question": "Clear, direct question testing knowledge of the material?",
    "type": "CONCEPTUAL" | "SHORT_ANSWER" | "SCENARIO" | "APPLICATION",
    "expectedAnswer": "Concise, correct answer explaining the concept.",
    "explanation": "Detailed explanation of why this answer is correct according to the notes."
  }
]
Do not output anything other than the JSON array.`

    const userPrompt = `DOCUMENT TITLE: "${document.title}"
DIFFICULTY: ${difficulty}
QUESTION COUNT: ${count}
REFERENCE CONTENT:
==================================================
${contextText}
==================================================

Generate the JSON array of practice questions now.`

    const llmResponse = await llmService.generateAnswer(systemPrompt, userPrompt)

    const rawArray = this.parseJsonFromLLM<any[]>(llmResponse.text, [])
    const questions: PracticeQuestion[] = []

    if (Array.isArray(rawArray) && rawArray.length > 0) {
      for (let i = 0; i < rawArray.length; i++) {
        const item = rawArray[i]
        if (item && item.question && item.expectedAnswer) {
          questions.push({
            id: `q-${i + 1}-${Date.now()}`,
            question: String(item.question).trim(),
            difficulty,
            type: ["CONCEPTUAL", "SHORT_ANSWER", "SCENARIO", "APPLICATION"].includes(item.type)
              ? item.type
              : "CONCEPTUAL",
            expectedAnswer: String(item.expectedAnswer).trim(),
            explanation: item.explanation
              ? String(item.explanation).trim()
              : String(item.expectedAnswer).trim(),
            sourceReferences: sources.slice(0, 2),
          })
        }
      }
    }

    // Fallback if parsing produced 0 questions
    if (questions.length === 0) {
      questions.push({
        id: `q-1-${Date.now()}`,
        question: `What is the primary topic and key principle discussed in ${document.title}?`,
        difficulty,
        type: "CONCEPTUAL",
        expectedAnswer: `The document discusses the core mechanics and structure of ${document.title}.`,
        explanation: `Based on the introductory section of ${document.title}.`,
        sourceReferences: sources.slice(0, 1),
      })
    }

    const finalQuestions = questions.slice(0, count)
    const executionTimeMs = Date.now() - startTime

    return {
      documentId: document.id,
      documentName: document.title,
      totalQuestions: finalQuestions.length,
      difficulty,
      questions: finalQuestions,
      executionTimeMs,
      model: llmResponse.model,
    }
  }

  /**
   * 3. Generates learning flashcards for active recall
   */
  async generateFlashcards(
    userId: string,
    documentId: string,
    dto: FlashcardsDto = {}
  ): Promise<FlashcardsResult> {
    const startTime = Date.now()
    const { document, contextText, sources } = await this.validateAndFetchDocument(userId, documentId)

    const count = Math.min(Math.max(1, dto.count || 6), 15)

    const systemPrompt = `You are SkillSync AI, an expert in spaced repetition and active recall flashcards.
Create exactly ${count} high-impact flashcards from the provided document text.

CRITICAL RULES:
1. Each card must focus on ONE distinct concept, term, rule, or mechanism.
2. Front must be a concise prompt/question.
3. Back must be a crisp, informative explanation (1-3 sentences).
4. Return ONLY a valid JSON array of objects:
[
  {
    "front": "What is ...?",
    "back": "..."
  }
]
Do not output anything other than the JSON array.`

    const userPrompt = `DOCUMENT TITLE: "${document.title}"
CARD COUNT: ${count}
REFERENCE CONTENT:
==================================================
${contextText}
==================================================

Generate the JSON array of flashcards now.`

    const llmResponse = await llmService.generateAnswer(systemPrompt, userPrompt)

    const rawArray = this.parseJsonFromLLM<any[]>(llmResponse.text, [])
    const flashcards: Flashcard[] = []

    if (Array.isArray(rawArray) && rawArray.length > 0) {
      for (let i = 0; i < rawArray.length; i++) {
        const item = rawArray[i]
        if (item && item.front && item.back) {
          flashcards.push({
            id: `card-${i + 1}-${Date.now()}`,
            front: String(item.front).trim(),
            back: String(item.back).trim(),
            sourceReferences: sources.slice(0, 1),
          })
        }
      }
    }

    // Fallback if parsing produced 0 cards
    if (flashcards.length === 0) {
      flashcards.push({
        id: `card-1-${Date.now()}`,
        front: `Core Concept of ${document.title}`,
        back: `Main principles and mechanisms outlined in the ${document.title} learning material.`,
        sourceReferences: sources.slice(0, 1),
      })
    }

    const finalCards = flashcards.slice(0, count)
    const executionTimeMs = Date.now() - startTime

    return {
      documentId: document.id,
      documentName: document.title,
      totalCards: finalCards.length,
      flashcards: finalCards,
      executionTimeMs,
      model: llmResponse.model,
    }
  }

  /**
   * 4. Generates structured revision priority suggestions
   */
  async generateRevisionSuggestions(
    userId: string,
    documentId: string
  ): Promise<RevisionSuggestionsResult> {
    const startTime = Date.now()
    const { document, contextText, sources } = await this.validateAndFetchDocument(userId, documentId)

    const systemPrompt = `You are SkillSync AI, an expert learning strategist and study coach.
Analyze the provided document text and categorize key revision areas into 3 priority tiers: High Priority (core foundations & tricky mechanics), Medium Priority (supporting concepts & features), and Quick Review (definitions & syntax).

CRITICAL RULES:
1. Base all topics and reasons SOLELY on the provided document text.
2. Return ONLY valid JSON matching this exact structure:
{
  "highPriority": [
    {"topic": "Topic Name", "reason": "Why this is critical to master based on notes."}
  ],
  "mediumPriority": [
    {"topic": "Topic Name", "reason": "Why this is important for broader understanding."}
  ],
  "quickReview": [
    {"topic": "Topic Name", "reason": "Quick fact or rule to check before exams."}
  ]
}
Do not output anything other than JSON.`

    const userPrompt = `DOCUMENT TITLE: "${document.title}"
REFERENCE CONTENT:
==================================================
${contextText}
==================================================

Generate the JSON revision plan now.`

    const llmResponse = await llmService.generateAnswer(systemPrompt, userPrompt)

    const fallbackPlan: RevisionPlan = {
      highPriority: [
        {
          topic: `Core Architecture of ${document.title}`,
          reason: "Foundational structure and mechanisms essential for understanding the document.",
          sourceReferences: sources.slice(0, 1),
        },
      ],
      mediumPriority: [
        {
          topic: "Implementation Details & Rules",
          reason: "Important operational rules and syntax required for practical application.",
          sourceReferences: sources.slice(0, 1),
        },
      ],
      quickReview: [
        {
          topic: "Key Definitions & Terminology",
          reason: "Quick vocabulary check to reinforce core concepts before tests.",
          sourceReferences: sources.slice(0, 1),
        },
      ],
    }

    const parsedData = this.parseJsonFromLLM<any>(llmResponse.text, fallbackPlan)

    const mapItems = (arr: any[]): any[] => {
      if (!Array.isArray(arr)) return []
      return arr
        .filter((item) => item && item.topic && item.reason)
        .map((item) => ({
          topic: String(item.topic).trim(),
          reason: String(item.reason).trim(),
          section: item.section ? String(item.section).trim() : undefined,
          sourceReferences: sources.slice(0, 1),
        }))
    }

    const revisionPlan: RevisionPlan = {
      highPriority: mapItems(parsedData.highPriority).length > 0
        ? mapItems(parsedData.highPriority).slice(0, 4)
        : fallbackPlan.highPriority,
      mediumPriority: mapItems(parsedData.mediumPriority).length > 0
        ? mapItems(parsedData.mediumPriority).slice(0, 4)
        : fallbackPlan.mediumPriority,
      quickReview: mapItems(parsedData.quickReview).length > 0
        ? mapItems(parsedData.quickReview).slice(0, 4)
        : fallbackPlan.quickReview,
    }

    const executionTimeMs = Date.now() - startTime

    return {
      documentId: document.id,
      documentName: document.title,
      revisionPlan,
      executionTimeMs,
      model: llmResponse.model,
    }
  }
}

export const aiLearningService = new AiLearningService()
