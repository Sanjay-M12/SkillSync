import { ILLMProvider, LLMGenerationOptions, LLMResponse } from "./llm.types"

export class LocalLLMProvider implements ILLMProvider {
  readonly name = "local"
  readonly model = "local-grounded-synthesizer"

  async generateAnswer(
    _systemPrompt: string,
    userPrompt: string,
    _options?: LLMGenerationOptions
  ): Promise<LLMResponse> {
    // Extract question from user prompt
    const questionMatch = userPrompt.match(/QUESTION:\s*([\s\S]+?)(?:\n\s*Please synthesize|\n\s*REFERENCE CONTEXT|\n\s*===|$)/i)
    const question = questionMatch ? questionMatch[1].trim() : "your inquiry"

    // Extract reference chunks between the separator bars
    const contextMatch = userPrompt.match(/={10,}\s*([\s\S]+?)\s*={10,}/i)
    const contextText = contextMatch ? contextMatch[1].trim() : userPrompt

    if (!contextText || contextText.length < 15) {
      return {
        text: "I couldn't find enough relevant information in your uploaded learning materials to answer that question. Try asking a more specific question or uploading additional notes.",
        model: this.model,
        provider: this.name,
      }
    }

    // Extract key sentences and bullet points from the reference text
    const rawLines = contextText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("===") && !l.startsWith("[SOURCE") && !l.startsWith("---"))

    const cleanedLines = rawLines.filter((l) => !l.startsWith("http"))
    const summaryPoints = cleanedLines.filter((p) => p.length >= 15).slice(0, 8)

    const pointsList = summaryPoints.length > 0
      ? summaryPoints.map((p) => `• ${p.replace(/^[-*•]\s*/, "")}`)
      : ["• Key concepts and material found in the uploaded document."]

    const answer = [
      `Here is what your uploaded study material says regarding **${question}**:`,
      "",
      ...pointsList,
    ].join("\n")

    return {
      text: answer,
      model: this.model,
      provider: this.name,
    }
  }
}

export const localLLMProvider = new LocalLLMProvider()
