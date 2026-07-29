import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";
import { promptVersions } from "./capabilities";
import type { AIProvider, AIRequest, AIResult } from "./provider";

export class OpenAIResponsesProvider implements AIProvider {
  private readonly client: OpenAI;
  constructor(private readonly apiKey: string, private readonly model = "gpt-5.6-terra") { this.client = new OpenAI({ apiKey }); }

  async generate<TSchema extends z.ZodType>(request: AIRequest<TSchema>): Promise<AIResult<z.infer<TSchema>>> {
    const started = Date.now();
    const response = await this.client.responses.parse({
      model: this.model,
      instructions: `${request.instructions}\nPrompt version: ${promptVersions[request.capability]}\nNever add a factual claim that is not supported by the supplied verified facts. Explain material recommendations.`,
      input: JSON.stringify(request.input),
      text: { format: zodTextFormat(request.outputSchema, request.schemaName) },
      safety_identifier: request.safetyIdentifier,
      store: false,
    });
    if (!response.output_parsed) throw new Error("The AI response did not match the required structured output.");
    const data = request.outputSchema.parse(response.output_parsed);
    return { data, provider: "openai", model: this.model, durationMs: Date.now() - started };
  }
}
