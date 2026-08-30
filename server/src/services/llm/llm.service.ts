import { ILLMProvider, LLMGenerationOptions, LLMResponse } from "./llm.types"
import { LLM_CONFIG } from "./llm.config"
import { geminiLLMProvider } from "./gemini.llm.provider"
import { openAILLMProvider } from "./openai.llm.provider"
import { localLLMProvider } from "./local.llm.provider"

export class LLMService {
  private getProvider(): ILLMProvider {
    switch (LLM_CONFIG.defaultProvider) {
      case "openai":
        return openAILLMProvider
      case "gemini":
        return geminiLLMProvider
      case "local":
      default:
        if (process.env.GEMINI_API_KEY) return geminiLLMProvider
        if (process.env.OPENAI_API_KEY) return openAILLMProvider
        return localLLMProvider
    }
  }

  async generateAnswer(
    systemPrompt: string,
    userPrompt: string,
    options?: LLMGenerationOptions
  ): Promise<LLMResponse> {
    const provider = this.getProvider()
    return await provider.generateAnswer(systemPrompt, userPrompt, options)
  }
}

export const llmService = new LLMService()
