import { afterEach, describe, expect, it, vi } from "vitest";
import { htmlToPlainText, searchRemoteJobs } from "./job-search";

afterEach(() => vi.restoreAllMocks());

describe("job discovery", () => {
  it("turns provider HTML into readable plain text", () => {
    expect(htmlToPlainText("<h2>Role &amp; team</h2><ul><li>TypeScript</li><li>React</li></ul>"))
      .toBe("Role & team\n\nTypeScript\nReact");
  });

  it("normalizes and filters remote jobs", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ jobs: [
      { id: 7, url: "https://remotive.com/remote-jobs/software-dev/platform-engineer-7", title: "Platform Engineer", company_name: "Acme", category: "Software Development", job_type: "full_time", publication_date: "2026-07-20T12:00:00", candidate_required_location: "USA", salary: "$150k", description: "<p>Build with TypeScript.</p>" },
      { id: 8, url: "https://remotive.com/remote-jobs/design/product-designer-8", title: "Product Designer", company_name: "Beta", category: "Design", job_type: "contract", publication_date: null, candidate_required_location: "Europe", salary: null, description: "Design products." },
    ] }), { headers: { "content-type": "application/json" } }));

    await expect(searchRemoteJobs({ query: "typescript", location: "usa" })).resolves.toEqual([
      expect.objectContaining({ source: "Remotive", sourceId: "7", title: "Platform Engineer", employmentType: "full time", description: "Build with TypeScript." }),
    ]);
  });

  it("fails closed on an invalid provider payload", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ results: [] })));
    await expect(searchRemoteJobs({})).rejects.toThrow(/unexpected response/);
  });
});
