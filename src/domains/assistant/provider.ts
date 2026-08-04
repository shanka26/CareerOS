import type { z } from "zod";
import type { AICapability } from "./capabilities";

export interface AIRequest<TSchema extends z.ZodType> {
  capability: AICapability;
  instructions: string;
  input: unknown;
  outputSchema: TSchema;
  schemaName: string;
  safetyIdentifier: string;
  maxOutputTokens?: number;
}

export interface AIResult<T> { data: T; provider: string; model: string; durationMs: number; }

export interface AIProvider {
  generate<TSchema extends z.ZodType>(request: AIRequest<TSchema>): Promise<AIResult<z.infer<TSchema>>>;
}

export class MissingAIProvider implements AIProvider {
  async generate<TSchema extends z.ZodType>(request: AIRequest<TSchema>): Promise<AIResult<z.infer<TSchema>>> {
    void request;
    throw new Error("AI is not configured. Set OPENAI_API_KEY, or inject the explicit deterministic provider in tests.");
  }
}
