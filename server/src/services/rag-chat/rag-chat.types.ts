import { VerifiedSource } from "../rag"
import { DocumentType } from "@prisma/client"

export interface CreateConversationDto {
  title?: string
  documentId?: string
  initialMessage?: string
}

export interface SendMessageDto {
  content: string
}

export interface RagMessageDto {
  id: string
  conversationId: string
  sender: "USER" | "ASSISTANT"
  content: string
  sources?: VerifiedSource[] | null
  hasContext: boolean
  createdAt: string
}

export interface RagConversationSummaryDto {
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

export interface RagConversationDetailDto {
  id: string
  title: string
  documentId?: string | null
  document?: {
    id: string
    title: string
    fileType: DocumentType
  } | null
  messages: RagMessageDto[]
  createdAt: string
  updatedAt: string
}
