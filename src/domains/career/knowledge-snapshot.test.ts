import { describe, expect, it } from "vitest";

import { checksumKnowledgeFacts, serializeKnowledgeFacts } from "./knowledge-snapshot";

describe("knowledge snapshots", () => {
  it("produces the same checksum regardless of object key order", () => {
    expect(checksumKnowledgeFacts({ skills: ["TypeScript"], name: "Ada" })).toBe(checksumKnowledgeFacts({ name: "Ada", skills: ["TypeScript"] }));
  });

  it("preserves array order because it can carry semantic ordering", () => {
    expect(serializeKnowledgeFacts({ roles: ["Engineer", "Lead"] })).not.toBe(serializeKnowledgeFacts({ roles: ["Lead", "Engineer"] }));
  });
});
