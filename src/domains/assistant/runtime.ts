import "server-only";

import { createHash } from "node:crypto";
import { serverEnv } from "@/config/server-env";
import { OpenAIResponsesProvider } from "./openai-provider";

export function getConfiguredAIProvider() {
  if (!serverEnv.OPENAI_API_KEY) return null;
  return new OpenAIResponsesProvider(serverEnv.OPENAI_API_KEY, serverEnv.OPENAI_MODEL);
}

export function getConfiguredAIModel() {
  return serverEnv.OPENAI_MODEL;
}

export function createSafetyIdentifier(userId: string) {
  return createHash("sha256").update(`careeros:${userId}`).digest("hex");
}
