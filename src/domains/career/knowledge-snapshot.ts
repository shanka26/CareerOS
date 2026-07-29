import { createHash } from "node:crypto";

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  return value;
}

export function serializeKnowledgeFacts(facts: unknown) {
  return JSON.stringify(canonicalize(facts));
}

export function checksumKnowledgeFacts(facts: unknown) {
  return createHash("sha256").update(serializeKnowledgeFacts(facts)).digest("hex");
}
