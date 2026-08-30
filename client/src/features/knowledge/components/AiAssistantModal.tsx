import * as React from "react"
import { Button } from "@/components/ui"
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  FileText,
  FileCode,
  FileType,
  AlertCircle,
  BookOpen,
  X,
  Bot,
  User as UserIcon,
  MessageSquare,
  Clock,
  ExternalLink,
} from "lucide-react"
import {
  ragApi,
  RagConversationSummary,
  RagConversationDetail,
  RagMessage,
  VerifiedSource,
} from "@/services/rag.api"
import type { KnowledgeDocument, DocumentType } from "../knowledge.types"
import { cn } from "@/lib/utils"

export interface AiAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  documents: KnowledgeDocument[]
  initialDocumentId?: string
}

function getFileIcon(type?: DocumentType | null) {
  switch (type) {
    case "PDF":
      return <FileText className="h-3.5 w-3.5 text-rose-500" />
    case "MD":
      return <FileCode className="h-3.5 w-3.5 text-purple-500" />
    case "TXT":
    default:
      return <FileType className="h-3.5 w-3.5 text-blue-500" />
  }
}

function formatRelativeTime(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return "just now"
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  } catch {
    return ""
  }
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  documents,
  initialDocumentId,
}) => {
  const [conversations, setConversations] = React.useState<RagConversationSummary[]>([])
  const [currentConv, setCurrentConv] = React.useState<RagConversationDetail | null>(null)
  const [selectedDocId, setSelectedDocId] = React.useState<string>(initialDocumentId || "")
  const [inputText, setInputText] = React.useState("")
  const [isLoadingConv, setIsLoadingConv] = React.useState(false)
  const [isSending, setIsSending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showHistorySidebar, setShowHistorySidebar] = React.useState(true)

  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const readyDocuments = React.useMemo(
    () => documents.filter((d) => d.status === "READY"),
    [documents]
  )

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Load conversation list when modal opens
  React.useEffect(() => {
    if (!isOpen) return

    const initConversations = async () => {
      setIsLoadingConv(true)
      setError(null)
      try {
        const list = await ragApi.listConversations()
        setConversations(list)

        if (initialDocumentId) {
          // Check if there's an existing conversation for this doc
          const existing = list.find((c) => c.documentId === initialDocumentId)
          if (existing) {
            const detail = await ragApi.getConversation(existing.id)
            setCurrentConv(detail)
            setSelectedDocId(initialDocumentId)
          } else {
            // Start fresh session scoped to this doc
            const doc = documents.find((d) => d.id === initialDocumentId)
            const title = doc ? `Chat: ${doc.title}` : "New AI Chat"
            const newConv = await ragApi.createConversation({
              title,
              documentId: initialDocumentId,
            })
            setCurrentConv(newConv)
            setSelectedDocId(initialDocumentId)
            setConversations((prev) => [
              {
                id: newConv.id,
                title: newConv.title,
                documentId: newConv.documentId,
                documentName: doc?.title || null,
                documentType: doc?.fileType || null,
                messageCount: 0,
                createdAt: newConv.createdAt,
                updatedAt: newConv.updatedAt,
              },
              ...prev,
            ])
          }
        } else if (list.length > 0) {
          const detail = await ragApi.getConversation(list[0].id)
          setCurrentConv(detail)
          setSelectedDocId(detail.documentId || "")
        } else {
          // No conversations exist yet, create default
          const newConv = await ragApi.createConversation({ title: "New AI Chat" })
          setCurrentConv(newConv)
          setConversations([
            {
              id: newConv.id,
              title: newConv.title,
              messageCount: 0,
              createdAt: newConv.createdAt,
              updatedAt: newConv.updatedAt,
            },
          ])
        }
      } catch (err: any) {
        setError(err.message || "Failed to initialize AI Chat.")
      } finally {
        setIsLoadingConv(false)
      }
    }

    initConversations()
  }, [isOpen, initialDocumentId])

  // Scroll to bottom on message list change
  React.useEffect(() => {
    scrollToBottom()
  }, [currentConv?.messages, isSending])

  // Escape key handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSending) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isSending, onClose])

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

  if (!isOpen) return null

  // Switch active conversation
  const handleSelectConversation = async (convId: string) => {
    if (currentConv?.id === convId || isSending) return
    setIsLoadingConv(true)
    setError(null)
    try {
      const detail = await ragApi.getConversation(convId)
      setCurrentConv(detail)
      setSelectedDocId(detail.documentId || "")
    } catch (err: any) {
      setError(err.message || "Failed to load conversation.")
    } finally {
      setIsLoadingConv(false)
    }
  }

  // Create new conversation
  const handleNewChat = async () => {
    if (isSending) return
    setIsLoadingConv(true)
    setError(null)
    try {
      const doc = selectedDocId ? documents.find((d) => d.id === selectedDocId) : undefined
      const title = doc ? `Chat: ${doc.title}` : "New AI Chat"
      const newConv = await ragApi.createConversation({
        title,
        documentId: selectedDocId || undefined,
      })
      setCurrentConv(newConv)
      setConversations((prev) => [
        {
          id: newConv.id,
          title: newConv.title,
          documentId: newConv.documentId,
          documentName: doc?.title || null,
          documentType: doc?.fileType || null,
          messageCount: 0,
          createdAt: newConv.createdAt,
          updatedAt: newConv.updatedAt,
        },
        ...prev,
      ])
    } catch (err: any) {
      setError(err.message || "Failed to start new chat.")
    } finally {
      setIsLoadingConv(false)
    }
  }

  // Delete conversation
  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSending) return
    try {
      await ragApi.deleteConversation(convId)
      const remaining = conversations.filter((c) => c.id !== convId)
      setConversations(remaining)

      if (currentConv?.id === convId) {
        if (remaining.length > 0) {
          const detail = await ragApi.getConversation(remaining[0].id)
          setCurrentConv(detail)
        } else {
          handleNewChat()
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete conversation.")
    }
  }

  // Send message in current conversation
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim()
    if (!text || isSending || !currentConv) return

    setInputText("")
    setIsSending(true)
    setError(null)

    // Optimistically append user message
    const tempUserMsg: RagMessage = {
      id: `temp-${Date.now()}`,
      conversationId: currentConv.id,
      sender: "USER",
      content: text,
      hasContext: true,
      createdAt: new Date().toISOString(),
    }

    setCurrentConv((prev) =>
      prev ? { ...prev, messages: [...prev.messages, tempUserMsg] } : null
    )

    try {
      const response = await ragApi.sendMessage(currentConv.id, { content: text })

      setCurrentConv((prev) => {
        if (!prev) return null
        const filtered = prev.messages.filter((m) => m.id !== tempUserMsg.id)
        return {
          ...prev,
          messages: [...filtered, response.userMessage, response.assistantMessage],
        }
      })

      // Update conversation list item
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === currentConv.id) {
            return {
              ...c,
              lastMessage: text,
              messageCount: c.messageCount + 2,
              updatedAt: new Date().toISOString(),
            }
          }
          return c
        })
      )
    } catch (err: any) {
      setError(err.message || "Failed to generate grounded answer.")
      // Remove optimistic message if failed
      setCurrentConv((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.filter((m) => m.id !== tempUserMsg.id),
            }
          : null
      )
    } finally {
      setIsSending(false)
    }
  }

  const starterPrompts = [
    "What are the most important concepts in my uploaded notes?",
    "Summarize the key principles and operational steps.",
    "Give me 3 practice scenario questions based on this material.",
    "Explain the core differences between the main topics covered.",
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-sm animate-in fade-in-0"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSending) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-dialog-title"
        className="relative w-full max-w-5xl rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 h-[88vh] flex flex-col overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5 bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 id="assistant-dialog-title" className="text-sm font-bold text-foreground sm:text-base">
                  SkillSync AI Learning Assistant
                </h2>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                  Grounded & Saved
                </span>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Multi-turn study conversations grounded in your personal knowledge base.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHistorySidebar(!showHistorySidebar)}
              className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors inline-flex items-center gap-1.5"
              title="Toggle chat history sidebar"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {showHistorySidebar ? "Hide History" : "Past Chats"}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Area: Sidebar + Chat Stream */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar: Conversation History */}
          {showHistorySidebar && (
            <div className="w-64 sm:w-72 border-r border-border/60 bg-muted/10 flex flex-col shrink-0 animate-in slide-in-from-left-2 duration-200">
              {/* New Chat Button */}
              <div className="p-3 border-b border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewChat}
                  disabled={isLoadingConv || isSending}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  className="w-full justify-start text-xs font-semibold"
                >
                  New Conversation
                </Button>
              </div>

              {/* Chat Session List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No past conversations yet.
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isActive = currentConv?.id === conv.id
                    return (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv.id)}
                        className={cn(
                          "group flex items-start justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer select-none",
                          isActive
                            ? "bg-primary/10 text-foreground border border-primary/20 font-medium"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                        )}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            {conv.documentType ? (
                              getFileIcon(conv.documentType)
                            ) : (
                              <MessageSquare className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                            )}
                            <p className="truncate font-semibold text-[11px] text-foreground">
                              {conv.title}
                            </p>
                          </div>
                          {conv.lastMessage && (
                            <p className="truncate text-[10px] text-muted-foreground mt-0.5">
                              {conv.lastMessage}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground/80">
                            <span className="inline-flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {formatRelativeTime(conv.updatedAt)}
                            </span>
                            <span>•</span>
                            <span>{conv.messageCount} msgs</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all"
                          title="Delete conversation"
                          aria-label="Delete conversation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* Right Area: Active Chat */}
          <div className="flex-1 flex flex-col min-w-0 bg-background/50">
            {/* Scope Bar */}
            <div className="flex items-center justify-between border-b border-border/40 px-4 py-2 bg-card/50 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Knowledge Scope:
                </span>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  disabled={isSending}
                  className="h-7 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-[220px] truncate"
                >
                  <option value="">All Uploaded Materials</option>
                  {readyDocuments.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title}
                    </option>
                  ))}
                </select>
              </div>

              {currentConv?.document && (
                <div className="flex items-center gap-1 text-[11px] text-primary">
                  <BookOpen className="h-3 w-3" />
                  <span className="truncate max-w-[180px]">{currentConv.document.title}</span>
                </div>
              )}
            </div>

            {/* Error Banner */}
            {error && (
              <div className="m-3 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-xs font-semibold hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentConv?.messages.length === 0 ? (
                /* Empty Chat Starter */
                <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto py-8">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    Ask your Learning Assistant
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-6">
                    Every answer is strictly grounded in your indexed notes with verified source citations.
                  </p>

                  <div className="w-full space-y-2 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                      Suggested prompts:
                    </p>
                    {starterPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className="w-full text-left rounded-xl border border-border/80 bg-card p-3 text-xs text-foreground/90 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-between group shadow-2xs"
                      >
                        <span className="truncate">{prompt}</span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Message Stream */
                currentConv?.messages.map((msg) => {
                  const isUser = msg.sender === "USER"
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3 max-w-3xl",
                        isUser ? "ml-auto justify-end" : "mr-auto justify-start"
                      )}
                    >
                      {!isUser && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-1">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}

                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-2 shadow-2xs max-w-[85%]",
                          isUser
                            ? "bg-primary text-primary-foreground rounded-tr-xs"
                            : "bg-card border border-border text-foreground rounded-tl-xs"
                        )}
                      >
                        <div className="whitespace-pre-line font-sans">{msg.content}</div>

                        {/* Verified Source Citations */}
                        {!isUser && msg.sources && msg.sources.length > 0 && (
                          <div className="pt-2 border-t border-border/50 space-y-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                              <BookOpen className="h-3 w-3 text-primary" />
                              Verified Excerpt Sources ({msg.sources.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.sources.map((src: VerifiedSource, i: number) => {
                                const matchPct = Math.round(src.matchScore * 100)
                                return (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 rounded-md bg-muted/40 border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground"
                                  >
                                    <span className="font-semibold text-foreground truncate max-w-[120px]">
                                      {src.documentName}
                                    </span>
                                    {src.pageNumber && (
                                      <span>p.{src.pageNumber}</span>
                                    )}
                                    {src.heading && (
                                      <span className="truncate max-w-[100px]">({src.heading})</span>
                                    )}
                                    <span
                                      className={cn(
                                        "font-bold",
                                        matchPct >= 70 ? "text-emerald-500" : "text-muted-foreground"
                                      )}
                                    >
                                      {matchPct}%
                                    </span>
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* No Context Warning */}
                        {!isUser && !msg.hasContext && (
                          <div className="pt-1 text-[10px] text-amber-500 font-medium">
                            ⚠️ No sufficiently matching study notes were found in your library for this turn.
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground mt-1">
                          <UserIcon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  )
                })
              )}

              {/* Sending / Thinking Indicator */}
              {isSending && (
                <div className="flex gap-3 max-w-3xl mr-auto justify-start">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-xs border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                      <span className="font-semibold text-[11px] text-primary">
                        Searching materials & synthesizing answer...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Form */}
            <div className="border-t border-border/60 p-3 bg-card">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex items-end gap-2"
              >
                <div className="relative flex-1">
                  <textarea
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Ask a question about your study materials (Press Enter to send)..."
                    disabled={isSending}
                    className="w-full resize-none rounded-xl border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-2xs"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSending || !inputText.trim()}
                  isLoading={isSending}
                  rightIcon={<Send className="h-3.5 w-3.5" />}
                  className="h-10 px-4 shrink-0 rounded-xl"
                >
                  Send
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiAssistantModal
