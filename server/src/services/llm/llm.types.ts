export interface LLMGenerationOptions {
  temperature?: number
  maxTokens?: number
  timeoutMs?: number
}

export interface LLMResponse {
  text: string
  model: string
  provider: string
}

export interface ILLMProvider {
  readonly name: string
  readonly model: string
  generateAnswer(
    systemPrompt: string,
    userPrompt: string,
    options?: LLMGenerationOptions
  ): Promise<LLMResponse>
}
