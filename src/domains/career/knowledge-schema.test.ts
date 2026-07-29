import { describe, expect, it } from "vitest";
import { careerKnowledgeSchema } from "./knowledge-schema";

describe("manual career knowledge", () => {
  it("accepts each user-authored fact type", () => {
    expect(careerKnowledgeSchema.safeParse({ kind: "skill", name: "TypeScript", category: "Language" }).success).toBe(true);
    expect(careerKnowledgeSchema.safeParse({ kind: "achievement", experienceId: "experience", description: "Improved reliability" }).success).toBe(true);
    expect(careerKnowledgeSchema.safeParse({ kind: "project", name: "Compiler", description: "Built a compiler", technologies: ["Rust"] }).success).toBe(true);
    expect(careerKnowledgeSchema.safeParse({ kind: "education", school: "State University", graduationDate: "2024-05-01" }).success).toBe(true);
    expect(careerKnowledgeSchema.safeParse({ kind: "certification", name: "Cloud", issuer: "Vendor" }).success).toBe(true);
  });

  it("rejects empty or oversized factual entries", () => {
    expect(careerKnowledgeSchema.safeParse({ kind: "project", name: "", description: "" }).success).toBe(false);
  });
});
