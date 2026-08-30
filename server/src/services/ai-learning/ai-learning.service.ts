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

const MAX_DOCUMENT_CONTEXT_CHARS = 16000 // ~4000 tokens

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
      const header = `[SECTION ${chunk.chunkIndex + 1}${meta.heading ? `: ${meta.heading}` : ""}${chunk.pageNumber ? ` | Page ${chunk.pageNumber}` : ""}]`
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
   * Smart content-based analysis extractor (used when LLM key is absent or on fallback)
   * Extracts authentic concepts, definitions, and sentences from actual document chunks.
   */
  private extractContentIntelligence(contextText: string, docTitle: string) {
    const rawLines = contextText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("[SECTION") && !l.startsWith("---") && !l.startsWith("==="))

    // Extract potential headings or bullet points
    const meaningfulSentences = rawLines.filter(
      (l) => l.length >= 25 && !l.startsWith("http") && !l.toLowerCase().includes("page ")
    )

    // Extract definition-like statements (contains is/are/defines/used for/refers to)
    const definitionLines = meaningfulSentences.filter((l) =>
      /\b(is an?|are|refers to|defines?|used (for|to)|consists of|represents)\b/i.test(l)
    )

    // Extract technical terms or keywords
    const candidateTerms: { term: string; explanation: string }[] = []
    for (const line of meaningfulSentences) {
      const match = line.match(/^([A-Za-z0-9_.\s-]{2,30})[:\-–—]\s*(.+)$/)
      if (match && match[1] && match[2] && match[2].length > 15) {
        candidateTerms.push({
          term: match[1].replace(/^[-*•#\d.]\s*/, "").trim(),
          explanation: match[2].trim(),
        })
      }
    }

    return {
      sentences: meaningfulSentences.length >= 5 ? meaningfulSentences : rawLines,
      definitions: definitionLines,
      terms: candidateTerms,
      totalLines: rawLines.length,
      docTitle,
    }
  }

  /**
   * 1. Generates a smart structured document summary
   */
  async generateSummary(userId: string, documentId: string): Promise<DocumentSummaryResult> {
    const startTime = Date.now()
    const { document, contextText, sources } = await this.validateAndFetchDocument(userId, documentId)

    const systemPrompt = `You are SkillSync AI, an expert academic synthesizer and study coach.
Analyze the provided document notes thoroughly and generate a comprehensive, highly insightful study summary.

CRITICAL REQUIREMENTS:
1. Provide a detailed, cohesive 3-4 sentence "overview" synthesizing the core domain, main objectives, and overall significance.
2. Provide 5-6 distinct, in-depth "keyConcepts" detailing key principles, architecture, or methodologies directly from the document.
3. Provide 5-6 actionable, high-impact "importantPoints" (key takeaways, best practices, rules, or procedural steps).
4. Provide 6-8 specific technical "keyTerms" with precise, clear explanations grounded in the notes.
5. Base all answers strictly on the facts in the reference content. DO NOT repeat the document title over and over.

Return ONLY a valid JSON object matching this exact schema:
{
  "overview": "Detailed 3-4 sentence overview of what the document covers and why it matters.",
  "keyConcepts": [
    "Concept 1: Detailed explanation with specifics from text.",
    "Concept 2: Detailed explanation with specifics from text.",
    "Concept 3: Detailed explanation with specifics from text.",
    "Concept 4: Detailed explanation with specifics from text.",
    "Concept 5: Detailed explanation with specifics from text."
  ],
  "importantPoints": [
    "Takeaway 1: Critical rule or best practice from notes.",
    "Takeaway 2: Operational mechanism or design principle.",
    "Takeaway 3: Practical implementation takeaway.",
    "Takeaway 4: Important constraint or gotcha discussed.",
    "Takeaway 5: Key recommendation for mastery."
  ],
  "keyTerms": [
    {"term": "TermName1", "explanation": "Precise definition based on document."},
    {"term": "TermName2", "explanation": "Precise definition based on document."},
    {"term": "TermName3", "explanation": "Precise definition based on document."},
    {"term": "TermName4", "explanation": "Precise definition based on document."},
    {"term": "TermName5", "explanation": "Precise definition based on document."},
    {"term": "TermName6", "explanation": "Precise definition based on document."}
  ]
}`

    const userPrompt = `DOCUMENT TITLE: "${document.title}"
DOCUMENT REFERENCE CONTENT:
==================================================
${contextText}
==================================================

Generate the structured JSON summary now.`

    const llmResponse = await llmService.generateAnswer(systemPrompt, userPrompt)
    const intel = this.extractContentIntelligence(contextText, document.title)

    // Build intelligent fallback using real document content
    const sampleSentences = intel.sentences.slice(0, 10)
    const fallbackSummary: DocumentSummaryData = {
      overview: sampleSentences.slice(0, 3).join(" ") || `Comprehensive study notes on ${document.title}, covering fundamental concepts, architecture, and practical execution details.`,
      keyConcepts: sampleSentences.length >= 4
        ? sampleSentences.slice(0, 5).map((s) => s.replace(/^[-*•#\d.]\s*/, ""))
        : [
            `Core foundational principles and structure in ${document.title}`,
            "Architectural rules, implementation patterns, and core mechanisms",
            "Key operational procedures and best practice standards",
            "Data models, interfaces, and system interaction flows",
            "Debugging, optimization, and real-world mastery considerations",
          ],
      importantPoints: sampleSentences.length >= 6
        ? sampleSentences.slice(3, 8).map((s) => s.replace(/^[-*•#\d.]\s*/, ""))
        : [
            "Master the foundational syntax and architectural components first",
            "Pay close attention to error handling and state management rules",
            "Review operational constraints and recommended design practices",
            "Implement hands-on code examples to reinforce conceptual understanding",
            "Verify edge cases and performance considerations outlined in each section",
          ],
      keyTerms: intel.terms.length >= 3
        ? intel.terms.slice(0, 6)
        : [
            { term: document.title, explanation: "The central subject and domain covered in this learning material." },
            { term: "Architecture", explanation: "The underlying structural organization and component design." },
            { term: "Core Mechanism", explanation: "The fundamental operational workflow defined in the notes." },
            { term: "Implementation", explanation: "The practical application and syntax rules demonstrated in the document." },
          ],
    }

    const parsedData = this.parseJsonFromLLM<DocumentSummaryData>(llmResponse.text, fallbackSummary)

    const summary: DocumentSummaryData = {
      overview: parsedData.overview && parsedData.overview.length > 30 ? parsedData.overview : fallbackSummary.overview,
      keyConcepts: Array.isArray(parsedData.keyConcepts) && parsedData.keyConcepts.length >= 3
        ? parsedData.keyConcepts.slice(0, 8)
        : fallbackSummary.keyConcepts,
      importantPoints: Array.isArray(parsedData.importantPoints) && parsedData.importantPoints.length >= 3
        ? parsedData.importantPoints.slice(0, 8)
        : fallbackSummary.importantPoints,
      keyTerms: Array.isArray(parsedData.keyTerms) && parsedData.keyTerms.length >= 2
        ? parsedData.keyTerms.slice(0, 10)
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
   * 2. Generates exactly 5+ high-quality practice questions with explanations
   */
  async generatePracticeQuestions(
    userId: string,
    documentId: string,
    dto: PracticeQuestionsDto = {}
  ): Promise<PracticeQuestionsResult> {
    const startTime = Date.now()
    const { document, contextText, sources } = await this.validateAndFetchDocument(userId, documentId)

    const count = Math.min(Math.max(5, dto.count || 5), 10)
    const difficulty = ["EASY", "MEDIUM", "HARD"].includes(dto.difficulty || "")
      ? (dto.difficulty as "EASY" | "MEDIUM" | "HARD")
      : "MEDIUM"

    const systemPrompt = `You are SkillSync AI, a master technical exam writer and educator.
Create exactly ${count} distinct, high-quality, realistic ${difficulty}-level practice questions based strictly on the provided document text.

CRITICAL REQUIREMENTS:
1. Generate EXACTLY ${count} questions. Do NOT stop after 1 or 2 questions.
2. Vary question types across: CONCEPTUAL, SHORT_ANSWER, SCENARIO, and APPLICATION.
3. Every question must test specific technical knowledge, mechanisms, rules, or definitions directly explained in the notes.
4. Provide a thorough, accurate "expectedAnswer" (2-3 sentences) and a rich "explanation" detailing why this answer is correct and referencing the principle in the text.
5. Base all questions SOLELY on the facts in the reference content.

Return ONLY a valid JSON array of objects with this schema:
[
  {
    "question": "Clear, specific technical question testing a distinct concept from the notes?",
    "type": "CONCEPTUAL" | "SHORT_ANSWER" | "SCENARIO" | "APPLICATION",
    "expectedAnswer": "Comprehensive, precise answer explaining the concept.",
    "explanation": "In-depth explanation connecting the answer to the principles in the notes."
  }
]`

    const userPrompt = `DOCUMENT TITLE: "${document.title}"
DIFFICULTY: ${difficulty}
QUESTION COUNT: ${count}
DOCUMENT REFERENCE CONTENT:
==================================================
${contextText}
==================================================

Generate the JSON array of ${count} practice questions now.`

    const llmResponse = await llmService.generateAnswer(systemPrompt, userPrompt)
    const rawArray = this.parseJsonFromLLM<any[]>(llmResponse.text, [])
    const questions: PracticeQuestion[] = []

    if (Array.isArray(rawArray) && rawArray.length > 0) {
      for (let i = 0; i < rawArray.length; i++) {
        const item = rawArray[i]
        if (item && item.question && (item.expectedAnswer || item.answer)) {
          const ans = String(item.expectedAnswer || item.answer).trim()
          questions.push({
            id: `q-${i + 1}-${Date.now()}`,
            question: String(item.question).trim(),
            difficulty,
            type: ["CONCEPTUAL", "SHORT_ANSWER", "SCENARIO", "APPLICATION"].includes(item.type)
              ? item.type
              : i % 2 === 0 ? "CONCEPTUAL" : "SCENARIO",
            expectedAnswer: ans,
            explanation: item.explanation
              ? String(item.explanation).trim()
              : `This is derived directly from the core specifications and guidelines in ${document.title}.`,
            sourceReferences: sources.slice(0, 2),
          })
        }
      }
    }

    // If LLM did not produce at least 5 questions, synthesize remaining from real text
    if (questions.length < 5) {
      const intel = this.extractContentIntelligence(contextText, document.title)
      const sentences = intel.sentences

      const questionTemplates = [
        {
          type: "CONCEPTUAL" as const,
          q: (text: string) => `What is the core principle and significance of the following topic discussed in ${document.title}:\n"${text.slice(0, 140)}..."?`,
          a: (text: string) => `It establishes that ${text.slice(0, 250)}. This provides the structural foundation required for correct execution.`,
          exp: "Directly grounded in the initial conceptual definitions presented in the study document.",
        },
        {
          type: "SHORT_ANSWER" as const,
          q: (text: string) => `How does ${document.title} define and handle: "${text.slice(0, 120)}..."?`,
          a: (text: string) => `According to the reference material: ${text.slice(0, 250)}.`,
          exp: "Verifies precise comprehension of the operational definitions and syntax rules.",
        },
        {
          type: "APPLICATION" as const,
          q: (text: string) => `When implementing the patterns in ${document.title}, why is it critical to account for:\n"${text.slice(0, 130)}..."?`,
          a: (text: string) => `Accounting for this ensures reliability and consistency because ${text.slice(0, 240)}.`,
          exp: "Tests practical application and avoidance of common implementation pitfalls.",
        },
        {
          type: "SCENARIO" as const,
          q: (text: string) => `In a scenario where you are optimizing or refactoring based on ${document.title}, how should you address:\n"${text.slice(0, 130)}..."?`,
          a: (text: string) => `You should follow the prescribed guidelines: ${text.slice(0, 250)}.`,
          exp: "Evaluates scenario-based problem solving and best practice adoption.",
        },
        {
          type: "CONCEPTUAL" as const,
          q: (text: string) => `What are the key differences, constraints, and dependencies highlighted in:\n"${text.slice(0, 130)}..."?`,
          a: (text: string) => `The material outlines that ${text.slice(0, 250)}.`,
          exp: "Reinforces active recall of core differentiators and dependencies.",
        },
      ]

      while (questions.length < 5) {
        const idx = questions.length
        const sentence = sentences[idx % sentences.length] || `Core mechanism and execution workflow of ${document.title}.`
        const template = questionTemplates[idx % questionTemplates.length]

        questions.push({
          id: `q-${idx + 1}-${Date.now()}`,
          question: template.q(sentence),
          difficulty,
          type: template.type,
          expectedAnswer: template.a(sentence),
          explanation: template.exp,
          sourceReferences: sources.slice(0, 1),
        })
      }
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
   * 3. Generates exactly 5 to 8 learning flashcards for active recall
   */
  async generateFlashcards(
    userId: string,
    documentId: string,
    dto: FlashcardsDto = {}
  ): Promise<FlashcardsResult> {
    const startTime = Date.now()
    const { document, contextText, sources } = await this.validateAndFetchDocument(userId, documentId)

    const count = Math.min(Math.max(5, dto.count || 6), 15)

    const systemPrompt = `You are SkillSync AI, an expert in spaced repetition and active recall memory systems.
Create exactly ${count} high-impact, distinct flashcards from the provided document text.

CRITICAL REQUIREMENTS:
1. Generate EXACTLY ${count} flashcards. Do NOT output fewer than ${count}.
2. Each card must target ONE distinct concept, term, mechanism, syntax rule, or architecture component from the notes.
3. Front: A crisp, focused active recall question/prompt (e.g., "What is the purpose of ...?", "Explain the difference between ... and ...", "How does ... function in Java?").
4. Back: A clear, complete, 2-3 sentence explanation with concrete facts from the text.
5. Base all flashcards SOLELY on the facts in the reference content.

Return ONLY a valid JSON array of objects:
[
  {
    "front": "Targeted active recall question/prompt?",
    "back": "Precise, complete explanation with concrete facts."
  }
]`

    const userPrompt = `DOCUMENT TITLE: "${document.title}"
CARD COUNT: ${count}
DOCUMENT REFERENCE CONTENT:
==================================================
${contextText}
==================================================

Generate the JSON array of ${count} flashcards now.`

    const llmResponse = await llmService.generateAnswer(systemPrompt, userPrompt)
    const rawArray = this.parseJsonFromLLM<any[]>(llmResponse.text, [])
    const flashcards: Flashcard[] = []

    if (Array.isArray(rawArray) && rawArray.length > 0) {
      for (let i = 0; i < rawArray.length; i++) {
        const item = rawArray[i]
        if (item && (item.front || item.question) && (item.back || item.answer)) {
          flashcards.push({
            id: `card-${i + 1}-${Date.now()}`,
            front: String(item.front || item.question).trim(),
            back: String(item.back || item.answer).trim(),
            sourceReferences: sources.slice(0, 1),
          })
        }
      }
    }

    // If LLM did not produce at least 5 flashcards, synthesize remaining from real text
    if (flashcards.length < 5) {
      const intel = this.extractContentIntelligence(contextText, document.title)
      const sentences = intel.sentences

      const flashcardPrompts = [
        {
          front: (text: string) => `What is the core role of: "${text.slice(0, 60)}..."?`,
          back: (text: string) => `${text.slice(0, 220)}. This provides the primary mechanism required in ${document.title}.`,
        },
        {
          front: (text: string) => `Explain the operational rule: "${text.slice(0, 60)}..."`,
          back: (text: string) => `It specifies that ${text.slice(0, 220)}. Mastering this prevents subtle runtime issues.`,
        },
        {
          front: (text: string) => `How does ${document.title} structure: "${text.slice(0, 60)}..."?`,
          back: (text: string) => `Based on the notes: ${text.slice(0, 220)}.`,
        },
        {
          front: (text: string) => `What key advantage or behavior is provided by: "${text.slice(0, 60)}..."?`,
          back: (text: string) => `It enables ${text.slice(0, 220)}.`,
        },
        {
          front: (text: string) => `Key Definition: "${text.slice(0, 60)}..."`,
          back: (text: string) => `${text.slice(0, 220)}.`,
        },
      ]

      while (flashcards.length < 5) {
        const idx = flashcards.length
        const sentence = sentences[idx % sentences.length] || `Core mechanism and execution workflow in ${document.title}.`
        const template = flashcardPrompts[idx % flashcardPrompts.length]

        flashcards.push({
          id: `card-${idx + 1}-${Date.now()}`,
          front: template.front(sentence),
          back: template.back(sentence),
          sourceReferences: sources.slice(0, 1),
        })
      }
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

CRITICAL REQUIREMENTS:
1. Provide 3-4 distinct topics per priority tier.
2. For every topic, provide an insightful "reason" explaining why it belongs in that tier based on the actual document content.
3. Base all topics and reasons SOLELY on the provided document text.

Return ONLY a valid JSON object matching this schema:
{
  "highPriority": [
    {"topic": "Core Foundation Topic", "reason": "Why this is critical to master first according to the notes."}
  ],
  "mediumPriority": [
    {"topic": "Supporting Mechanism", "reason": "Why this is important for comprehensive understanding."}
  ],
  "quickReview": [
    {"topic": "Definition / Syntax Item", "reason": "Quick fact or rule to check before exams."}
  ]
}`

    const userPrompt = `DOCUMENT TITLE: "${document.title}"
DOCUMENT REFERENCE CONTENT:
==================================================
${contextText}
==================================================

Generate the JSON revision plan now.`

    const llmResponse = await llmService.generateAnswer(systemPrompt, userPrompt)
    const intel = this.extractContentIntelligence(contextText, document.title)
    const sentences = intel.sentences

    const fallbackPlan: RevisionPlan = {
      highPriority: [
        {
          topic: sentences[0] ? sentences[0].slice(0, 50) : `Core Architecture of ${document.title}`,
          reason: "Foundational structure and core mechanisms essential for understanding the document.",
          sourceReferences: sources.slice(0, 1),
        },
        {
          topic: sentences[1] ? sentences[1].slice(0, 50) : "Primary Execution Flow & Rules",
          reason: "Critical operational workflow that governs how the entire system functions.",
          sourceReferences: sources.slice(0, 1),
        },
      ],
      mediumPriority: [
        {
          topic: sentences[2] ? sentences[2].slice(0, 50) : "Implementation Patterns & Syntax",
          reason: "Important operational rules and syntax required for practical application.",
          sourceReferences: sources.slice(0, 1),
        },
        {
          topic: sentences[3] ? sentences[3].slice(0, 50) : "Data Structures & State Management",
          reason: "Key data representations and component relationships.",
          sourceReferences: sources.slice(0, 1),
        },
      ],
      quickReview: [
        {
          topic: sentences[4] ? sentences[4].slice(0, 50) : "Key Definitions & Terminology",
          reason: "Quick vocabulary check to reinforce core concepts before tests.",
          sourceReferences: sources.slice(0, 1),
        },
        {
          topic: sentences[5] ? sentences[5].slice(0, 50) : "Common Pitfalls & Gotchas",
          reason: "High-frequency edge cases and common mistakes to review rapidly.",
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
        ? mapItems(parsedData.highPriority).slice(0, 5)
        : fallbackPlan.highPriority,
      mediumPriority: mapItems(parsedData.mediumPriority).length > 0
        ? mapItems(parsedData.mediumPriority).slice(0, 5)
        : fallbackPlan.mediumPriority,
      quickReview: mapItems(parsedData.quickReview).length > 0
        ? mapItems(parsedData.quickReview).slice(0, 5)
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
