export interface LLMConfig {
  defaultProvider: "gemini" | "openai" | "local"
  geminiModel: string
  openaiModel: string
  temperature: number
  maxOutputTokens: number
  timeoutMs: number
}

export const LLM_CONFIG: LLMConfig = {
  defaultProvider: (process.env.LLM_PROVIDER as any) || (process.env.GEMINI_API_KEY ? "gemini" : process.env.OPENAI_API_KEY ? "openai" : "local"),
  geminiModel: process.env.GEMINI_LLM_MODEL || "gemini-1.5-flash",
  openaiModel: process.env.OPENAI_LLM_MODEL || "gpt-4o-mini",
  temperature: 0.3, // Low temperature for deterministic, grounded factual synthesis
  maxOutputTokens: 4096, // Ample tokens for 5+ questions and detailed summaries
  timeoutMs: 30000, // 30s timeout limit
}
