import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { StoredResumeAnalysis } from "./analysis-schema";
import { ResumeReviewForm } from "./review-form";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

function resumeDraft(graduationDate: string): StoredResumeAnalysis {
  const emptyValue = { value: null, evidence: [] };
  return {
    profile: {
      headline: emptyValue,
      summary: emptyValue,
      targetRole: emptyValue,
      preferredLocations: { values: [], evidence: [] },
      remotePreference: emptyValue,
      careerGoals: { values: [], evidence: [] },
      salaryExpectation: emptyValue,
    },
    experiences: [], skills: [], projects: [], certifications: [], additionalFacts: [],
    education: [{ school: "H. Lavity Stoutt Community College", degree: "Associate's degree", field: "Computer Studies", graduationDate, evidence: ["Jul 2020"] }],
    report: { executiveSummary: { text: "Resume summary", evidence: ["Resume summary"] }, strengths: [], improvementOpportunities: [], missingFields: [], followUpQuestions: [] },
    rawText: "H. Lavity Stoutt Community College Jul 2020",
    provenance: { provider: "test", model: "test" },
  };
}

describe("ResumeReviewForm validation", () => {
  beforeEach(() => {
    refresh.mockReset();
    vi.restoreAllMocks();
  });

  it("identifies, highlights, and focuses the exact invalid field", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<ResumeReviewForm suggestionId="suggestion" draft={resumeDraft("summer 2020")} />);

    fireEvent.click(screen.getByRole("button", { name: "Approve selected career facts" }));

    const field = screen.getByRole("textbox", { name: "Graduation date" });
    expect(await screen.findByRole("alert")).toHaveTextContent("Education 1 — Graduation date");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveFocus();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("accepts a common resume month and sends its normalized value", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    render(<ResumeReviewForm suggestionId="suggestion" draft={resumeDraft("Jul 2020")} />);

    fireEvent.click(screen.getByRole("button", { name: "Approve selected career facts" }));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    const request = fetchSpy.mock.calls[0]?.[1];
    const body = JSON.parse(String(request?.body)) as { education: Array<{ graduationDate: string }> };
    expect(body.education[0]?.graduationDate).toBe("2020-07");
  });
});
