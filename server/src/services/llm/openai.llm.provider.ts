import { ILLMProvider, LLMGenerationOptions, LLMResponse } from "./llm.types"
import { LLM_CONFIG } from "./llm.config"
import { localLLMProvider } from "./local.llm.provider"

export class OpenAILLMProvider implements ILLMProvider {
  readonly name = "openai"
  readonly model = LLM_CONFIG.openaiModel

  private getApiKey(): string | undefined {
    return process.env.OPENAI_API_KEY
  }

  async generateAnswer(
    systemPrompt: string,
    userPrompt: string,
    options?: LLMGenerationOptions
  ): Promise<LLMResponse> {
    const apiKey = this.getApiKey()
    if (!apiKey) {
      return await localLLMProvider.generateAnswer(systemPrompt, userPrompt, options)
    }

    const timeoutMs = options?.timeoutMs || LLM_CONFIG.timeoutMs
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: options?.temperature ?? LLM_CONFIG.temperature,
          max_tokens: options?.maxTokens ?? LLM_CONFIG.maxOutputTokens,
        }),
      })

      if (!response.ok) {
        console.warn(
          `[OpenAILLMProvider] API returned status ${response.status}. Falling back to local synthesizer.`
        )
        return await localLLMProvider.generateAnswer(systemPrompt, userPrompt, options)
      }

      const data = (await response.json()) as any
      const content = data?.choices?.[0]?.message?.content

      if (!content || typeof content !== "string") {
        console.warn(
          `[OpenAILLMProvider] Invalid choice content. Falling back to local synthesizer.`
        )
        return await localLLMProvider.generateAnswer(systemPrompt, userPrompt, options)
      }

      return {
        text: content.trim(),
        model: this.model,
        provider: this.name,
      }
    } catch (err: any) {
      console.warn(
        `[OpenAILLMProvider] Network/API error: ${err.message}. Falling back to local synthesizer.`
      )
      return await localLLMProvider.generateAnswer(systemPrompt, userPrompt, options)
    } finally {
      clearTimeout(timeoutId)
    }
  }
}

export const openAILLMProvider = new OpenAILLMProvider()
