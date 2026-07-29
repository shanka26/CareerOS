import { describe, expect, it } from "vitest";
import { analyzeJobText } from "./analyze";

describe("job analysis", () => {
  it("matches only supplied verified skills", () => {
    const result = analyzeJobText("Staff Engineer\nAcme\nRequirements: TypeScript and Rust", ["TypeScript", "React"]);
    expect(result.matchedSkills).toEqual(["TypeScript"]);
    expect(result.score).toBe(50);
  });

  it("extracts explicitly labeled structured fields without inference", () => {
    const result = analyzeJobText("Title: Staff Engineer\nCompany: Acme\nLocation: Chicago, IL\nJob type: Full-time\nSalary: $150,000 - $180,000\nQualifications: 8 years", []);
    expect(result).toMatchObject({ title: "Staff Engineer", company: "Acme", location: "Chicago, IL", employmentType: "Full-time", salary: { sourceText: "$150,000 - $180,000" } });
    expect(result.requirements).toEqual(["Qualifications: 8 years"]);
  });
});
