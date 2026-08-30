import { ILLMProvider, LLMGenerationOptions, LLMResponse } from "./llm.types"
import { LLM_CONFIG } from "./llm.config"
import { localLLMProvider } from "./local.llm.provider"

export class GeminiLLMProvider implements ILLMProvider {
  readonly name = "gemini"
  readonly model = LLM_CONFIG.geminiModel

  private getApiKey(): string | undefined {
    return process.env.GEMINI_API_KEY
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
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`

      const generationConfig: Record<string, any> = {
        temperature: options?.temperature ?? LLM_CONFIG.temperature,
        maxOutputTokens: options?.maxTokens ?? LLM_CONFIG.maxOutputTokens,
      }

      if (systemPrompt.includes("JSON") || systemPrompt.includes("json")) {
        generationConfig.responseMimeType = "application/json"
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => "")
        console.warn(
          `[GeminiLLMProvider] API error (${response.status}): ${errorText.slice(0, 300)}. Falling back to local synthesizer.`
        )
        return await localLLMProvider.generateAnswer(systemPrompt, userPrompt, options)
      }

      const data = (await response.json()) as any
      const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text

      if (!candidate || typeof candidate !== "string") {
        console.warn(
          `[GeminiLLMProvider] Invalid candidate response. Falling back to local synthesizer.`
        )
        return await localLLMProvider.generateAnswer(systemPrompt, userPrompt, options)
      }

      return {
        text: candidate.trim(),
        model: this.model,
        provider: this.name,
      }
    } catch (err: any) {
      console.warn(
        `[GeminiLLMProvider] Network/API error: ${err.message}. Falling back to local synthesizer.`
      )
      return await localLLMProvider.generateAnswer(systemPrompt, userPrompt, options)
    } finally {
      clearTimeout(timeoutId)
    }
  }
}

export const geminiLLMProvider = new GeminiLLMProvider()
