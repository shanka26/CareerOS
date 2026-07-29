import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const schema = readFileSync(join(process.cwd(), "prisma", "schema.prisma"), "utf8");
const migration = readFileSync(join(process.cwd(), "prisma", "migrations", "20260729160000_initial", "migration.sql"), "utf8");

describe("database safety contract", () => {
  it("keeps AI suggestions pending by default", () => {
    expect(schema).toMatch(/status\s+MemorySuggestionStatus\s+@default\(PENDING\)/);
  });

  it("links applications to composite document and version identities", () => {
    expect(schema).toContain("fields: [resumeDocumentId, resumeVersionId]");
    expect(schema).toContain("fields: [coverLetterDocumentId, coverLetterVersionId]");
  });

  it("enables pgvector before creating vector columns", () => {
    expect(migration.indexOf("CREATE EXTENSION IF NOT EXISTS vector")).toBeGreaterThan(-1);
    expect(migration.indexOf("CREATE EXTENSION IF NOT EXISTS vector")).toBeLessThan(migration.indexOf('CREATE TABLE "knowledge_embedding"'));
  });
});
