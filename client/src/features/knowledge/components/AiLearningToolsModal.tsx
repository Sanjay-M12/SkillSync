import * as React from "react"
import { Button } from "@/components/ui"
import {
  FileText,
  HelpCircle,
  Layers,
  Target,
  Sparkles,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  RotateCw,
  BookOpen,
  CheckCircle2,
} from "lucide-react"
import {
  ragApi,
  DocumentSummaryResult,
  PracticeQuestionsResult,
  FlashcardsResult,
  RevisionSuggestionsResult,
  QuestionDifficulty,
} from "@/services/rag.api"
import type { KnowledgeDocument } from "../knowledge.types"
import { cn } from "@/lib/utils"

export type LearningToolTab = "summary" | "questions" | "flashcards" | "revision"

export interface AiLearningToolsModalProps {
  isOpen: boolean
  onClose: () => void
  document: KnowledgeDocument | null
  initialTab?: LearningToolTab
}

export const AiLearningToolsModal: React.FC<AiLearningToolsModalProps> = ({
  isOpen,
  onClose,
  document,
  initialTab = "summary",
}) => {
  const [activeTab, setActiveTab] = React.useState<LearningToolTab>(initialTab)

  // Tab 1: Summary State
  const [summaryData, setSummaryData] = React.useState<DocumentSummaryResult | null>(null)
  const [isSummaryLoading, setIsSummaryLoading] = React.useState(false)
  const [summaryError, setSummaryError] = React.useState<string | null>(null)

  // Tab 2: Practice Questions State
  const [questionsData, setQuestionsData] = React.useState<PracticeQuestionsResult | null>(null)
  const [questionIndex, setQuestionIndex] = React.useState(0)
  const [showAnswer, setShowAnswer] = React.useState(false)
  const [difficulty, setDifficulty] = React.useState<QuestionDifficulty>("MEDIUM")
  const [isQuestionsLoading, setIsQuestionsLoading] = React.useState(false)
  const [questionsError, setQuestionsError] = React.useState<string | null>(null)

  // Tab 3: Flashcards State
  const [flashcardsData, setFlashcardsData] = React.useState<FlashcardsResult | null>(null)
  const [cardIndex, setCardIndex] = React.useState(0)
  const [isFlipped, setIsFlipped] = React.useState(false)
  const [isFlashcardsLoading, setIsFlashcardsLoading] = React.useState(false)
  const [flashcardsError, setFlashcardsError] = React.useState<string | null>(null)

  // Tab 4: Revision Suggestions State
  const [revisionData, setRevisionData] = React.useState<RevisionSuggestionsResult | null>(null)
  const [isRevisionLoading, setIsRevisionLoading] = React.useState(false)
  const [revisionError, setRevisionError] = React.useState<string | null>(null)

  // Reset when document changes
  React.useEffect(() => {
    if (document) {
      setSummaryData(null)
      setQuestionsData(null)
      setFlashcardsData(null)
      setRevisionData(null)
      setQuestionIndex(0)
      setCardIndex(0)
      setIsFlipped(false)
      setShowAnswer(false)
      setActiveTab(initialTab)
    }
  }, [document, initialTab])

  // Escape key handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Body scroll lock
  React.useEffect(() => {
    if (isOpen) {
      window.document.body.style.overflow = "hidden"
    } else {
      window.document.body.style.overflow = "unset"
    }
    return () => {
      window.document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Load active tab data on demand
  React.useEffect(() => {
    if (!isOpen || !document || document.status !== "READY") return

    if (activeTab === "summary" && !summaryData && !isSummaryLoading) {
      loadSummary()
    } else if (activeTab === "questions" && !questionsData && !isQuestionsLoading) {
      loadQuestions()
    } else if (activeTab === "flashcards" && !flashcardsData && !isFlashcardsLoading) {
      loadFlashcards()
    } else if (activeTab === "revision" && !revisionData && !isRevisionLoading) {
      loadRevision()
    }
  }, [activeTab, isOpen, document])

  if (!isOpen || !document) return null

  // 1. Fetch Summary
  const loadSummary = async () => {
    setIsSummaryLoading(true)
    setSummaryError(null)
    try {
      const data = await ragApi.getDocumentSummary(document.id)
      setSummaryData(data)
    } catch (err: any) {
      setSummaryError(err.message || "Failed to generate summary.")
    } finally {
      setIsSummaryLoading(false)
    }
  }

  // 2. Fetch Questions
  const loadQuestions = async (newDifficulty?: QuestionDifficulty) => {
    setIsQuestionsLoading(true)
    setQuestionsError(null)
    setQuestionIndex(0)
    setShowAnswer(false)
    const diff = newDifficulty || difficulty
    try {
      const data = await ragApi.getPracticeQuestions(document.id, {
        count: 5,
        difficulty: diff,
      })
      setQuestionsData(data)
    } catch (err: any) {
      setQuestionsError(err.message || "Failed to generate practice questions.")
    } finally {
      setIsQuestionsLoading(false)
    }
  }

  // 3. Fetch Flashcards
  const loadFlashcards = async () => {
    setIsFlashcardsLoading(true)
    setFlashcardsError(null)
    setCardIndex(0)
    setIsFlipped(false)
    try {
      const data = await ragApi.getFlashcards(document.id, { count: 8 })
      setFlashcardsData(data)
    } catch (err: any) {
      setFlashcardsError(err.message || "Failed to generate flashcards.")
    } finally {
      setIsFlashcardsLoading(false)
    }
  }

  // 4. Fetch Revision
  const loadRevision = async () => {
    setIsRevisionLoading(true)
    setRevisionError(null)
    try {
      const data = await ragApi.getRevisionSuggestions(document.id)
      setRevisionData(data)
    } catch (err: any) {
      setRevisionError(err.message || "Failed to generate revision guide.")
    } finally {
      setIsRevisionLoading(false)
    }
  }

  const currentQuestion = questionsData?.questions[questionIndex]
  const currentCard = flashcardsData?.flashcards[cardIndex]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in-0"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tools-dialog-title"
        className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="space-y-0.5 min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                {document.fileType}
              </span>
              <h2 id="tools-dialog-title" className="text-base font-bold text-foreground truncate">
                {document.title}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              AI Learning Tools powered by your indexed document content.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-border/60 pt-2 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              activeTab === "summary"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            Summary
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("questions")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              activeTab === "questions"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Practice Questions
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("flashcards")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              activeTab === "flashcards"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            Flashcards
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("revision")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              activeTab === "revision"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Target className="h-3.5 w-3.5" />
            Revision Guide
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* TAB 1: SUMMARY */}
          {activeTab === "summary" && (
            <div className="space-y-4">
              {isSummaryLoading ? (
                <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
                  <div className="flex justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Synthesizing document summary...</p>
                  <p className="text-xs text-muted-foreground">Extracting core concepts and key takeaways.</p>
                </div>
              ) : summaryError ? (
                <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{summaryError}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadSummary} className="h-7 text-xs">
                    Retry
                  </Button>
                </div>
              ) : summaryData ? (
                <div className="space-y-4">
                  {/* Overview */}
                  <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      Executive Overview
                    </h3>
                    <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                      {summaryData.summary.overview}
                    </p>
                  </div>

                  {/* Key Concepts */}
                  <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      Key Concepts
                    </h3>
                    <ul className="space-y-1.5 text-xs text-foreground/90">
                      {summaryData.summary.keyConcepts.map((concept, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>{concept}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Important Takeaways */}
                  <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      Important Takeaways
                    </h3>
                    <ul className="space-y-1.5 text-xs text-foreground/90">
                      {summaryData.summary.importantPoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Terminology */}
                  {summaryData.summary.keyTerms.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Key Terminology
                      </h3>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {summaryData.summary.keyTerms.map((term, i) => (
                          <div key={i} className="rounded-lg bg-muted/20 p-2.5 text-xs border border-border/50">
                            <p className="font-bold text-foreground text-[11px] text-primary">{term.term}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{term.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 2: PRACTICE QUESTIONS */}
          {activeTab === "questions" && (
            <div className="space-y-4">
              {/* Difficulty Controls */}
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <div className="flex items-center gap-1">
                  {(["EASY", "MEDIUM", "HARD"] as QuestionDifficulty[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      disabled={isQuestionsLoading}
                      onClick={() => {
                        setDifficulty(d)
                        loadQuestions(d)
                      }}
                      className={cn(
                        "rounded px-2.5 py-1 text-[10px] font-bold uppercase transition-all",
                        difficulty === d
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {questionsData && (
                  <span className="text-xs font-medium text-muted-foreground">
                    Question {questionIndex + 1} of {questionsData.totalQuestions}
                  </span>
                )}
              </div>

              {isQuestionsLoading ? (
                <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
                  <div className="flex justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    Generating {difficulty.toLowerCase()} practice questions...
                  </p>
                </div>
              ) : questionsError ? (
                <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <span>{questionsError}</span>
                  <Button variant="outline" size="sm" onClick={() => loadQuestions()}>
                    Retry
                  </Button>
                </div>
              ) : currentQuestion ? (
                <div className="space-y-3">
                  {/* Question Card */}
                  <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm min-h-[160px] flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                          {currentQuestion.type}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {document.title}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground leading-relaxed">
                        {currentQuestion.question}
                      </p>
                    </div>

                    {/* Answer Reveal Area */}
                    {showAnswer ? (
                      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-1.5 animate-in fade-in-50">
                        <p className="text-[11px] font-bold text-primary uppercase tracking-wide">
                          Expected Answer:
                        </p>
                        <p className="text-xs text-foreground/90 leading-relaxed">
                          {currentQuestion.expectedAnswer}
                        </p>
                        {currentQuestion.explanation && (
                          <p className="text-[10px] text-muted-foreground pt-1 border-t border-primary/10">
                            💡 {currentQuestion.explanation}
                          </p>
                        )}
                      </div>
                    ) : null}

                    {/* Toggle Button */}
                    <div className="flex justify-start pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        {showAnswer ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            Hide Answer
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" />
                            Reveal Answer & Explanation
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <div className="flex items-center justify-between pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={questionIndex === 0}
                      onClick={() => {
                        setQuestionIndex((prev) => Math.max(0, prev - 1))
                        setShowAnswer(false)
                      }}
                      leftIcon={<ChevronLeft className="h-4 w-4" />}
                    >
                      Previous
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      disabled={questionIndex >= (questionsData?.totalQuestions || 1) - 1}
                      onClick={() => {
                        setQuestionIndex((prev) => prev + 1)
                        setShowAnswer(false)
                      }}
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                    >
                      Next Question
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 3: FLASHCARDS */}
          {activeTab === "flashcards" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-xs text-muted-foreground">
                  Click the card or flip button to test active recall.
                </span>
                {flashcardsData && (
                  <span className="text-xs font-medium text-muted-foreground">
                    Card {cardIndex + 1} of {flashcardsData.totalCards}
                  </span>
                )}
              </div>

              {isFlashcardsLoading ? (
                <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
                  <div className="flex justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Generating study flashcards...</p>
                </div>
              ) : flashcardsError ? (
                <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <span>{flashcardsError}</span>
                  <Button variant="outline" size="sm" onClick={loadFlashcards}>
                    Retry
                  </Button>
                </div>
              ) : currentCard ? (
                <div className="space-y-3">
                  {/* Interactive Flip Card */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className={cn(
                      "min-h-[190px] cursor-pointer rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 select-none shadow-md",
                      isFlipped
                        ? "border-primary/40 bg-primary/5 shadow-primary/5"
                        : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                        {isFlipped ? "Answer / Back" : "Prompt / Front"}
                      </span>
                      <RotateCw className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>

                    <div className="py-4 text-center">
                      <p className="text-sm font-semibold text-foreground leading-relaxed">
                        {isFlipped ? currentCard.back : currentCard.front}
                      </p>
                    </div>

                    <div className="text-center text-[10px] text-muted-foreground">
                      Click anywhere on card to flip
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={cardIndex === 0}
                      onClick={() => {
                        setCardIndex((prev) => Math.max(0, prev - 1))
                        setIsFlipped(false)
                      }}
                      leftIcon={<ChevronLeft className="h-4 w-4" />}
                    >
                      Previous
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFlipped(!isFlipped)}
                      leftIcon={<RotateCw className="h-3.5 w-3.5" />}
                    >
                      Flip Card
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      disabled={cardIndex >= (flashcardsData?.totalCards || 1) - 1}
                      onClick={() => {
                        setCardIndex((prev) => prev + 1)
                        setIsFlipped(false)
                      }}
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                    >
                      Next Card
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 4: REVISION GUIDE */}
          {activeTab === "revision" && (
            <div className="space-y-4">
              {isRevisionLoading ? (
                <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
                  <div className="flex justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Analyzing revision priorities...</p>
                </div>
              ) : revisionError ? (
                <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <span>{revisionError}</span>
                  <Button variant="outline" size="sm" onClick={loadRevision}>
                    Retry
                  </Button>
                </div>
              ) : revisionData ? (
                <div className="space-y-4">
                  {/* High Priority */}
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-rose-500" />
                      <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wide">
                        High Priority Concepts (Master First)
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {revisionData.revisionPlan.highPriority.map((item, i) => (
                        <div key={i} className="rounded-lg bg-card/80 p-2.5 border border-rose-500/20 text-xs">
                          <p className="font-semibold text-foreground">{item.topic}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medium Priority */}
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wide">
                        Medium Priority (Core Mechanics)
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {revisionData.revisionPlan.mediumPriority.map((item, i) => (
                        <div key={i} className="rounded-lg bg-card/80 p-2.5 border border-amber-500/20 text-xs">
                          <p className="font-semibold text-foreground">{item.topic}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Review */}
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wide">
                        Quick Review (Definitions & Syntax)
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {revisionData.revisionPlan.quickReview.map((item, i) => (
                        <div key={i} className="rounded-lg bg-card/80 p-2.5 border border-blue-500/20 text-xs">
                          <p className="font-semibold text-foreground">{item.topic}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-border/60 pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AiLearningToolsModal
