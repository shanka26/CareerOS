import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { JobSearch } from "./job-search";
import type { JobSearchResult } from "./search/types";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const baseJob: JobSearchResult = {
  id: "one", source: "one", sourceLabel: "Source One", title: "Platform Engineer", company: "Acme",
  location: "Remote", remote: true, description: "Build TypeScript services", url: "https://example.com/one",
  postedAt: "2026-08-01T00:00:00.000Z", employmentType: "Full-time", salaryMin: 120000,
  salaryMax: 150000, salaryCurrency: "USD", matchedSkills: ["TypeScript"], matchScore: 90,
};

describe("JobSearch", () => {
  beforeEach(() => {
    push.mockReset();
    vi.restoreAllMocks();
  });

  it("searches, displays attributed results, and filters by source", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      results: [baseJob, { ...baseJob, id: "two", source: "two", sourceLabel: "Source Two", title: "Backend Engineer", matchScore: 70 }],
      providers: [{ id: "one", label: "Source One", status: "ok", resultCount: 1 }, { id: "two", label: "Source Two", status: "ok", resultCount: 1 }],
      suggestions: { keywords: ["TypeScript"], prompts: ["Platform Engineer"] },
    }), { status: 200 }));
    render(<JobSearch initialSuggestions={{ keywords: ["TypeScript"], prompts: ["Platform Engineer"] }} />);

    fireEvent.click(screen.getByRole("button", { name: "Search jobs" }));
    expect(await screen.findByText("Backend Engineer")).toBeVisible();
    expect(screen.getByText("Platform Engineer", { selector: "h3" })).toBeVisible();
    expect(screen.getByText("Source One: 1")).toBeVisible();

    fireEvent.change(screen.getByLabelText("Source"), { target: { value: "two" } });
    await waitFor(() => expect(screen.queryByText("Platform Engineer", { selector: "h3" })).not.toBeInTheDocument());
    expect(screen.getByText("Backend Engineer")).toBeVisible();
  });
});
