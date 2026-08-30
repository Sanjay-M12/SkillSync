/**
 * Text Normalization Utility for Document Extraction
 * Cleans formatting artifacts without destroying meaningful paragraph/heading structure.
 */

export function normalizeText(rawText: string): string {
  if (!rawText) return ""

  return (
    rawText
      // 1. Standardize line endings to \n
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")

      // 2. Remove non-printable control characters except \t and \n
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")

      // 3. Replace non-breaking spaces and fancy spaces with standard space
      .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ")

      // 4. Collapse horizontal whitespace (spaces/tabs on same line) without collapsing newlines
      .replace(/[ \t]{2,}/g, " ")

      // 5. Trim trailing whitespace from each line
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")

      // 6. Collapse excessive blank lines (max 2 consecutive newlines)
      .replace(/\n{3,}/g, "\n\n")

      // 7. Trim leading and trailing whitespace from the document
      .trim()
  )
}

export function countWords(text: string): number {
  if (!text || !text.trim()) return 0
  const matches = text.trim().match(/\S+/g)
  return matches ? matches.length : 0
}
