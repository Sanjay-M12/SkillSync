import { CHUNKING_CONFIG } from "./chunking.config"

/**
 * Estimates token count based on character length and word density.
 */
export function estimateTokens(text: string): number {
  if (!text || !text.trim()) return 0
  // Standard approximation: ~4 characters per token in English
  return Math.max(1, Math.ceil(text.length / CHUNKING_CONFIG.charsPerToken))
}

/**
 * Splits text into paragraphs by double newlines.
 */
export function splitIntoParagraphs(text: string): string[] {
  if (!text) return []
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}

/**
 * Splits paragraph into sentences preserving terminal punctuation.
 */
export function splitIntoSentences(paragraph: string): string[] {
  if (!paragraph) return []
  // Matches sentence endings like ".", "!", "?" followed by whitespace or line break
  const sentenceRegex = /[^.!?\n]+(?:[.!?]+(?:\s+|\n+|$)|$)/g
  const matches = paragraph.match(sentenceRegex)

  if (!matches) {
    return [paragraph.trim()]
  }

  return matches.map((s) => s.trim()).filter((s) => s.length > 0)
}

/**
 * Extracts a tail segment from text for chunk overlapping.
 * Prioritizes complete sentences.
 */
export function extractTrailingOverlap(text: string, maxOverlapTokens: number): string {
  if (!text || maxOverlapTokens <= 0) return ""

  const maxChars = maxOverlapTokens * CHUNKING_CONFIG.charsPerToken
  if (text.length <= maxChars) {
    return text
  }

  const sentences = splitIntoSentences(text)
  if (sentences.length <= 1) {
    // Single sentence fallback: take last maxChars characters safely at word boundary
    const slice = text.slice(-maxChars)
    const firstSpace = slice.indexOf(" ")
    return firstSpace !== -1 ? slice.slice(firstSpace + 1) : slice
  }

  let overlap = ""
  for (let i = sentences.length - 1; i >= 0; i--) {
    const candidate = sentences[i] + (overlap ? " " + overlap : "")
    if (candidate.length > maxChars && overlap.length > 0) {
      break
    }
    overlap = candidate
  }

  return overlap.trim()
}
