import { describe, expect, it } from "vitest";

import { assertResumeAnalysisGrounded } from "./analysis";
import { resumeAnalysisSchema, type ResumeAnalysis } from "./analysis-schema";

function emptyField(value: string | null = null, evidence: string[] = []) {
  return { value, evidence };
}

function analysis(overrides: Partial<ResumeAnalysis> = {}): ResumeAnalysis {
  return resumeAnalysisSchema.parse({
    profile: {
      headline: emptyField(),
      summary: emptyField(),
      targetRole: emptyField(),
      preferredLocations: { values: [], evidence: [] },
      remotePreference: { value: null, evidence: [] },
      careerGoals: { values: [], evidence: [] },
      salaryExpectation: emptyField(),
    },
    experiences: [],
    skills: [],
    projects: [],
    education: [],
    certifications: [],
    additionalFacts: [],
    report: {
      executiveSummary: { text: "The resume identifies Ada as an engineer.", evidence: ["Ada Lovelace — Engineer"] },
      strengths: [],
      improvementOpportunities: [],
      missingFields: ["Salary expectation"],
      followUpQuestions: ["What salary range are you targeting?"],
    },
    ...overrides,
  });
}

describe("grounded AI resume analysis", () => {
  it("accepts comprehensive fields whose exact evidence appears in the resume", () => {
    const value = analysis({
      skills: [{ name: "TypeScript", category: "Programming language", proficiency: null, evidence: ["Skills: TypeScript"] }],
    });

    expect(assertResumeAnalysisGrounded(value, "Ada Lovelace — Engineer\nSkills: TypeScript")).toBe(value);
  });

  it("rejects any cited excerpt that is absent from the resume", () => {
    const value = analysis({
      skills: [{ name: "Rust", category: "Programming language", proficiency: null, evidence: ["Skills: Rust"] }],
    });

    expect(() => assertResumeAnalysisGrounded(value, "Ada Lovelace — Engineer\nSkills: TypeScript")).toThrow("not present");
  });

  it("rejects a key value that does not appear in its attached evidence", () => {
    const value = analysis({
      skills: [{ name: "Rust", category: "Programming language", proficiency: null, evidence: ["Skills: TypeScript"] }],
    });

    expect(() => assertResumeAnalysisGrounded(value, "Ada Lovelace — Engineer\nSkills: TypeScript")).toThrow("skill was not present");
  });

  it("rejects populated profile values without evidence", () => {
    const value = analysis({
      profile: {
        headline: emptyField("Engineer"),
        summary: emptyField(),
        targetRole: emptyField(),
        preferredLocations: { values: [], evidence: [] },
        remotePreference: { value: null, evidence: [] },
        careerGoals: { values: [], evidence: [] },
        salaryExpectation: emptyField(),
      },
    });

    expect(() => assertResumeAnalysisGrounded(value, "Ada Lovelace — Engineer")).toThrow("without resume evidence");
  });
});
