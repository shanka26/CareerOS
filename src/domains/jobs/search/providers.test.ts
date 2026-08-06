import { afterEach, describe, expect, it, vi } from "vitest";

import { createJobSearchProviders } from "./providers";

afterEach(() => vi.restoreAllMocks());

const query = { q: "software engineer", location: "", remote: "any" } as const;

describe("job search providers", () => {
  it("normalizes and attributes Arbeitnow listings", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ data: [{
      slug: "software-engineer", company_name: "Acme", title: "Software Engineer",
      description: "<p>Build reliable products</p>", remote: true, url: "https://www.arbeitnow.com/jobs/software-engineer",
      tags: ["typescript"], job_types: ["Full-time"], location: "Berlin", created_at: 1_785_520_000,
    }] }), { headers: { "content-type": "application/json" } }));
    const provider = createJobSearchProviders({ adzunaCountry: "us" }).find(({ id }) => id === "arbeitnow-de");

    const results = await provider!.search(query, AbortSignal.timeout(1_000));

    expect(results[0]).toMatchObject({ sourceLabel: "Arbeitnow Germany", title: "Software Engineer", description: "Build reliable products", remote: true });
  });

  it("keeps credentialed providers disabled until both required values exist", () => {
    const providers = createJobSearchProviders({ adzunaCountry: "us", adzunaAppId: "id" });

    expect(providers.find(({ id }) => id === "adzuna")?.enabled).toBe(false);
    expect(providers.find(({ id }) => id === "usajobs")?.enabled).toBe(false);
    expect(providers.find(({ id }) => id === "muse")?.enabled).toBe(false);
  });

  it("normalizes Adzuna salaries and filters remote-only searches", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ results: [{
      id: "42", title: "Software Engineer", description: "Work remotely on TypeScript",
      redirect_url: "https://www.adzuna.com/details/42", created: "2026-08-01T00:00:00Z",
      salary_min: 120000, salary_max: 150000, contract_time: "full_time",
      company: { display_name: "Acme" }, location: { display_name: "Remote" },
    }] }), { headers: { "content-type": "application/json" } }));
    const provider = createJobSearchProviders({ adzunaCountry: "us", adzunaAppId: "id", adzunaAppKey: "key" }).find(({ id }) => id === "adzuna");

    const results = await provider!.search({ ...query, remote: "remote" }, AbortSignal.timeout(1_000));

    expect(results[0]).toMatchObject({ salaryMin: 120000, salaryMax: 150000, salaryCurrency: "USD", remote: true });
  });
});
