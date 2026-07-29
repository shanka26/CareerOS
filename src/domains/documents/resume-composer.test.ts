import { describe, expect, it } from "vitest";
import { composeVerifiedResume } from "./resume-composer";

describe("resume composer", () => {
  it("uses only supplied verified facts and explains ordering", () => {
    const result = composeVerifiedResume({ name: "Ada", skills: [{ id: "s1", name: "Rust" }, { id: "s2", name: "TypeScript" }], experiences: [{ id: "e1", company: "Acme", title: "Engineer", description: "Built tools", achievements: [{ id: "a1", description: "Reduced latency", metric: "20%" }] }], projects: [{ id: "p1", name: "Compiler", description: "Built in Rust", technologies: ["Rust"] }] }, { title: "Rust Engineer", company: "Beta", description: "Rust systems" });
    expect(result.markdown).toContain("Rust, TypeScript");
    expect(result.markdown).toContain("Reduced latency (20%)");
    expect(result.markdown).toContain("Compiler");
    expect(result.markdown).not.toContain("Kubernetes");
    expect(result.explanations.flatMap((explanation) => explanation.factIds)).toEqual(expect.arrayContaining(["s1", "a1", "p1"]));
  });
});
